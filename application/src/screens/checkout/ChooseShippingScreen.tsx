import React, { useState } from "react";
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
import { Colors } from "../../constants/Colors";

const BROWN_DARK = Colors.primary; 
const ACCENT = Colors.accent; 
const CARD_BG = Colors.background; 
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

interface ShippingOption {
  id: string;
  name: string;
  arrivalLine1: string;
  arrivalLine2: string;
  price: string;
}

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "economy",
    name: "Economy",
    arrivalLine1: "Estimated Arrival  11",
    arrivalLine2: "March 2026",
    price: "$05",
  },
  {
    id: "cargo",
    name: "Cargo",
    arrivalLine1: "Estimated Arrival  09",
    arrivalLine2: "March 2026",
    price: "$10",
  },
  {
    id: "express",
    name: "Express",
    arrivalLine1: "Estimated Arrival  08",
    arrivalLine2: "March 2026",
    price: "$15",
  },
];

export default function ChooseShippingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string>("economy");

  const handleBack = () => {
    router.back();
  };

  const handleContinue = () => {
    router.push("/checkout");
  };

  
  const renderIcon = (id: string) => {
    if (id === "economy") {
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
    } else if (id === "cargo") {
      return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {}
          <Rect
            x="2"
            y="5"
            width="12"
            height="10"
            rx="1"
            stroke={BROWN_DARK}
            strokeWidth="2"
          />
          {}
          <Path
            d="M14 8H18.5L21 11V15H14V8Z"
            stroke={BROWN_DARK}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {}
          <Path
            d="M15 10H18L19 12H15V10Z"
            fill={ACCENT}
          />
          {}
          <Circle
            cx="6"
            cy="17"
            r="2"
            stroke={BROWN_DARK}
            strokeWidth="2"
            fill="#FFFFFF"
          />
          <Circle
            cx="16"
            cy="17"
            r="2"
            stroke={BROWN_DARK}
            strokeWidth="2"
            fill="#FFFFFF"
          />
        </Svg>
      );
    } else {
      
      return (
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {}
          <Line
            x1="1"
            y1="8"
            x2="4"
            y2="8"
            stroke={ACCENT}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <Line
            x1="0"
            y1="12"
            x2="3"
            y2="12"
            stroke={ACCENT}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {}
          <Rect
            x="6"
            y="5"
            width="10"
            height="10"
            rx="1"
            stroke={BROWN_DARK}
            strokeWidth="2"
          />
          {}
          <Path
            d="M16 8H19.5L22 11V15H16V8Z"
            stroke={BROWN_DARK}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {}
          <Circle
            cx="9"
            cy="17"
            r="2"
            stroke={BROWN_DARK}
            strokeWidth="2"
            fill="#FFFFFF"
          />
          <Circle
            cx="18"
            cy="17"
            r="2"
            stroke={BROWN_DARK}
            strokeWidth="2"
            fill="#FFFFFF"
          />
        </Svg>
      );
    }
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
          <Text style={styles.headerTitle}>Choose Shipping</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {}
          <View style={styles.optionsCard}>
            {SHIPPING_OPTIONS.map((item, index) => {
              const isSelected = selectedOption === item.id;
              return (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.optionRow}
                    onPress={() => setSelectedOption(item.id)}
                    activeOpacity={0.85}
                  >
                    {}
                    <View style={styles.iconContainer}>
                      {renderIcon(item.id)}
                    </View>

                    {}
                    <View style={styles.detailsContainer}>
                      <Text style={styles.optionName}>{item.name}</Text>
                      <Text style={styles.arrivalText}>
                        {item.arrivalLine1}
                        {"\n"}
                        {item.arrivalLine2}
                      </Text>
                    </View>

                    {}
                    <Text style={styles.priceText}>{item.price}</Text>

                    {}
                    <View
                      style={[
                        styles.radioButtonOuter,
                        isSelected && styles.radioButtonOuterActive,
                      ]}
                    >
                      {isSelected && <View style={styles.radioButtonInner} />}
                    </View>
                  </TouchableOpacity>

                  {index < SHIPPING_OPTIONS.length - 1 && (
                    <View style={styles.rowDivider} />
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
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
  optionsCard: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderRadius: 24,
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
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F7F7F7",
    justifyContent: "center",
    alignItems: "center",
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  optionName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  arrivalText: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 18,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginRight: 16,
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
  rowDivider: {
    height: 1,
    backgroundColor: "#F5EFE9",
    marginLeft: 82,
    marginRight: 20,
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
});
