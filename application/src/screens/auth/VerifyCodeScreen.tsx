import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { verifyOtp, resendOtp, setAuthToken } from "../../services/api";
import { useProfile } from "../../context/ProfileContext";
import { useCart } from "../../context/CartContext";




const BROWN_DARK = Colors.primary;
const ACCENT = Colors.accent;
const LIGHT_BG = Colors.background;
const CELL_BG = Colors.backgroundCell;
const INPUT_BORDER = Colors.borderInput;
const TEXT_PRIMARY = Colors.textPrimary;
const TEXT_MUTED = Colors.textMuted;

export default function VerifyCodeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { updateProfile } = useProfile();
  const { loadCart } = useCart();

  
  const email = (params?.email as string) || "";

  
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  
  const refs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  
  const handleResend = async () => {
    if (!canResend) return;
    setErrorMsg(null);

    try {
      await resendOtp(email);
      setSuccessMsg("A new verification code has been sent!");
      setTimer(60);
      setCanResend(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend code.");
    }
  };

  
  const handleVerify = async () => {
    const otpCode = code.join("");
    if (otpCode.length < 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await verifyOtp(email, otpCode);

      
      if (response && response.token) {
        await setAuthToken(response.token);
        await loadCart();
      }

      
      if (response && response.user) {
        updateProfile({
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone || "",
          countryCode: response.user.countryCode || "",
          gender: response.user.gender || "",
          avatar: response.user.avatar ? response.user.avatar : undefined,
        });
      }

      setSuccessMsg("Email verified! Welcome to Fashion Store 🎉");

      setTimeout(() => {
        router.replace("/complete-profile" as any);
      }, 1500);
    } catch (err: any) {
      console.error("Verify Error:", err);
      setErrorMsg(err.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeText = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    const newCode = [...code];

    if (cleaned === "") {
      newCode[index] = "";
      setCode(newCode);
      return;
    }

    const digit = cleaned.slice(-1);
    newCode[index] = digit;
    setCode(newCode);

    if (index < 5) refs[index + 1].current?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      const newCode = [...code];
      if (code[index] !== "") {
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        newCode[index - 1] = "";
        setCode(newCode);
        refs[index - 1].current?.focus();
      }
    }
  };

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

      <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom + 20, 24) }]}>

        {}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Verify Code</Text>
          <Text style={styles.subtitle}>
            We sent a 6-digit code to{"\n"}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          <Text style={styles.clerkBadge}>🔐 Secured with JWT</Text>
        </View>

        {}
        <View style={styles.otpContainer}>
          {code.map((val, idx) => {
            const isFocused = focusedIndex === idx;
            return (
              <Pressable
                key={idx}
                style={[styles.otpCell, isFocused && styles.otpCellFocused]}
                onPress={() => refs[idx].current?.focus()}
              >
                <TextInput
                  ref={refs[idx]}
                  style={styles.otpInput}
                  value={val}
                  placeholder="-"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(text) => handleChangeText(text, idx)}
                  onKeyPress={(e) => handleKeyPress(e, idx)}
                  onFocus={() => setFocusedIndex(idx)}
                  onBlur={() => setFocusedIndex(null)}
                  selectTextOnFocus
                />
              </Pressable>
            );
          })}
        </View>

        {}
        <View style={styles.resendContainer}>
          <Text style={styles.resendLabel}>{"Didn't receive the code?"}</Text>
          <TouchableOpacity onPress={handleResend} disabled={!canResend} activeOpacity={0.7}>
            <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
              {canResend ? "Resend code" : `Resend code in ${timer}s`}
            </Text>
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.verifyBtn, loading && styles.verifyBtnLoading]}
            onPress={handleVerify}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.verifyBtnText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: LIGHT_BG },
  container: { flex: 1, paddingHorizontal: 28 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
    height: 48,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#EAEAEA",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  titleSection: { alignItems: "center", marginBottom: 36 },
  title: {
    fontSize: 28, fontWeight: "700", color: TEXT_PRIMARY,
    textAlign: "center", marginBottom: 10, letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14, color: TEXT_MUTED, textAlign: "center", lineHeight: 20,
  },
  emailText: { color: BROWN_DARK, fontWeight: "700" },
  clerkBadge: {
    marginTop: 8, fontSize: 12, color: ACCENT,
    backgroundColor: "#FDF5EE", paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, overflow: "hidden",
  },
  otpContainer: {
    flexDirection: "row", justifyContent: "center",
    gap: 10, marginBottom: 32, width: "100%",
  },
  otpCell: {
    width: 50, height: 58, borderRadius: 14,
    backgroundColor: CELL_BG, borderWidth: 1, borderColor: INPUT_BORDER,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02, shadowRadius: 2, elevation: 1,
  },
  otpCellFocused: {
    borderColor: BROWN_DARK, borderWidth: 1.5,
    backgroundColor: "#FFFFFF", shadowOpacity: 0.05, shadowRadius: 4,
  },
  otpInput: {
    width: "100%", height: "100%", textAlign: "center",
    fontSize: 22, fontWeight: "700", color: TEXT_PRIMARY,
  },
  resendContainer: { alignItems: "center", marginBottom: 44, gap: 8 },
  resendLabel: { fontSize: 14, color: TEXT_MUTED },
  resendLink: {
    fontSize: 14, color: ACCENT, fontWeight: "700",
    textDecorationLine: "underline",
  },
  resendLinkDisabled: { color: TEXT_MUTED, textDecorationLine: "none", opacity: 0.8 },
  buttonContainer: { width: "100%", marginTop: "auto" },
  verifyBtn: {
    backgroundColor: BROWN_DARK, borderRadius: 30, height: 56,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16, shadowRadius: 8, elevation: 4,
  },
  verifyBtnLoading: { opacity: 0.9 },
  verifyBtnText: {
    color: "#FFFFFF", fontSize: 16, fontWeight: "700", letterSpacing: 0.3,
  },
  alertContainer: {
    position: "absolute", left: 20, right: 20,
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
    flexDirection: "row", alignItems: "center", gap: 10,
    zIndex: 999, shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 5,
  },
  successAlert: { backgroundColor: "#E8F5E9", borderWidth: 1, borderColor: "#C8E6C9" },
  successText: { color: "#1E4620", fontSize: 14, fontWeight: "600", flex: 1 },
  errorAlert: { backgroundColor: "#FFEBEE", borderWidth: 1, borderColor: "#FFCDD2" },
  errorText: { color: "#5C1919", fontSize: 14, fontWeight: "600", flex: 1 },
});
