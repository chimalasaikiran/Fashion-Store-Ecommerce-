import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import { Alert } from "react-native";

export interface NotificationItem {
  id: string;
  category: "today" | "yesterday";
  title: string;
  description: string;
  time: string;
  type: "ship" | "sale" | "review" | "paypal";
  isRead: boolean;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (title: string, description: string, type: NotificationItem['type']) => void;
  markAllAsRead: (category: "today" | "yesterday") => void;
  toggleRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const getWsUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (__DEV__ && hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:5000`;
  }
  return "http://localhost:5000";
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "mock-1",
    category: "today",
    title: "Welcome to Fashion Store!",
    description: "Explore the latest trends, curated collections, and exclusive discounts tailored just for you.",
    time: "2h",
    type: "sale",
    isRead: false,
  },
  {
    id: "mock-2",
    category: "yesterday",
    title: "Setup Your Profile",
    description: "Complete your profile information, address details, and wallet settings to enable one-click checkout.",
    time: "1d",
    type: "paypal",
    isRead: true,
  }
];

export function NotificationProvider({ children, fetchOrders, orders }: { 
  children: React.ReactNode; 
  fetchOrders?: () => Promise<void>;
  orders?: any[];
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = (title: string, description: string, type: NotificationItem['type'] = "ship") => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      category: "today",
      title,
      description,
      time: "Just now",
      type,
      isRead: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAllAsRead = (category: "today" | "yesterday") => {
    setNotifications((prev) =>
      prev.map((n) => (n.category === category ? { ...n, isRead: true } : n))
    );
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  // Connect to Socket.io for real-time order status updates
  useEffect(() => {
    const wsUrl = getWsUrl();
    console.log("[Socket] Connecting to:", wsUrl);
    const socket = io(wsUrl);

    socket.on("connect", () => {
      console.log("[Socket] Connected to backend notification server");
    });

    socket.on("order_updated", (updatedOrder: any) => {
      console.log("[Socket] Received order update:", updatedOrder.orderId, updatedOrder.status);

      // Check if this order belongs to the customer
      // We can compare against active orders in context or customer phone/name
      const hasMatchingOrder = orders && orders.some((o: any) => o.orderId === updatedOrder.orderId);
      
      if (hasMatchingOrder) {
        let title = "Order Update";
        let description = `Your order #${updatedOrder.orderId} status has changed to ${updatedOrder.status}.`;
        let notifType: NotificationItem['type'] = "ship";

        // Map status to user friendly notification descriptions
        switch (updatedOrder.status) {
          case "Processing":
            title = "Order Processing";
            description = `Great news! Your order #${updatedOrder.orderId} has been confirmed and is now being processed by the store.`;
            notifType = "ship";
            break;
          case "Dispatched":
            title = "Order Dispatched";
            description = `Your package for order #${updatedOrder.orderId} has been packed and dispatched to our logistics partner.`;
            notifType = "ship";
            break;
          case "Shipped":
            title = "Order Shipped";
            description = `Your order #${updatedOrder.orderId} has been handed to our courier and is now on the way!`;
            notifType = "ship";
            break;
          case "Out For Delivery":
            title = "Out for Delivery";
            description = `Get ready! Your package for order #${updatedOrder.orderId} is out for delivery with the courier agent.`;
            notifType = "ship";
            break;
          case "Delivered":
            title = "Order Delivered";
            description = `Success! Your package for order #${updatedOrder.orderId} has been delivered. Enjoy your style!`;
            notifType = "ship";
            break;
          case "Cancelled":
            title = "Order Cancelled";
            description = `Your order #${updatedOrder.orderId} has been cancelled by the store.`;
            notifType = "review";
            break;
          case "Refunded":
            title = "Refund Processed";
            description = `A refund for order #${updatedOrder.orderId} has been successfully credited back to your account.`;
            notifType = "paypal";
            break;
          // Legacy fallbacks
          case "Confirmed":
            title = "Order Confirmed";
            description = `Great news! Your order #${updatedOrder.orderId} has been confirmed by the store.`;
            notifType = "ship";
            break;
          case "Packed":
            title = "Order Packed";
            description = `Your package for order #${updatedOrder.orderId} has been packed and is ready for courier pickup.`;
            notifType = "ship";
            break;
        }

        // 1. Add notification
        addNotification(title, description, notifType);

        // 2. Trigger rich haptic feedback for user wow-factor
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        // 3. Show in-app Alert Banner
        Alert.alert(title, description, [{ text: "Track Order" }]);

        // 4. Reload orders list instantly in context
        if (fetchOrders) {
          fetchOrders().catch(err => console.log("[Socket] Error auto-refreshing orders:", err));
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected from backend");
    });

    return () => {
      socket.disconnect();
    };
  }, [orders, fetchOrders]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead, toggleRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
