import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Clipboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { useCart } from "../../context/CartContext";
import { Colors } from "../../constants/Colors";


const BROWN_DARK = Colors.primary; 
const LIGHT_BG = Colors.backgroundLight; 
const CARD_BG = Colors.background; 
const BORDER_COLOR = Colors.borderLight;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

const COUPONS = [
  {
    code: "FASHION15",
    unlockText: "Add items worth $500 more to unlock",
    offerText: "Enjoy 15% OFF on clothing",
  },
  {
    code: "TRENDY25",
    unlockText: "Add items worth $800 more to unlock",
    offerText: "Get 25% OFF on fashion item",
  },
  {
    code: "WARDROBE10",
    unlockText: "Add items worth $350 more to unlock",
    offerText: "Save 10% instantly",
  },
  {
    code: "SHOPMORE15",
    unlockText: "Add items worth $450 more to unlock",
    offerText: "Get 15% OFF today",
  },
];


const BadgeIcon = () => (
  <View style={styles.badgeWrapper}>
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L14.8 4.2L18.8 3.8L19.4 7.8L22.8 10L20.8 13.5L22 17.2L18.2 18L16.6 21.6L12.8 20.2L9.4 22L7.8 18.6L4 18L4.6 14L1.8 11.8L3.8 8.4L2.6 4.7L6.4 3.8L8 0.4L11.8 2.2L12 2Z"
        fill="#EEA756"
      />
      <Path
        d="M9 12L11 14L15 9.5"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  </View>
);

export default function MyCouponsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { applyPromoCode } = useCart();

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleCopyCode = (code: string) => {
    
    Clipboard.setString(code);
    
    
    applyPromoCode(code);
    
    setCopiedCode(code);
    setToastMessage(`Promo code "${code}" copied & applied!`);

    
    setTimeout(() => {
      setCopiedCode(null);
      setToastMessage(null);
    }, 2500);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Coupons</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 60 },
        ]}
      >
        <Text style={styles.sectionTitle}>Coupons for you</Text>

        <View style={styles.couponsList}>
          {COUPONS.map((item) => (
            <View key={item.code} style={styles.cardContainer}>
              {}
              <View style={styles.couponCard}>
                {}
                <View style={styles.cardDecoration}>
                  <Svg width="100%" height="100%" viewBox="0 0 320 120" fill="none">
                    <Path
                      d="M240 0 C 270 30, 260 70, 320 120 L 320 0 Z"
                      fill="#FDFBF9"
                      opacity={0.8}
                    />
                    <Path
                      d="M190 0 C 230 20, 240 70, 320 120 L 320 0 Z"
                      fill="#FAF5F0"
                      opacity={0.5}
                    />
                  </Svg>
                </View>

                {}
                <View style={styles.leftCutout} />

                {}
                <View style={styles.cardMain}>
                  <Text style={styles.couponCode}>{item.code}</Text>
                  <Text style={styles.unlockText}>{item.unlockText}</Text>
                  
                  <View style={styles.offerRow}>
                    <BadgeIcon />
                    <Text style={styles.offerText}>{item.offerText}</Text>
                  </View>
                </View>

                {}
                <TouchableOpacity
                  style={[
                    styles.copyButton,
                    copiedCode === item.code && styles.copyButtonActive,
                  ]}
                  onPress={() => handleCopyCode(item.code)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.copyButtonText}>
                    {copiedCode === item.code ? "COPIED" : "COPY CODE"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {}
      {toastMessage && (
        <View style={[styles.toastContainer, { bottom: Math.max(insets.bottom, 20) + 10 }]}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderColor: BORDER_COLOR,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
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
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 20,
  },
  couponsList: {
    gap: 20,
  },
  cardContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  couponCard: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  cardDecoration: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "60%",
    zIndex: 0,
  },
  leftCutout: {
    position: "absolute",
    left: -12,
    top: 48,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: LIGHT_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    zIndex: 2,
  },
  cardMain: {
    paddingTop: 24,
    paddingBottom: 18,
    paddingHorizontal: 24,
    zIndex: 1,
  },
  couponCode: {
    fontSize: 18,
    fontWeight: "800",
    color: BROWN_DARK,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  unlockText: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 12,
  },
  offerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badgeWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  offerText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  copyButton: {
    backgroundColor: BROWN_DARK,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  copyButtonActive: {
    backgroundColor: "#2E7D32", 
  },
  copyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  toastContainer: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 99,
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
