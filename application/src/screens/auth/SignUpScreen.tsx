import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, AntDesign, FontAwesome5 } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { Colors } from "../../constants/Colors";
import { signupUser } from "../../services/api";



const BROWN_BTN = Colors.primaryButton;   
const ACCENT = Colors.accent;   
const LIGHT_BG = Colors.backgroundLight;   
const INPUT_BORDER = Colors.borderDark;
const PLACEHOLDER = Colors.textPlaceholder;
const TEXT_PRIMARY = Colors.textPrimary;
const TEXT_MUTED = Colors.textMuted;

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleShowPass = useCallback(() => setShowPass((v) => !v), []);
  const toggleAgreed = useCallback(() => setAgreed((v) => !v), []);

  const handleSignUp = async () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password.trim()) { setError("Please enter a password."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!agreed) { setError("Please agree to the Terms & Conditions."); return; }

    setError(null);
    setLoading(true);

    try {
      await signupUser(name.trim(), email.trim().toLowerCase(), password.trim());

      router.push({
        pathname: "/verify-code" as any,
        params: { email: email.trim().toLowerCase(), name: name.trim() },
      });
    } catch (err: any) {
      console.error("SignUp Error:", err);
      setError(err.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={[styles.header, { paddingTop: insets.top -15 }]}>
        {}
        <Image
          source={require("../../../assets/images/fashion_portrait_4_1781014289331.png")}
          style={styles.headerBg}
          contentFit="cover"
        />
        {}
        <View style={styles.headerOverlay} />

        {}
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSubtitle}>
          Fill your information below or register{"\n"}with your social account.
        </Text>
      </View>

      {}
      <KeyboardAvoidingView
        style={styles.cardWrapper}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.card,
            { paddingBottom: Math.max(insets.bottom + 24, 32) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
              <AntDesign name="apple" size={22} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
              {}
              <Svg width={22} height={22} viewBox="0 0 48 48">
                <Path fill="#EA4335" d="M24 9.5c3.2 0 5.9 1.1 8.1 2.9l6-6C34.5 3.2 29.6 1 24 1 14.8 1 7 6.7 3.7 14.6l7 5.4C12.4 13.5 17.7 9.5 24 9.5z"/>
                <Path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-16.9z"/>
                <Path fill="#FBBC05" d="M10.7 28.5A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.7-4.5l-7-5.4A23.8 23.8 0 0 0 1 24c0 3.9.9 7.5 2.6 10.8l7.1-6.3z"/>
                <Path fill="#34A853" d="M24 47c5.5 0 10.2-1.8 13.6-4.9l-7.4-5.7c-1.9 1.3-4.3 2-6.2 2-6.3 0-11.6-4.2-13.5-9.9l-7.1 6.3C7 41.3 14.8 47 24 47z"/>
              </Svg>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
              <FontAwesome5 name="facebook-f" size={20} color="#1877F2" />
            </TouchableOpacity>
          </View>

          <Text style={styles.orText}>Or sign up with</Text>

          {}
          <Text style={styles.label}>Name</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={PLACEHOLDER}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              placeholderTextColor={PLACEHOLDER}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          {}
          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputBox, styles.passwordBox]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••••••••"
              placeholderTextColor={PLACEHOLDER}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              returnKeyType="done"
            />
            <TouchableOpacity onPress={toggleShowPass} style={styles.eyeBtn}>
              <Ionicons
                name={showPass ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={TEXT_MUTED}
              />
            </TouchableOpacity>
          </View>

          {}
          <TouchableOpacity
            style={styles.checkRow}
            onPress={toggleAgreed}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && (
                <Ionicons name="checkmark" size={13} color="#fff" />
              )}
            </View>
            <Text style={styles.checkLabel}>
              Agree with{" "}
              <Text style={styles.termsLink}>Terms & Condition</Text>
            </Text>
          </TouchableOpacity>

          {}
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color="#B71C1C" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {}
          <TouchableOpacity
            style={[styles.signUpBtn, (!agreed || loading) && styles.signUpBtnDisabled]}
            onPress={handleSignUp}
            activeOpacity={0.85}
            disabled={!agreed || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signUpBtnText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {}
          <View style={styles.signinRow}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <Pressable onPress={() => router.push("/signin")}>
              <Text style={styles.signinLink}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  
  header: {
    height: 470,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 48,
    overflow: "hidden",
    position: "relative",
  },
  headerBg: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(61,24,0,0.72)",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 150,
    zIndex: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.80)",
    textAlign: "center",
    lineHeight: 21,
    zIndex: 1,
    top:-140,
  },

  
  cardWrapper: {
    flex: 1,
    marginTop:-170,
    marginHorizontal: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  card: {
    paddingHorizontal: 28,
    paddingTop: 32,
  },

  
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  socialBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: INPUT_BORDER,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  googleG: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4285F4",
  },

  
  orText: {
    textAlign: "center",
    color: TEXT_MUTED,
    fontSize: 14,
    marginBottom: 24,
  },

  
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 5,
  },
  inputBox: {
    backgroundColor: LIGHT_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    marginBottom: 13,
  },
  input: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    paddingBottom:1,
  },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeBtn: {
    paddingLeft: 8,
  },

  
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
    marginTop: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: INPUT_BORDER,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  checkLabel: {
    fontSize: 14,
    color: TEXT_PRIMARY,
  },
  termsLink: {
    color: ACCENT,
    fontWeight: "600",
    textDecorationLine: "underline",
  },

  
  signUpBtn: {
    backgroundColor: BROWN_BTN,
    borderRadius: 30,
    paddingVertical: 17,
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  signUpBtnDisabled: {
    opacity: 0.5,
  },
  signUpBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  
  signinRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signinText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  signinLink: {
    fontSize: 14,
    color: ACCENT,
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#E53935",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: "#B71C1C",
    flex: 1,
    lineHeight: 18,
  },
});
