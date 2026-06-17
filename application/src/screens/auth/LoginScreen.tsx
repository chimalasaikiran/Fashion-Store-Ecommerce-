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
import { loginUser, setAuthToken } from "../../services/api";
import { useProfile } from "../../context/ProfileContext";



const BROWN_BTN = Colors.primaryButton;   
const ACCENT = Colors.accent;   
const LIGHT_BG = Colors.backgroundLight;   
const INPUT_BORDER = Colors.borderDark;
const PLACEHOLDER = Colors.textPlaceholder;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { updateProfile } = useProfile();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleShowPass = useCallback(() => setShowPass((v) => !v), []);

  const handleSignIn = async () => {
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await loginUser(email.trim().toLowerCase(), password.trim());
      
      
      await setAuthToken(response.token);

      
      updateProfile({
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone || "",
        countryCode: response.user.countryCode || "",
        gender: response.user.gender || "",
        avatar: response.user.avatar ? response.user.avatar : undefined,
      });

      
      if (response.user && response.user.phone && response.user.gender) {
        router.replace("/home" as any);
      } else {
        router.replace("/complete-profile" as any);
      }
    } catch (err: any) {
      console.error("SignIn Error:", err);
      if (err.message && err.message.toLowerCase().includes("verify your email")) {
        setError(err.message);
        setTimeout(() => {
          router.push({
            pathname: "/verify-code" as any,
            params: { email: email.trim().toLowerCase() },
          });
        }, 1500);
      } else {
        setError(err.message || "Sign in failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Image
          source={require("../../../assets/images/fashion_portrait_5_1781014303170.png")}
          style={styles.headerBg}
          contentFit="cover"
        />
        <View style={styles.headerOverlay} />

        <Image
          source={require("../../../assets/images/splash-icon.png")}
          style={styles.logo}
          contentFit="contain"
        />

        <Text style={styles.headerTitle}>{"Let's get you Login!"}</Text>
        <Text style={styles.headerSubtitle}>
          {"Hi! Welcome back, you've been missed"}
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
            {}
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
              <AntDesign name="apple" size={22} color="#000" />
            </TouchableOpacity>

            {}
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
              <Svg width={22} height={22} viewBox="0 0 48 48">
                <Path fill="#EA4335" d="M24 9.5c3.2 0 5.9 1.1 8.1 2.9l6-6C34.5 3.2 29.6 1 24 1 14.8 1 7 6.7 3.7 14.6l7 5.4C12.4 13.5 17.7 9.5 24 9.5z"/>
                <Path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-16.9z"/>
                <Path fill="#FBBC05" d="M10.7 28.5A14.6 14.6 0 0 1 9.5 24c0-1.6.3-3.1.7-4.5l-7-5.4A23.8 23.8 0 0 0 1 24c0 3.9.9 7.5 2.6 10.8l7.1-6.3z"/>
                <Path fill="#34A853" d="M24 47c5.5 0 10.2-1.8 13.6-4.9l-7.4-5.7c-1.9 1.3-4.3 2-6.2 2-6.3 0-11.6-4.2-13.5-9.9l-7.1 6.3C7 41.3 14.8 47 24 47z"/>
              </Svg>
            </TouchableOpacity>

            {}
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
              <FontAwesome5 name="facebook-f" size={20} color="#1877F2" />
            </TouchableOpacity>
          </View>

          <Text style={styles.orText}>Or sign in with</Text>

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

          <Pressable
            onPress={() => router.push("/new-password" as any)}
            style={styles.forgotRow}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color="#B71C1C" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.signInBtn, loading && { opacity: 0.8 }]}
            onPress={handleSignIn}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signInBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupRow}>
            <Text style={styles.signupText}>{"Don't have an account? "}</Text>
            <Pressable onPress={() => router.push("/signup" as any)}>
              <Text style={styles.signupLink}>Sign Up</Text>
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
    height: 420,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 36,
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
    backgroundColor: "rgba(45,18,0,0.72)",
  },
  logo: {
    width: 200,
    height: 200,
    zIndex: 1,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    zIndex: 1,
    marginBottom: 110,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    zIndex: 1,
    top:-90,
  },

  
  cardWrapper: {
    flex: 1,
    marginTop: -90,
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
    marginBottom: 4,
  },
  inputBox: {
    backgroundColor: LIGHT_BG,
    borderRadius: 14,
    borderWidth:1,
    height:50,
    borderColor: INPUT_BORDER,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    marginBottom: 12,
  },
  input: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    paddingBottom:0,
  },
  passwordBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeBtn: {
    paddingLeft: 8,
  },

  
  forgotRow: {
    alignSelf: "flex-end",
    marginBottom: 28,
    marginTop: -8,
  },
  forgotText: {
    fontSize: 14,
    color: ACCENT,
    fontWeight: "600",
  },

  
  signInBtn: {
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
  signInBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  signupLink: {
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
