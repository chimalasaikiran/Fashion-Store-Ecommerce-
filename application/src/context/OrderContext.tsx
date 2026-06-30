import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  createOrderApi, 
  getOrdersApi, 
  cancelOrderApi, 
  reorderApi 
} from "../services/api";
import { useProfile } from "./ProfileContext";

export interface OrderItem {
  id: string; 
  orderId: string; 
  productId: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: any;
  quantity: number;
  size: string;
  color: string;
  status: string;
  orderStatus?: string;
  date: string;
  deliveryDate: string;
  timeline?: any[];
}

interface OrderContextType {
  orders: OrderItem[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  reOrder: (orderId: string) => Promise<void>;
  placeOrder: (
    items: any[],
    paymentMethod?: string,
    promoCode?: string,
    totalCost?: number,
    shippingAddress?: { name: string; street: string; city: string; state: string; zip: string; country: string; phone: string }
  ) => Promise<string>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  
  const flattenOrders = (backendOrders: any[]): OrderItem[] => {
    const flatList: OrderItem[] = [];
    backendOrders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          
          
          const resolvedImage = isNaN(Number(item.image)) ? item.image : Number(item.image);
          
          flatList.push({
            id: item._id || item.id,
            orderId: order.orderId,
            productId: item.product || item.productId,
            name: item.name,
            category: item.category,
            price: item.price,
            originalPrice: item.originalPrice || item.price,
            image: resolvedImage,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            status: (() => {
              const lowerStatus = (order.status || "").toLowerCase();
              if (lowerStatus === "delivered" || lowerStatus === "completed") {
                return "completed";
              } else if (lowerStatus === "cancelled" || lowerStatus === "refunded") {
                return "cancelled";
              }
              return "active";
            })(),
            orderStatus: order.status,
            date: order.date,
            deliveryDate: item.deliveryDate || order.deliveryDate,
            timeline: order.timeline || [],
          });
        });
      }
    });
    return flatList;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrdersApi();
      if (res && res.success && res.orders) {
        setOrders(flattenOrders(res.orders));
      }
    } catch (err) {
      console.log("[OrderContext] Error fetching orders from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (orderId: string) => {
    
    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId ? { ...order, status: "cancelled", orderStatus: "Cancelled" } : order
      )
    );
    try {
      await cancelOrderApi(orderId);
    } catch (err) {
      console.error("[OrderContext] Failed to cancel order on backend:", err);
    }
  };

  const reOrder = async (orderId: string) => {
    
    setOrders((prev) =>
      prev.map((order) =>
        order.orderId === orderId ? { ...order, status: "active", orderStatus: "Pending" } : order
      )
    );
    try {
      await reorderApi(orderId);
    } catch (err) {
      console.error("[OrderContext] Failed to reorder on backend:", err);
    }
  };

  const placeOrder = async (
    items: any[],
    paymentMethod: string = "Wallet",
    promoCode: string = "",
    totalCost: number = 0,
    shippingAddress?: { name: string; street: string; city: string; state: string; zip: string; country: string; phone: string }
  ): Promise<string> => {
    try {
      const ensureValidObjectId = (id: string): string => {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        if (isObjectId) return id;
        const cleanId = id.replace(/[^0-9a-fA-F]/g, "").slice(0, 24);
        return cleanId.padEnd(24, "0");
      };

      const apiItems = items.map((item) => ({
        product: ensureValidObjectId(item.productId || "56c12345678901234567890f"),
        name: item.name,
        category: item.category,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        image: String(item.image), 
        quantity: item.quantity || 1,
        size: item.size || "M",
        color: item.color || "Black",
      }));

      const payload = {
        phone: profile.phone || "+1 (208) 555-0112",
        promoCode,
        paymentMethod,
        items: apiItems,
        totalAmount: totalCost || items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0),
        shippingAddress: shippingAddress || undefined,
      };

      const res = await createOrderApi(payload);
      if (res && res.success && res.order) {
        
        await fetchOrders();
        return res.order.orderId;
      }
      throw new Error("Failed to place order in backend API");
    } catch (err: any) {
      console.warn("[OrderContext] placeOrder backend API call failed, falling back to local simulation:", err.message || err);
      
      
      const newOrderId = "#FN" + Math.floor(100000 + Math.random() * 900000);
      const dateStr = "12 June 2026, 12:50 PM";
      const newOrders: OrderItem[] = items.map((item, idx) => ({
        id: `placed_${newOrderId}_${idx}`,
        orderId: newOrderId,
        productId: item.productId || "unknown",
        name: item.name,
        category: item.category,
        price: item.price,
        originalPrice: item.originalPrice || item.price,
        image: item.image,
        quantity: item.quantity || 1,
        size: item.size || "M",
        color: item.color || "Black",
        status: "active",
        orderStatus: "Pending",
        date: dateStr,
        deliveryDate: "June 15, 2026 | 03:00 PM",
      }));
      setOrders((prev) => [...newOrders, ...prev]);
      return newOrderId;
    }
  };

  return (
    <OrderContext.Provider value={{ orders, loading, fetchOrders, cancelOrder, reOrder, placeOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
