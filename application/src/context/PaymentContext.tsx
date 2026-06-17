import React, { createContext, useContext, useState } from "react";

export interface Card {
  id: string;
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  saveCard: boolean;
}

interface PaymentContextType {
  cards: Card[];
  addCard: (card: Omit<Card, "id">) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<Card[]>([]);

  const addCard = (newCard: Omit<Card, "id">) => {
    const id = Date.now().toString();
    setCards((prevCards) => [...prevCards, { ...newCard, id }]);
  };

  return (
    <PaymentContext.Provider value={{ cards, addCard }}>
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayment() {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within a PaymentProvider");
  }
  return context;
}
