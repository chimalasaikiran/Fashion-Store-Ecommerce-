import React, { createContext, useContext, useState } from "react";

export interface Transaction {
  id: string;
  title: string;
  type: "added" | "order";
  amount: number;
  date: string;
  time: string;
  balance: number;
  sectionHeader: string;
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  addMoney: (amount: number) => void;
  deductMoney: (amount: number, orderId?: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(2400.0);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "tx_1",
      title: "Money Added to Wallet",
      type: "added",
      amount: 250.0,
      date: "11 March",
      time: "11:30 AM",
      balance: 2400.0,
      sectionHeader: "Today",
    },
    {
      id: "tx_2",
      title: "Order ID #FN845661",
      type: "order",
      amount: 50.0,
      date: "10 March",
      time: "10:30 AM",
      balance: 2100.0,
      sectionHeader: "Yesterday",
    },
    {
      id: "tx_3",
      title: "Money Added to Wallet",
      type: "added",
      amount: 500.0,
      date: "09 March",
      time: "8:30 AM",
      balance: 2150.0,
      sectionHeader: "09 March 2026",
    },
    {
      id: "tx_4",
      title: "Order ID #FN854539",
      type: "order",
      amount: 50.0,
      date: "09 March",
      time: "7:48 AM",
      balance: 1650.0,
      sectionHeader: "09 March 2026",
    },
    {
      id: "tx_5",
      title: "Order ID #FN854538",
      type: "order",
      amount: 50.0,
      date: "09 March",
      time: "7:36 AM",
      balance: 1700.0,
      sectionHeader: "09 March 2026",
    },
    {
      id: "tx_6",
      title: "Order ID #FN854536",
      type: "order",
      amount: 50.0,
      date: "09 March",
      time: "7:30 AM",
      balance: 1750.0,
      sectionHeader: "09 March 2026",
    },
  ]);

  const addMoney = (amount: number) => {
    setBalance((prev) => {
      const newBalance = prev + amount;
      const now = new Date();
      const day = now.getDate().toString().padStart(2, "0");
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthStr = monthNames[now.getMonth()];
      const dateStr = `${day} ${monthStr}`;

      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timeStr = `${hours}:${minutes} ${ampm}`;

      const newTx: Transaction = {
        id: `tx_${Date.now()}_add`,
        title: "Money Added to Wallet",
        type: "added",
        amount,
        date: dateStr,
        time: timeStr,
        balance: newBalance,
        sectionHeader: "Today",
      };

      setTransactions((prev) => [newTx, ...prev]);
      return newBalance;
    });
  };

  const deductMoney = (amount: number, orderId?: string) => {
    setBalance((prev) => {
      const newBalance = prev - amount;
      const now = new Date();
      const day = now.getDate().toString().padStart(2, "0");
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthStr = monthNames[now.getMonth()];
      const dateStr = `${day} ${monthStr}`;

      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const timeStr = `${hours}:${minutes} ${ampm}`;

      const newTx: Transaction = {
        id: `tx_${Date.now()}_deduct`,
        title: orderId ? `Order ID #${orderId}` : "Order Payment",
        type: "order",
        amount,
        date: dateStr,
        time: timeStr,
        balance: newBalance,
        sectionHeader: "Today",
      };

      setTransactions((prev) => [newTx, ...prev]);
      return newBalance;
    });
  };

  return (
    <WalletContext.Provider value={{ balance, transactions, addMoney, deductMoney }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
