import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { getCartApi, syncCartApi, getAuthToken, API_URL } from "../services/api";
import { io } from "socket.io-client";

export interface CartItem {
  id: string; 
  productId: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: any;
  quantity: number;
  size: string;
  color: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, "id" | "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  promoDiscount: number;
  appliedPromo: string;
  applyPromoCode: (code: string) => boolean;
  subTotal: number;
  deliveryCharge: number;
  tax: number;
  totalCost: number;
  clearCart: () => void;
  loadCart: () => Promise<void>;
  selectedAddress: { label: string; address: string } | null;
  setSelectedAddress: (address: { label: string; address: string } | null) => void;
  selectedShippingType: { type: string; eta: string; price: number } | null;
  setSelectedShippingType: (shipping: { type: string; eta: string; price: number } | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<string>("");

  const [selectedAddress, setSelectedAddress] = useState<{ label: string; address: string } | null>(null);
  const [selectedShippingType, setSelectedShippingType] = useState<{ type: string; eta: string; price: number } | null>({
    type: "Economy",
    eta: "Estimated Arrival  11\nMarch 2026",
    price: 5.0,
  });

  const loadCart = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        const res = await getCartApi();
        if (res && res.success) {
          setCartItems(res.cart || []);
          if (res.userId) {
            setUserId(res.userId);
          }
        }
      }
    } catch (error) {
      console.error("[CartContext] Error loading cart from database:", error);
    }
  };

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Listen for real-time cart updates via Socket.io
  useEffect(() => {
    if (!userId) return;

    const socketUrl = API_URL.replace("/api", "");
    console.log("[Socket Cart] Connecting to sync server at:", socketUrl);
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log("[Socket Cart] Connected to cart sync server");
    });

    socket.on(`cart_updated_${userId}`, (updatedCart: CartItem[]) => {
      console.log("[Socket Cart] Received cart update from server");
      setCartItems((prev) => {
        // Only update if there is a difference to prevent render loops
        if (JSON.stringify(prev) !== JSON.stringify(updatedCart)) {
          return updatedCart;
        }
        return prev;
      });
    });

    socket.on("disconnect", () => {
      console.log("[Socket Cart] Disconnected from sync server");
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const subTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const promoDiscount = useMemo(() => {
    if (!appliedPromo) return 0;
    const sanitized = appliedPromo.trim().toUpperCase();
    if (sanitized === "FASHION15") {
      return subTotal * 0.15; 
    }
    if (sanitized === "TRENDY25") {
      return subTotal * 0.25; 
    }
    if (sanitized === "WARDROBE10") {
      return subTotal * 0.10; 
    }
    if (sanitized === "SHOPMORE15") {
      return subTotal * 0.15; 
    }
    if (sanitized === "PROMO20") {
      return 20.0; 
    }
    
    return 10.0;
  }, [appliedPromo, subTotal]);

  const addToCart = (product: Omit<CartItem, "id" | "quantity">) => {
    const id = `${product.productId}_${product.size}_${product.color}`.toLowerCase().replace(/\s+/g, "_");
    setCartItems((prevItems) => {
      let updatedItems: CartItem[];
      const existingItemIndex = prevItems.findIndex((item) => item.id === id);
      if (existingItemIndex > -1) {
        updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
      } else {
        updatedItems = [...prevItems, { ...product, id, quantity: 1 }];
      }

      // Sync to backend
      getAuthToken().then((token) => {
        if (token) {
          syncCartApi(updatedItems).catch((err) =>
            console.error("[CartContext] Error syncing addToCart to backend:", err)
          );
        }
      });

      return updatedItems;
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== id);

      // Sync to backend
      getAuthToken().then((token) => {
        if (token) {
          syncCartApi(updatedItems).catch((err) =>
            console.error("[CartContext] Error syncing removeFromCart to backend:", err)
          );
        }
      });

      return updatedItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setUserId(null);
    setAppliedPromo("");

    // Sync to backend
    getAuthToken().then((token) => {
      if (token) {
        syncCartApi([]).catch((err) =>
          console.error("[CartContext] Error syncing clearCart to backend:", err)
        );
      }
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) => (item.id === id ? { ...item, quantity } : item));

      // Sync to backend
      getAuthToken().then((token) => {
        if (token) {
          syncCartApi(updatedItems).catch((err) =>
            console.error("[CartContext] Error syncing updateQuantity to backend:", err)
          );
        }
      });

      return updatedItems;
    });
  };

  const applyPromoCode = (code: string): boolean => {
    const sanitized = code.trim().toUpperCase();
    if (sanitized.length > 0) {
      setAppliedPromo(sanitized);
      return true;
    }
    return false;
  };

  const deliveryCharge = useMemo(() => {
    if (cartItems.length === 0) return 0.0;
    return selectedShippingType ? selectedShippingType.price : 0.0;
  }, [cartItems, selectedShippingType]);

  const tax = 0.0; 

  const totalCost = useMemo(() => {
    const cost = subTotal + deliveryCharge + tax - promoDiscount;
    return Math.max(0, cost);
  }, [subTotal, deliveryCharge, tax, promoDiscount]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        promoDiscount,
        appliedPromo,
        applyPromoCode,
        subTotal,
        deliveryCharge,
        tax,
        totalCost,
        clearCart,
        loadCart,
        selectedAddress,
        setSelectedAddress,
        selectedShippingType,
        setSelectedShippingType,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
