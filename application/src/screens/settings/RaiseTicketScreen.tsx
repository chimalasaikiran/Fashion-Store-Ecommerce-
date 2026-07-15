import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { createTicketApi } from "../../services/api";

const BROWN_DARK = Colors.primary;
const ACCENT = Colors.accent;
const LIGHT_BG = Colors.background;
const GRAY_BG = Colors.backgroundGray;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

const CATEGORIES = [
  { id: "Order Status", label: "Order Status", icon: "clipboard-outline" },
  { id: "Payment & Refund", label: "Payment & Refund", icon: "cash-outline" },
  { id: "Product Quality", label: "Product Quality", icon: "shirt-outline" },
  { id: "App Feedback", label: "App Feedback", icon: "phone-portrait-outline" },
  { id: "Other", label: "Other Support", icon: "help-circle-outline" },
];

const PRIORITIES = [
  { id: "LOW", label: "Low", color: "#757575", bg: "#F5F5F5" },
  { id: "MEDIUM", label: "Medium", color: "#1E88E5", bg: "#EBF5FF" },
  { id: "HIGH", label: "High", color: "#F57C00", bg: "#FFF4E5" },
  { id: "CRITICAL", label: "Critical", color: "#E53935", bg: "#FFEBEE" },
];

export default function RaiseTicketScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Order Status");
  const [priority, setPriority] = useState("MEDIUM");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any>(null);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert("Required Field", "Please enter a subject for the ticket.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Required Field", "Please describe your issue in the message box.");
      return;
    }

    setLoading(true);
    try {
      const res = await createTicketApi({
        subject: subject.trim(),
        category,
        priority,
        message: message.trim(),
      });

      if (res && res.success) {
        setCreatedTicket(res.ticket);
        setSuccess(true);
      } else {
        Alert.alert("Error", res.message || "Failed to create support ticket.");
      }
    } catch (err: any) {
      console.error("Create Ticket Error:", err);
      Alert.alert("Error", err.message || "Failed to create support ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = () => {
    if (createdTicket) {
      router.replace({
        pathname: "/ticket-details" as any,
        params: { id: createdTicket._id || createdTicket.ticketId },
      });
    }
  };

  const handleBackToSupport = () => {
    router.replace("/support-tickets" as any);
  };

  if (success) {
    return (
      <View style={styles.successRoot}>
        <StatusBar style="dark" />
        <View style={styles.successContainer}>
          <View style={styles.successIconBox}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>Ticket Raised!</Text>
          <Text style={styles.successTicketId}>
            Ticket ID: {createdTicket?.ticketId || "Pending"}
          </Text>
          <Text style={styles.successDesc}>
            Your support ticket has been raised successfully. Our operations team has
            been notified and will respond shortly.
          </Text>

          <View style={styles.successButtons}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleViewTicket}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>View Ticket Thread</Text>
              <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleBackToSupport}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>Back to Tickets List</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Raise a Ticket</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.formContainer, { paddingBottom: insets.bottom + 40 }]}
      >
        {/* Category selector */}
        <Text style={styles.label}>Select Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPills}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillSelected,
                ]}
                onPress={() => setCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={isSelected ? "#FFFFFF" : ACCENT}
                />
                <Text
                  style={[
                    styles.categoryPillLabel,
                    isSelected && styles.categoryPillLabelSelected,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Priority selector */}
        <Text style={styles.label}>Priority Level</Text>
        <View style={styles.priorityRow}>
          {PRIORITIES.map((prio) => {
            const isSelected = priority === prio.id;
            return (
              <TouchableOpacity
                key={prio.id}
                style={[
                  styles.priorityButton,
                  isSelected && {
                    backgroundColor: prio.bg,
                    borderColor: prio.color,
                  },
                ]}
                onPress={() => setPriority(prio.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.prioDot,
                    { backgroundColor: prio.color },
                    isSelected && styles.prioDotSelected,
                  ]}
                />
                <Text
                  style={[
                    styles.priorityText,
                    isSelected && { color: prio.color, fontWeight: "700" },
                  ]}
                >
                  {prio.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Subject Input */}
        <Text style={styles.label}>Subject</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Broken zipper on jacket, payment failed..."
            placeholderTextColor="#A8A8A8"
            value={subject}
            onChangeText={setSubject}
            maxLength={100}
          />
        </View>

        {/* Message Input */}
        <Text style={styles.label}>Detailed Description</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Please provide details about your issue. Reference order numbers if applicable..."
            placeholderTextColor="#A8A8A8"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            maxLength={1000}
            textAlignVertical="top"
          />
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Text style={styles.submitBtnText}>Submit Support Ticket</Text>
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: LIGHT_BG,
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  headerPlaceholder: {
    width: 44,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginTop: 18,
    marginBottom: 8,
  },
  categoryPills: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GRAY_BG,
    borderWidth: 1,
    borderColor: "#F4ECE3",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  categoryPillSelected: {
    backgroundColor: BROWN_DARK,
    borderColor: BROWN_DARK,
  },
  categoryPillLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  categoryPillLabelSelected: {
    color: "#FFFFFF",
  },
  priorityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GRAY_BG,
    borderWidth: 1,
    borderColor: "#F4ECE3",
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  prioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  prioDotSelected: {
    transform: [{ scale: 1.2 }],
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  inputContainer: {
    backgroundColor: GRAY_BG,
    borderWidth: 1,
    borderColor: "#F4ECE3",
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 52,
    justifyContent: "center",
  },
  textInput: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: "500",
    paddingVertical: 0,
  },
  textAreaContainer: {
    minHeight: 140,
    alignItems: "stretch",
    paddingVertical: 14,
  },
  textArea: {
    flex: 1,
    height: "100%",
  },
  submitBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: BROWN_DARK,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 36,
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  successRoot: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    justifyContent: "center",
    alignItems: "center",
  },
  successContainer: {
    paddingHorizontal: 32,
    alignItems: "center",
    width: "100%",
  },
  successIconBox: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#C8E6C9",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  successTicketId: {
    fontSize: 16,
    fontWeight: "700",
    color: ACCENT,
    backgroundColor: GRAY_BG,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F4ECE3",
    overflow: "hidden",
    marginBottom: 16,
  },
  successDesc: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
    marginBottom: 36,
  },
  successButtons: {
    width: "100%",
    gap: 12,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: BROWN_DARK,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  secondaryBtnText: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: "700",
  },
});
