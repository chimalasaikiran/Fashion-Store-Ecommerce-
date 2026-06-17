import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle } from "react-native-svg";
import { useCart } from "../../context/CartContext";
import { Colors } from "../../constants/Colors";

const BROWN_DARK = Colors.primary; 
const ACCENT = Colors.accent; 
const CARD_BG = Colors.background; 
const BORDER_COLOR = Colors.borderLight;
const DIVIDER_COLOR = Colors.divider; 
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cartItems } = useCart();
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleContinueToPayment = () => {
    router.push("/payment-methods" as any);
  };

  const handleGoHome = () => {
    setIsSuccessModalVisible(false);
    router.dismissAll();
    router.replace("/home");
  };

  
  const renderShippingIcon = () => {
    return (
      <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {}
        <Path
          d="M12 2.5L3.5 7L12 11.5L20.5 7L12 2.5Z"
          stroke={BROWN_DARK}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M3.5 7V16.5L12 21V11.5L3.5 7Z"
          stroke={BROWN_DARK}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M20.5 7V16.5L12 21"
          stroke={BROWN_DARK}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {}
        <Circle
          cx="17"
          cy="16"
          r="3.5"
          stroke={ACCENT}
          strokeWidth="2"
          fill="#FFFFFF"
        />
      </Svg>
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
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {}
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <View style={styles.infoCard}>
            <View style={styles.cardRow}>
              {}
              <View style={styles.iconContainer}>
                <Ionicons
                  name="location-sharp"
                  size={22}
                  color={ACCENT}
                />
              </View>

              {}
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsLabel}>Home</Text>
                <Text style={styles.detailsSubText}>
                  245 Madison Ave, New York, NY 10016, USA
                </Text>
              </View>

              {}
              <TouchableOpacity
                style={styles.changeBtn}
                onPress={() => router.push("/shipping-address")}
                activeOpacity={0.7}
              >
                <Text style={styles.changeBtnText}>CHANGE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {}
          <Text style={styles.sectionTitle}>Choose Shipping Type</Text>
          <View style={styles.infoCard}>
            <View style={styles.cardRow}>
              {}
              <View style={styles.iconContainer}>
                {renderShippingIcon()}
              </View>

              {}
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsLabel}>Economy</Text>
                <Text style={styles.detailsSubText}>
                  Estimated Arrival  11{"\n"}March 2026
                </Text>
              </View>

              {}
              <TouchableOpacity
                style={styles.changeBtn}
                onPress={() => router.push("/choose-shipping")}
                activeOpacity={0.7}
              >
                <Text style={styles.changeBtnText}>CHANGE</Text>
              </TouchableOpacity>
            </View>
          </View>

          {}
          <Text style={styles.sectionTitle}>Order List</Text>
          <View style={styles.orderListCard}>
            {cartItems.map((item, index) => (
              <View key={item.id}>
                <View style={styles.orderItemRow}>
                  {}
                  <Image
                    source={item.image}
                    style={styles.productImage}
                    contentFit="cover"
                  />

                  {}
                  <View style={styles.productDetails}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.productCategory}>
                      {item.category}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.productPrice}>
                        ${item.price.toFixed(2)}
                      </Text>
                      <Text style={styles.productOriginalPrice}>
                        ${item.originalPrice.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                {index < cartItems.length - 1 && (
                  <View style={styles.rowDivider} />
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinueToPayment}
            activeOpacity={0.9}
          >
            <Text style={styles.continueBtnText}>Continue to Payment</Text>
          </TouchableOpacity>
        </View>
      </View>

      {}
      <Modal
        visible={isSuccessModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            {}
            <View style={styles.celebrationRing}>
              <View style={styles.celebrationInnerRing}>
                <Ionicons name="checkmark-sharp" size={42} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.successTitle}>Order Placed!</Text>
            <Text style={styles.successSubtitle}>
              Your payment was successful and your order has been processed.
            </Text>

            {}
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={handleGoHome}
              activeOpacity={0.85}
            >
              <Text style={styles.modalBtnText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginTop: 16,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FAF3EC", 
    justifyContent: "center",
    alignItems: "center",
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  detailsLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  detailsSubText: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 18,
  },
  changeBtn: {
    borderWidth: 1.2,
    borderColor: "#F0E7DD",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  changeBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: BROWN_DARK,
  },
  orderListCard: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  orderItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  productImage: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
  },
  productDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 3,
  },
  productCategory: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: BROWN_DARK,
  },
  productOriginalPrice: {
    fontSize: 11,
    color: TEXT_MUTED,
    textDecorationLine: "line-through",
  },
  rowDivider: {
    height: 1,
    backgroundColor: DIVIDER_COLOR,
    marginLeft: 100,
    marginRight: 16,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: "transparent",
  },
  continueBtn: {
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
  continueBtnText: {
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
});
