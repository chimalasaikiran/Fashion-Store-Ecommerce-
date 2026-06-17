import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { resetUserPassword } from "../../services/api";



const BROWN_DARK = Colors.primary;
const LIGHT_BG = Colors.background;
const INPUT_BG = Colors.backgroundLight;
const INPUT_BORDER = Colors.borderLight;
const TEXT_PRIMARY = Colors.textPrimary;
const TEXT_MUTED = Colors.textMuted;

export default function NewPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);


  const toggleShowPass = useCallback(() => setShowPass((v) => !v), []);
  const toggleShowConfirmPass = useCallback(() => setShowConfirmPass((v) => !v), []);

  
  const handleCreateNewPassword = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg("Please enter your email.");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Please enter a new password.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (!confirmPassword.trim()) {
      setErrorMsg("Please confirm your password.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetUserPassword(email.trim().toLowerCase(), password.trim());
      setSuccessMsg("Password successfully reset! 🎉");

      setTimeout(() => {
        router.replace("/signin" as any);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
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

      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 12,
            paddingBottom: Math.max(insets.bottom + 20, 24),
          },
        ]}
      >
        {}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {}
          <View style={styles.titleSection}>
            <Text style={styles.title}>New Password</Text>
            <Text style={styles.subtitle}>
              Your new password must be different{"\n"}from previously used passwords.
            </Text>
          </View>

          {}
          <View style={styles.formContainer}>
            
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                placeholderTextColor="#CCCCCC"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>

            
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="****************"
                placeholderTextColor="#CCCCCC"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                returnKeyType="next"
              />
              <TouchableOpacity onPress={toggleShowPass} style={styles.eyeBtn}>
                <Ionicons
                  name={showPass ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={TEXT_MUTED}
                />
              </TouchableOpacity>
            </View>

            
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                placeholder="****************"
                placeholderTextColor="#CCCCCC"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPass}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleCreateNewPassword}
              />
              <TouchableOpacity onPress={toggleShowConfirmPass} style={styles.eyeBtn}>
                <Ionicons
                  name={showConfirmPass ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={TEXT_MUTED}
                />
              </TouchableOpacity>
            </View>
          </View>

          {}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.createBtn, loading && styles.createBtnLoading]}
              onPress={handleCreateNewPassword}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.createBtnText}>Create New Password</Text>
              )}
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
    paddingHorizontal: 28,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  titleSection: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: INPUT_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: INPUT_BORDER,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: TEXT_PRIMARY,
    paddingVertical: 12,
  },
  eyeBtn: {
    paddingLeft: 8,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 8,
  },
  createBtn: {
    backgroundColor: BROWN_DARK,
    borderRadius: 30,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnLoading: {
    opacity: 0.9,
  },
  createBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
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
    zIndex: 999,
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
