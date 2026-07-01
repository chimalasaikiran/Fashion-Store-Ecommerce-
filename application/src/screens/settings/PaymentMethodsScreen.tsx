import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle, Rect, Line } from "react-native-svg";
import { usePayment } from "../../context/PaymentContext";
import { useCart } from "../../context/CartContext";
import { useOrders } from "../../context/OrderContext";
import { useWallet } from "../../context/WalletContext";
import { useProfile } from "../../context/ProfileContext";
import { Colors } from "../../constants/Colors";


const BROWN_DARK = Colors.primary; 
const ACCENT = Colors.accent; 
const CARD_BG = Colors.background; 
const BORDER_COLOR = Colors.borderLight;
const DIVIDER_COLOR = Colors.divider; 
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;



const CashIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      stroke={ACCENT}
      strokeWidth="1.8"
    />
    <Circle
      cx="12"
      cy="12"
      r="2.5"
      stroke={ACCENT}
      strokeWidth="1.8"
    />
    <Circle cx="6.5" cy="12" r="0.8" fill={ACCENT} />
    <Circle cx="17.5" cy="12" r="0.8" fill={ACCENT} />
  </Svg>
);

const WalletIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6H5C3.9 6 3 6.9 3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16V8C21 6.9 20.1 6 19 6Z"
      stroke={ACCENT}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 12C16 11.2 16.7 10.5 17.5 10.5H21V13.5H17.5C16.7 13.5 16 12.8 16 12Z"
      stroke={ACCENT}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#FFFFFF"
    />
    <Circle cx="18.5" cy="12" r="0.8" fill={ACCENT} />
  </Svg>
);

const CreditCardIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      stroke={ACCENT}
      strokeWidth="1.8"
    />
    <Line
      x1="3"
      y1="10"
      x2="21"
      y2="10"
      stroke={ACCENT}
      strokeWidth="1.8"
    />
    <Rect
      x="6"
      y="13"
      width="3"
      height="2"
      rx="0.5"
      fill={ACCENT}
    />
  </Svg>
);

const PaypalIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 5.5C19 3 17.5 1.5 14.5 1.5H7.5C6.7 1.5 6.1 2.1 6 2.9L3.1 21.1C3 21.7 3.5 22.3 4.1 22.3H9.5L10.5 16H9C8.4 16 7.9 15.6 7.8 15L6.6 7.4C6.5 6.8 7 6.2 7.6 6.2H12C14.2 6.2 16 7 16 9.5C16 11 15.2 12.5 13.5 13H15.5C18 13 19 11 19 8C19 7 19 6.2 19 5.5Z"
      fill="#003087"
    />
    <Path
      d="M16.5 8.5C16.5 6 15 4.5 12 4.5H7.6C7.2 4.5 6.9 4.8 6.8 5.2L4.6 19.2C4.5 19.6 4.8 20 5.2 20H9.5L10.5 13.7C10.6 13.1 11.1 12.7 11.7 12.7H13C15.2 12.7 16.5 11.5 16.5 9C16.5 8.8 16.5 8.6 16.5 8.5Z"
      fill="#0079C1"
    />
  </Svg>
);

const AppleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
    <Path d="M18.71,19.5 C17.88,20.74 17,21.95 15.66,21.97 C14.32,22 13.89,21.18 12.37,21.18 C10.84,21.18 10.37,21.95 9.1,22 C7.79,22.05 6.8,20.68 5.96,19.47 C4.25,17 2.94,12.45 4.7,9.39 C5.57,7.87 7.13,6.91 8.82,6.88 C10.1,6.86 11.32,7.75 12.11,7.75 C12.89,7.75 14.37,6.68 15.92,6.84 C16.57,6.87 18.39,7.1 19.56,8.82 C19.47,8.88 17.39,10.1 17.41,12.63 C17.44,15.65 20.06,16.66 20.1,16.67 C20.08,16.74 19.67,18.11 18.71,19.5 M15.97,4.17 C16.63,3.37 17.07,2.28 16.95,1 C16.01,1.04 14.86,1.63 14.19,2.42 C13.62,3.08 13.12,4.2 13.28,5.46 C14.33,5.54 15.4,4.93 15.97,4.17" />
  </Svg>
);

const GoogleIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-2.87-4.53z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </Svg>
);

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cards } = usePayment();
  const { cartItems, clearCart, totalCost, appliedPromo, selectedAddress, selectedShippingType } = useCart();
  const { placeOrder } = useOrders();
  const { deductMoney } = useWallet();
  const { profile } = useProfile();
  
  
  const [selectedMethod, setSelectedMethod] = useState<string>("wallet");
  const [prevCardsCount, setPrevCardsCount] = useState(0);

  
  useEffect(() => {
    if (cards.length > prevCardsCount) {
      const latestCard = cards[cards.length - 1];
      setSelectedMethod(latestCard.id);
    }
    setPrevCardsCount(cards.length);
  }, [cards, prevCardsCount]);

  const handleBack = () => {
    router.back();
  };

  const handleConfirmPayment = async () => {
    if (cartItems.length > 0) {
      const backendAddress = selectedAddress ? {
        name: profile.name || "Customer",
        street: selectedAddress.address.split(",")[0] || selectedAddress.address,
        city: selectedAddress.address.split(",")[1]?.trim() || "New York",
        state: selectedAddress.address.split(",")[2]?.trim().split(" ")[0] || "NY",
        zip: selectedAddress.address.split(",")[2]?.trim().split(" ")[1] || "10016",
        country: selectedAddress.address.split(",")[3]?.trim() || "USA",
        phone: profile.phone || "+1 (208) 555-0112",
      } : undefined;

      const newOrderId = await placeOrder(
        cartItems,
        selectedMethod,
        appliedPromo,
        totalCost,
        backendAddress,
        selectedShippingType?.type || "Economy"
      );
      if (selectedMethod === "wallet") {
        deductMoney(totalCost, newOrderId.replace("#", ""));
      }
      clearCart();
    }
    router.push("/payment-success" as any);
  };

  
  const renderRadioButton = (methodId: string) => {
    const isSelected = selectedMethod === methodId;
    return (
      <View
        style={[
          styles.radioButtonOuter,
          isSelected && styles.radioButtonOuterActive,
        ]}
      >
        {isSelected && <View style={styles.radioButtonInner} />}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 12,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {}
          <Text style={styles.sectionTitle}>Cash</Text>
          <TouchableOpacity
            style={styles.paymentCard}
            onPress={() => setSelectedMethod("cash")}
            activeOpacity={0.85}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconWrapper}>
                <CashIcon />
              </View>
              <Text style={styles.paymentMethodName}>Cash</Text>
            </View>
            {renderRadioButton("cash")}
          </TouchableOpacity>

          {}
          <Text style={styles.sectionTitle}>Wallet</Text>
          <TouchableOpacity
            style={styles.paymentCard}
            onPress={() => setSelectedMethod("wallet")}
            activeOpacity={0.85}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconWrapper}>
                <WalletIcon />
              </View>
              <Text style={styles.paymentMethodName}>Wallet</Text>
            </View>
            {renderRadioButton("wallet")}
          </TouchableOpacity>

          {}
          <Text style={styles.sectionTitle}>Credit & Debit Card</Text>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.paymentCard, { marginBottom: 12 }]}
              onPress={() => setSelectedMethod(card.id)}
              activeOpacity={0.85}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconWrapper}>
                  <CreditCardIcon />
                </View>
                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.cardInfoTitle}>
                    Visa ending in {card.cardNumber.slice(-4)}
                  </Text>
                  <Text style={styles.cardInfoSubtitle}>
                    {card.cardHolder}
                  </Text>
                </View>
              </View>
              {renderRadioButton(card.id)}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.paymentCard, cards.length > 0 && { marginTop: 4 }]}
            onPress={() => {
              router.push("/add-card" as any);
            }}
            activeOpacity={0.85}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconWrapper}>
                <CreditCardIcon />
              </View>
              <Text style={styles.paymentMethodName}>Add Card</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={BROWN_DARK} />
          </TouchableOpacity>

          {}
          <Text style={styles.sectionTitle}>More Payment Options</Text>
          <View style={styles.moreOptionsCard}>
            {}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedMethod("paypal")}
              activeOpacity={0.85}
            >
              <View style={styles.cardLeft}>
                <View style={styles.brandIconWrapper}>
                  <PaypalIcon />
                </View>
                <Text style={styles.paymentMethodName}>Paypal</Text>
              </View>
              {renderRadioButton("paypal")}
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedMethod("applepay")}
              activeOpacity={0.85}
            >
              <View style={styles.cardLeft}>
                <View style={styles.brandIconWrapper}>
                  <AppleIcon />
                </View>
                <Text style={styles.paymentMethodName}>Apple Pay</Text>
              </View>
              {renderRadioButton("applepay")}
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {}
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setSelectedMethod("googlepay")}
              activeOpacity={0.85}
            >
              <View style={styles.cardLeft}>
                <View style={styles.brandIconWrapper}>
                  <GoogleIcon />
                </View>
                <Text style={styles.paymentMethodName}>Google Pay</Text>
              </View>
              {renderRadioButton("googlepay")}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirmPayment}
            activeOpacity={0.9}
          >
            <Text style={styles.confirmBtnText}>Confirm Payment</Text>
          </TouchableOpacity>
        </View>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  headerRightPlaceholder: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginTop: 18,
    marginBottom: 12,
  },
  paymentCard: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: "#F3EBE1",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  brandIconWrapper: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentMethodName: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_MUTED,
    marginLeft: 14,
  },
  radioButtonOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#E0D5C1",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonOuterActive: {
    borderColor: BROWN_DARK,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BROWN_DARK,
  },
  moreOptionsCard: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowDivider: {
    height: 1,
    backgroundColor: DIVIDER_COLOR,
    marginLeft: 62,
    marginRight: 16,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: "#FAFAFA",
  },
  confirmBtn: {
    backgroundColor: BROWN_DARK,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 30,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  celebrationRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FAF3EC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  celebrationInnerRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: ACCENT,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  modalBtn: {
    backgroundColor: BROWN_DARK,
    height: 50,
    borderRadius: 25,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  cardInfoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  cardInfoSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
});
