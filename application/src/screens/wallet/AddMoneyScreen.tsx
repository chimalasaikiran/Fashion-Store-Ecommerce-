import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle } from "react-native-svg";
import { useWallet } from "../../context/WalletContext";
import { Colors } from "../../constants/Colors";

const BROWN_DARK = Colors.primary; 
const ACCENT = Colors.accent; 
const LIGHT_BG = Colors.background; 
const CARD_BG = Colors.backgroundCard; 
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;
const BORDER_COLOR = Colors.borderLight;


const WalletCardIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6H5C3.9 6 3 6.9 3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16V8C21 6.9 20.1 6 19 6Z"
      stroke={ACCENT}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 12C16 11.2 16.7 10.5 17.5 10.5H21V13.5H17.5C16.7 13.5 16 12.8 16 12Z"
      stroke={ACCENT}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#FAF6F0"
    />
    <Circle cx="18.5" cy="12" r="1.2" fill={ACCENT} />
  </Svg>
);

export default function AddMoneyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { balance, addMoney } = useWallet();

  const [inputAmount, setInputAmount] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = [100, 200, 500, 1000, 2000, 3000, 4000, 5000];

  const handleBack = () => {
    router.back();
  };

  const handlePresetPress = (amount: number) => {
    setErrorMsg(null);
    setInputAmount(amount.toString());
  };

  const handleInputChange = (text: string) => {
    setErrorMsg(null);
    
    const cleanText = text.replace(/[^0-9.]/g, "");
    
    const parts = cleanText.split(".");
    if (parts.length > 2) return;
    setInputAmount(cleanText);
  };

  const handleSubmit = () => {
    setErrorMsg(null);
    const parsed = parseFloat(inputAmount);

    if (isNaN(parsed) || parsed <= 0) {
      setErrorMsg("Please enter a valid amount greater than 0");
      return;
    }

    
    addMoney(parsed);

    
    router.push({
      pathname: "/top-up-success" as any,
      params: { amount: parsed.toFixed(2) },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      {}
      {errorMsg && (
        <View style={[styles.alertContainer, styles.errorAlert, { top: insets.top + 10 }]}>
          <Ionicons name="alert-circle" size={20} color="#5C1919" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

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
          <Text style={styles.headerTitle}>Add Money</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {}
          <View style={styles.inputCard}>
            {}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.balanceLabel}>Wallet Balance</Text>
                <Text style={styles.balanceAmount}>
                  $ {balance.toFixed(2)}
                </Text>
              </View>
              <View style={styles.walletIconContainer}>
                <WalletCardIcon />
              </View>
            </View>

            {}
            <View style={styles.presetsGrid}>
              {presets.map((val) => {
                const isActive = inputAmount === val.toString();
                return (
                  <TouchableOpacity
                    key={val}
                    style={[
                      styles.presetBtn,
                      isActive && styles.presetBtnActive,
                    ]}
                    onPress={() => handlePresetPress(val)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        isActive && styles.presetTextActive,
                      ]}
                    >
                      + ${val}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {}
            <View style={styles.inputWrapper}>
              <Text style={styles.dollarSymbol}>$</Text>
              <TextInput
                style={styles.textInput}
                value={inputAmount}
                onChangeText={handleInputChange}
                placeholder="Enter Amount"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
              />
            </View>

            {}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleSubmit}
              activeOpacity={0.9}
            >
              <Text style={styles.actionBtnText}>Add Money</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_BG,
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
    borderColor: BORDER_COLOR,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
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
  },
  inputCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.2,
    borderColor: "#EAE5DF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  walletIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  presetsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  presetBtn: {
    width: "23%",
    backgroundColor: "#FFFFFF",
    height: 38,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  presetBtnActive: {
    borderColor: ACCENT,
    backgroundColor: "#FAF3EC",
  },
  presetText: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  presetTextActive: {
    color: ACCENT,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    marginBottom: 20,
  },
  dollarSymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  actionBtn: {
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
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  
  alertContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  errorAlert: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  errorText: {
    color: "#5C1919",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
});
