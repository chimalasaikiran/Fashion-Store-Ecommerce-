import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Rect, Path } from "react-native-svg";
import { Colors } from "../../constants/Colors";


const BROWN_DARK = Colors.primary; 
const ACCENT = Colors.accent; 
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

export default function PaymentSuccessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  
  
  const handleHomeNavigation = () => {
    
    router.dismissAll();
    router.replace("/home");
  };

  const handleViewOrder = () => {
    router.dismissAll();
    router.replace("/my-orders");
  };

  const handleViewReceipt = () => {
    router.push("/e-receipt");
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {}
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleHomeNavigation}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      {}
      <View style={styles.centerContainer}>
        {}
        <View style={styles.iconContainer}>
          <Svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            {}
            <Rect
              x="22"
              y="22"
              width="76"
              height="76"
              rx="22"
              fill={BROWN_DARK}
            />
            {}
            <Rect
              x="22"
              y="22"
              width="76"
              height="76"
              rx="22"
              fill={BROWN_DARK}
              transform="rotate(45, 60, 60)"
            />
            {}
            <Path
              d="M46 60 L54 68 L74 48"
              stroke="#FFFFFF"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </View>

        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successSubtitle}>Thank you for your purchase.</Text>
      </View>

      {}
      <View
        style={[
          styles.bottomSheet,
          {
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        <TouchableOpacity
          style={styles.viewOrderBtn}
          onPress={handleViewOrder}
          activeOpacity={0.9}
        >
          <Text style={styles.viewOrderText}>View Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewReceiptBtn}
          onPress={handleViewReceipt}
          activeOpacity={0.7}
        >
          <Text style={styles.viewReceiptText}>View E-Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: -40, 
  },
  iconContainer: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
  },
  bottomSheet: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 28,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.02)",
  },
  viewOrderBtn: {
    backgroundColor: BROWN_DARK,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  viewOrderText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  viewReceiptBtn: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  viewReceiptText: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: "700",
  },
});
