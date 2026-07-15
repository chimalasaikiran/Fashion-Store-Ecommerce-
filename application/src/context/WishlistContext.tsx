import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { getProducts, API_URL } from "../services/api";
import { io } from "socket.io-client";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: string;
  image: any;
  liked: boolean;
  stock?: number;
  status?: string;
}

interface WishlistContextType {
  products: Product[];
  wishlistItems: Product[];
  toggleLike: (id: string) => void;
  isLiked: (id: string) => boolean;
  refreshProducts: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const INITIAL_STATIC_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Brown Coat",
    category: "Coats",
    price: 75.0,
    originalPrice: 150.0,
    rating: "4.8",
    image: require("../../assets/images/fashion_portrait_3_1781014096781.png"),
    liked: true,
    stock: 15,
    status: "Live",
  },
  {
    id: "2",
    name: "Classy White Shirt",
    category: "Shirts",
    price: 70.0,
    originalPrice: 100.0,
    rating: "4.7",
    image: require("../../assets/images/fashion_portrait_5_1781014303170.png"),
    liked: false,
    stock: 10,
    status: "Live",
  },
  {
    id: "3",
    name: "Light Brown Sweater",
    category: "Sweaters",
    price: 63.0,
    originalPrice: 70.0,
    rating: "4.7",
    image: require("../../assets/images/fashion_portrait_1_1781014071035.png"),
    liked: false,
    stock: 8,
    status: "Live",
  },
  {
    id: "4",
    name: "Classy Light Coat",
    category: "Coats",
    price: 165.0,
    originalPrice: 220.0,
    rating: "4.9",
    image: require("../../assets/images/fashion_portrait_2_1781014083606.png"),
    liked: true,
    stock: 12,
    status: "Live",
  },
  {
    id: "5",
    name: "Brown Dress",
    category: "Dress",
    price: 90.0,
    originalPrice: 100.0,
    rating: "4.8",
    image: require("../../assets/images/fashion_portrait_4_1781014289331.png"),
    liked: false,
    stock: 5,
    status: "Live",
  },
  {
    id: "6",
    name: "Chic Leather Jacket",
    category: "Jackets",
    price: 140.0,
    originalPrice: 200.0,
    rating: "4.8",
    image: require("../../assets/images/fashion_portrait_6_1781014316459.png"),
    liked: true,
    stock: 20,
    status: "Live",
  },
  {
    id: "7",
    name: "Classic Fedora Trench",
    category: "Coats",
    price: 85.0,
    originalPrice: 170.0,
    rating: "4.7",
    image: require("../../assets/images/fashion_portrait_3_1781014096781.png"),
    liked: false,
    stock: 7,
    status: "Live",
  },
  {
    id: "8",
    name: "Dark Yellow Sweater",
    category: "Sweaters",
    price: 45.0,
    originalPrice: 90.0,
    rating: "4.8",
    image: require("../../assets/images/fashion_portrait_1_1781014071035.png"),
    liked: false,
    stock: 14,
    status: "Live",
  },
  {
    id: "9",
    name: "Classic Black Shirt",
    category: "Shirt",
    price: 45.0,
    originalPrice: 50.0,
    rating: "5.0",
    image: require("../../assets/images/fashion_portrait_5_1781014303170.png"),
    liked: false,
    stock: 0,
    status: "Draft",
  },
  {
    id: "10",
    name: "Modern Party Dress",
    category: "Dress",
    price: 80.0,
    originalPrice: 100.0,
    rating: "5.0",
    image: require("../../assets/images/fashion_portrait_4_1781014289331.png"),
    liked: false,
    stock: 6,
    status: "Live",
  },
];

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(INITIAL_STATIC_PRODUCTS);

  const refreshProducts = async () => {
    try {
      const res = await getProducts();
      if (res.success) {
        setProducts((prev) => {
          return res.products.map((newProd: any) => {
            const existing = prev.find((p) => p.id === newProd.id);
            return {
              ...newProd,
              liked: existing ? existing.liked : (newProd.liked || false),
            };
          });
        });
      }
    } catch (error) {
      console.error("Failed to load products from backend:", error);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  // Listen for real-time product updates via Socket.io
  useEffect(() => {
    const socketUrl = API_URL.replace("/api", "");
    console.log("[Socket Wishlist] Connecting to sync server at:", socketUrl);
    const socket = io(socketUrl);

    socket.on("connect", () => {
      console.log("[Socket Wishlist] Connected to product sync server");
    });

    socket.on("product_created", (data) => {
      console.log("[Socket Wishlist] Product created:", data.name);
      setProducts((prev) => {
        if (prev.some((p) => p.id === data.id)) return prev;
        return [...prev, { ...data, liked: false }];
      });
    });

    socket.on("product_updated", (data) => {
      console.log("[Socket Wishlist] Product updated:", data.name);
      setProducts((prev) => {
        const exists = prev.some((p) => p.id === data.id);
        if (!exists) {
          if (data.status === "Live") {
            return [...prev, { ...data, liked: false }];
          }
          return prev;
        }
        return prev.map((p) => {
          if (p.id === data.id) {
            return { ...p, ...data, liked: p.liked };
          }
          return p;
        });
      });
    });

    socket.on("product_deleted", (data) => {
      console.log("[Socket Wishlist] Product deleted:", data.id);
      setProducts((prev) => prev.filter((p) => p.id !== data.id));
    });

    socket.on("disconnect", () => {
      console.log("[Socket Wishlist] Disconnected from sync server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const liveProducts = useMemo(() => {
    return products.filter((p) => p.status !== "Draft");
  }, [products]);

  const wishlistItems = useMemo(() => {
    return liveProducts.filter((p) => p.liked);
  }, [liveProducts]);

  const toggleLike = (id: string) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, liked: !item.liked } : item))
    );
  };

  const isLiked = (id: string) => {
    const prod = liveProducts.find((p) => p.id === id);
    return prod ? prod.liked : false;
  };

  return (
    <WishlistContext.Provider
      value={{ products: liveProducts, wishlistItems, toggleLike, isLiked, refreshProducts }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
