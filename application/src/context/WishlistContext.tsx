import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { getProducts } from "../services/api";

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

  const wishlistItems = useMemo(() => {
    return products.filter((p) => p.liked);
  }, [products]);

  const toggleLike = (id: string) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, liked: !item.liked } : item))
    );
  };

  const isLiked = (id: string) => {
    const prod = products.find((p) => p.id === id);
    return prod ? prod.liked : false;
  };

  return (
    <WishlistContext.Provider
      value={{ products, wishlistItems, toggleLike, isLiked, refreshProducts }}
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
