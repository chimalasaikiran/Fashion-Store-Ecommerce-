import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Rect, Line, Path } from "react-native-svg";
import { usePayment } from "../../context/PaymentContext";
import { Colors } from "../../constants/Colors";


const BROWN_DARK = Colors.primary; 
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;
const INPUT_BG = Colors.backgroundCell; 



const CardChip = () => (
  <Svg width="40" height="30" viewBox="0 0 40 30" fill="none">
    <Rect
      x="1"
      y="1"
      width="38"
      height="28"
      rx="4"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="1.5"
      fill="rgba(255,255,255,0.15)"
    />
    <Line
      x1="1"
      y1="15"
      x2="39"
      y2="15"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="1.2"
    />
    <Line
      x1="13"
      y1="1"
      x2="13"
      y2="29"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="1.2"
    />
    <Line
      x1="27"
      y1="1"
      x2="27"
      y2="29"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="1.2"
    />
    <Path
      d="M13 8H27M13 22H27"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="1.2"
    />
  </Svg>
);

export default function AddCardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addCard } = usePayment();

  
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  
  const handleCardNumberChange = (text: string) => {
    
    const cleanText = text.replace(/[^0-9]/g, "");
    
    
    let formattedText = "";
    for (let i = 0; i < cleanText.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedText += " ";
      }
      formattedText += cleanText[i];
    }
    
    
    setCardNumber(formattedText.slice(0, 19));
  };

  
  const handleExpiryChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    
    let formattedText = cleanText;
    if (cleanText.length > 2) {
      formattedText = `${cleanText.slice(0, 2)}/${cleanText.slice(2, 4)}`;
    }
    
    setExpiryDate(formattedText.slice(0, 5));
  };

  
  const handleCvvChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    setCvv(cleanText.slice(0, 3));
  };

  
  const handleAddCardSubmit = () => {
    setErrorMsg(null);

    
    if (!cardHolder.trim()) {
      setErrorMsg("Please enter the card holder name.");
      return;
    }

    const cleanCardNumber = cardNumber.replace(/\s+/g, "");
    if (cleanCardNumber.length < 16) {
      setErrorMsg("Please enter a valid 16-digit card number.");
      return;
    }

    if (expiryDate.length < 5) {
      setErrorMsg("Please enter the expiry date in MM/YY format.");
      return;
    }

    const [monthStr] = expiryDate.split("/");
    const month = parseInt(monthStr, 10);
    if (!month || month < 1 || month > 12) {
      setErrorMsg("Please enter a valid month (01-12).");
      return;
    }

    if (cvv.length < 3) {
      setErrorMsg("Please enter a valid 3-digit CVV.");
      return;
    }

    
    addCard({
      cardHolder: cardHolder.trim(),
      cardNumber: cleanCardNumber,
      expiryDate,
      cvv,
      saveCard,
    });

    
    setSuccessMsg("Card added successfully!");
    
    
    setTimeout(() => {
      setSuccessMsg(null);
      router.back();
    }, 1500);
  };

  
  const displayHolder = cardHolder.trim() || "Jennifer Aaker";
  const displayNum = cardNumber || "4716 9627 1635 8047";
  const displayExpiry = expiryDate || "02/30";

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      {}
      {successMsg && (
        <View style={[styles.alertContainer, styles.successAlert, { top: insets.top + 10 }]}>
          <Ionicons name="checkmark-circle" size={20} color="#1E4620" />
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      )}
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
          <Text style={styles.headerTitle}>Add Card</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {}
          <View style={styles.cardPreviewContainer}>
            {}
            <View style={styles.circleOverlay1} />
            <View style={styles.circleOverlay2} />
            <View style={styles.bubbleOverlay1} />
            <View style={styles.bubbleOverlay2} />
            <View style={styles.bubbleOverlay3} />

            {}
            <View style={styles.cardHeader}>
              <View style={styles.visaPlaceholder}>
                <Text style={styles.visaText}>VISA</Text>
              </View>
            </View>

            {}
            <Text style={styles.cardPreviewNumber}>{displayNum}</Text>

            {}
            <View style={styles.cardFooter}>
              <View style={styles.footerLeft}>
                <Text style={styles.cardFooterLabel}>Card holder name</Text>
                <Text style={styles.cardFooterValue} numberOfLines={1}>
                  {displayHolder}
                </Text>
              </View>

              <View style={styles.footerMiddle}>
                <Text style={styles.cardFooterLabel}>Expiry date</Text>
                <Text style={styles.cardFooterValue}>{displayExpiry}</Text>
              </View>

              <View style={styles.footerRight}>
                <CardChip />
              </View>
            </View>
          </View>

          {}
          <View style={styles.formContainer}>
            {}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Card Holder Name</Text>
              <TextInput
                style={styles.textInput}
                value={cardHolder}
                onChangeText={setCardHolder}
                placeholder="Jennifer Aaker"
                placeholderTextColor="#A0A0A0"
                autoCapitalize="words"
              />
            </View>

            {}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Card Number</Text>
              <TextInput
                style={styles.textInput}
                value={cardNumber}
                onChangeText={handleCardNumberChange}
                placeholder="4716 9627 1635 8047"
                placeholderTextColor="#A0A0A0"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            {}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.fieldLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={expiryDate}
                  onChangeText={handleExpiryChange}
                  placeholder="02/30"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.fieldLabel}>CVV</Text>
                <TextInput
                  style={styles.textInput}
                  value={cvv}
                  onChangeText={handleCvvChange}
                  placeholder="000"
                  placeholderTextColor="#A0A0A0"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

            {}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setSaveCard(!saveCard)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkboxOuter,
                  saveCard && styles.checkboxOuterChecked,
                ]}
              >
                {saveCard && (
                  <Ionicons name="checkmark-sharp" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Save Card</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {}
        <View style={styles.footerButtonContainer}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleAddCardSubmit}
            activeOpacity={0.9}
          >
            <Text style={styles.actionBtnText}>Add Card</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  cardPreviewContainer: {
    backgroundColor: "#422006", 
    height: 200,
    borderRadius: 20,
    padding: 24,
    justifyContent: "space-between",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#3D1800",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 28,
  },
  
  circleOverlay1: {
    position: "absolute",
    bottom: -50,
    left: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  circleOverlay2: {
    position: "absolute",
    top: -50,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  bubbleOverlay1: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  bubbleOverlay2: {
    position: "absolute",
    top: 35,
    right: 45,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  bubbleOverlay3: {
    position: "absolute",
    top: 45,
    right: 15,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  visaPlaceholder: {
    paddingRight: 6,
  },
  visaText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  cardPreviewNumber: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 1.5,
    textAlign: "left",
    marginVertical: 12,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  footerLeft: {
    flex: 2,
  },
  footerMiddle: {
    flex: 1,
    paddingLeft: 8,
  },
  footerRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  cardFooterLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 9,
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "capitalize",
  },
  cardFooterValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  formContainer: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  textInput: {
    backgroundColor: INPUT_BG,
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  rowInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 12,
  },
  checkboxOuter: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#A0A0A0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxOuterChecked: {
    borderColor: BROWN_DARK,
    backgroundColor: BROWN_DARK,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  footerButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: "transparent",
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
  successAlert: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  successText: {
    color: "#1E4620",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
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
