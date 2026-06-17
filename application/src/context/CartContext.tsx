import React, { createContext, useContext, useState, useMemo } from "react";

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "modern_party_dress_m_beige",
      productId: "5",
      name: "Modern Party Dress",
      category: "Dress",
      price: 80.0,
      originalPrice: 100.0,
      image: require("../../assets/images/fashion_portrait_4_1781014289331.png"),
      quantity: 1,
      size: "M",
      color: "Beige",
    },
    {
      id: "white_shirt_s_white",
      productId: "2",
      name: "White Shirt",
      category: "Shirt",
      price: 70.0,
      originalPrice: 100.0,
      image: require("../../assets/images/fashion_portrait_5_1781014303170.png"),
      quantity: 1,
      size: "S",
      color: "White",
    },
    {
      id: "brown_coat_l_brown",
      productId: "1",
      name: "Brown Coat",
      category: "Coats",
      price: 75.0,
      originalPrice: 150.0,
      image: require("../../assets/images/fashion_portrait_3_1781014096781.png"),
      quantity: 1,
      size: "L",
      color: "Brown",
    },
  ]);

  const [appliedPromo, setAppliedPromo] = useState<string>("");

  
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
      const existingItemIndex = prevItems.findIndex((item) => item.id === id);
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += 1;
        return updatedItems;
      }
      return [...prevItems, { ...product, id, quantity: 1 }];
    });
  };

  
  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  
  const clearCart = () => {
    setCartItems([]);
    setAppliedPromo("");
  };

  
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
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
    return cartItems.length > 0 ? 20.0 : 0.0;
  }, [cartItems]);

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
