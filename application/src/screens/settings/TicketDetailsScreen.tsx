import React, { useState, useEffect, useRef } from "react";
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
  LayoutAnimation,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { getMyTicketsApi, addTicketMessageApi, SupportTicketType } from "../../services/api";

const BROWN_DARK = Colors.primary;
const ACCENT = Colors.accent;
const LIGHT_BG = Colors.background;
const GRAY_BG = Colors.backgroundGray;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;
const BORDER_COLOR = Colors.borderChat;

export default function TicketDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const ticketIdParam = params.id as string;

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<SupportTicketType | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const fetchTicketDetails = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await getMyTicketsApi();
      if (res && res.success && res.tickets) {
        // Find matching ticket by database _id or ticketId string
        const found = res.tickets.find(
          (t: any) => t._id === ticketIdParam || t.ticketId === ticketIdParam
        );
        if (found) {
          setTicket(found);
        } else {
          console.error("Ticket not found in list:", ticketIdParam);
        }
      }
    } catch (err) {
      console.error("Error fetching ticket details:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll for ticket updates every 8 seconds
  useEffect(() => {
    fetchTicketDetails(true);

    const interval = setInterval(() => {
      fetchTicketDetails(false);
    }, 8000);

    return () => clearInterval(interval);
  }, [ticketIdParam]);

  // Scroll to bottom when ticket messages load/change
  useEffect(() => {
    if (ticket?.messages) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [ticket?.messages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !ticket) return;

    setSending(true);
    const originalText = replyText.trim();
    setReplyText("");

    try {
      const res = await addTicketMessageApi(ticket._id, originalText);
      if (res && res.success && res.ticket) {
        setTicket(res.ticket);
      } else {
        Alert.alert("Error", res.message || "Failed to send message.");
        setReplyText(originalText); // Restore input on failure
      }
    } catch (err: any) {
      console.error("Send Message Error:", err);
      Alert.alert("Error", err.message || "Failed to send message.");
      setReplyText(originalText);
    } finally {
      setSending(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Open":
        return { bg: "#EBF5FF", text: "#1E88E5", border: "#D6E4FF" };
      case "In Progress":
        return { bg: "#FFF4E5", text: "#F57C00", border: "#FFE3D1" };
      case "Escalated":
        return { bg: "#FFEBEE", text: "#E53935", border: "#FFCDD2" };
      case "Resolved":
        return { bg: "#E8F5E9", text: "#43A047", border: "#C8E6C9" };
      case "Closed":
        return { bg: "#F5F5F5", text: "#757575", border: "#E0E0E0" };
      default:
        return { bg: "#F5F5F5", text: "#757575", border: "#E0E0E0" };
    }
  };

  const toggleInfoExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsInfoExpanded(!isInfoExpanded);
  };

  if (loading && !ticket) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={BROWN_DARK} />
        <Text style={styles.loadingText}>Loading conversation...</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>Ticket not found.</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusStyle = getStatusStyle(ticket.status);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{ticket.ticketId}</Text>
          <View
            style={[
              styles.statusBadgeHeader,
              { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
            ]}
          >
            <Text style={[styles.statusTextHeader, { color: statusStyle.text }]}>
              {ticket.status}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.infoToggleBtn} onPress={toggleInfoExpanded}>
          <Ionicons
            name={isInfoExpanded ? "information-circle" : "information-circle-outline"}
            size={24}
            color={BROWN_DARK}
          />
        </TouchableOpacity>
      </View>

      {/* Expandable Ticket Info Card */}
      {isInfoExpanded && (
        <View style={styles.infoCard}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Subject</Text>
              <Text style={styles.infoValue}>{ticket.subject}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{ticket.category}</Text>
            </View>
            <View style={styles.infoItemHalf}>
              <Text style={styles.infoLabel}>Priority</Text>
              <Text style={[styles.infoValue, { fontWeight: "700" }]}>{ticket.priority}</Text>
            </View>
            <View style={styles.infoItemHalf}>
              <Text style={styles.infoLabel}>Assigned Agent</Text>
              <Text style={styles.infoValue}>{ticket.assignedAgent}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Created Date</Text>
              <Text style={styles.infoValue}>{ticket.createdDate}</Text>
            </View>
          </View>

          {/* Stepper Tracking Timeline */}
          {ticket.timeline && ticket.timeline.length > 0 && (
            <View style={styles.timelineContainer}>
              <Text style={styles.timelineHeader}>Ticket Activity Log</Text>
              {ticket.timeline.map((event, idx) => (
                <View key={event.id} style={styles.timelineRow}>
                  <View style={styles.timelineNodeContainer}>
                    <View style={styles.timelineNode} />
                    {idx < ticket.timeline.length - 1 && (
                      <View style={styles.timelineConnector} />
                    )}
                  </View>
                  <View style={styles.timelineTextContent}>
                    <Text style={styles.timelineAction}>{event.action}</Text>
                    <Text style={styles.timelineMeta}>
                      by {event.actor} • {event.timestamp}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Chat Messages Area */}
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.messagesScroll, { paddingBottom: insets.bottom + 85 }]}
      >
        <Text style={styles.dateSeparator}>TICKET CREATED • {ticket.createdDate}</Text>

        {ticket.messages.map((msg) => {
          const isMe = msg.sender === "Customer";
          const isSystem = msg.sender === "System";

          if (isSystem) {
            return (
              <View key={msg.id} style={styles.systemMessageContainer}>
                <View style={styles.systemMessageBubble}>
                  <Ionicons name="settings-outline" size={12} color={TEXT_MUTED} />
                  <Text style={styles.systemMessageText}>{msg.text}</Text>
                </View>
                <Text style={styles.systemMessageTime}>{msg.timestamp}</Text>
              </View>
            );
          }

          return (
            <View
              key={msg.id}
              style={[styles.messageRow, isMe ? styles.rowMe : styles.rowThem]}
            >
              <View
                style={[
                  styles.bubble,
                  isMe ? styles.bubbleMe : styles.bubbleThem,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isMe ? styles.messageTextMe : styles.messageTextThem,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
              <View style={[styles.metaRow, isMe ? styles.metaMe : styles.metaThem]}>
                {!isMe && (
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitials}>
                      {msg.senderName
                        ? msg.senderName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                        : "A"}
                    </Text>
                  </View>
                )}
                <Text style={styles.metaName}>
                  {isMe ? "You" : msg.senderName || "Support Agent"}
                </Text>
                <Text style={styles.metaTime}>{msg.timestamp}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input row container */}
      <View style={[styles.inputRowContainer, { bottom: insets.bottom + 12 }]}>
        {ticket.status === "Closed" && (
          <View style={styles.reopenNotice}>
            <Ionicons name="information-circle" size={14} color="#757575" />
            <Text style={styles.reopenNoticeText}>
              Ticket is Closed. Sending a message will reopen it.
            </Text>
          </View>
        )}

        <View style={styles.inputWrapperRow}>
          <View style={styles.inputFieldWrapper}>
            <TextInput
              style={styles.messageTextInput}
              placeholder="Type your message here..."
              placeholderTextColor="#A8A8A8"
              value={replyText}
              onChangeText={setReplyText}
              multiline={false}
              onSubmitEditing={handleSendReply}
              editable={!sending}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.actionCircleButton,
              (!replyText.trim() || sending) && styles.actionCircleButtonDisabled,
            ]}
            onPress={handleSendReply}
            disabled={!replyText.trim() || sending}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>
        </View>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: "#F4ECE3",
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
  headerTitleContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  statusBadgeHeader: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusTextHeader: {
    fontSize: 10,
    fontWeight: "700",
  },
  infoToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    backgroundColor: LIGHT_BG,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  errorText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    color: Colors.error,
    marginBottom: 20,
  },
  backLink: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: BROWN_DARK,
  },
  backLinkText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: GRAY_BG,
    borderBottomWidth: 1.5,
    borderBottomColor: "#F4ECE3",
    padding: 20,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 14,
  },
  infoItem: {
    width: "100%",
  },
  infoItemHalf: {
    width: "50%",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  timelineContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    paddingTop: 16,
  },
  timelineHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 44,
  },
  timelineNodeContainer: {
    width: 24,
    alignItems: "center",
  },
  timelineNode: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT,
    marginTop: 4,
  },
  timelineConnector: {
    flex: 1,
    width: 1.5,
    backgroundColor: "#E3C9B8",
    marginVertical: 4,
  },
  timelineTextContent: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 10,
  },
  timelineAction: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  timelineMeta: {
    fontSize: 10,
    color: TEXT_MUTED,
    marginTop: 2,
    fontWeight: "500",
  },
  messagesScroll: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  dateSeparator: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: TEXT_MUTED,
    textAlign: "center",
    marginVertical: 16,
  },
  messageRow: {
    marginBottom: 20,
    width: "100%",
  },
  rowMe: {
    alignItems: "flex-end",
  },
  rowThem: {
    alignItems: "flex-start",
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: "82%",
  },
  bubbleThem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  bubbleMe: {
    backgroundColor: BROWN_DARK,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextThem: {
    color: TEXT_PRIMARY,
    fontWeight: "500",
  },
  messageTextMe: {
    color: "#FFFFFF",
    fontWeight: "500",
  },
  systemMessageContainer: {
    alignItems: "center",
    marginVertical: 14,
  },
  systemMessageBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    maxWidth: "90%",
  },
  systemMessageText: {
    fontSize: 11,
    fontWeight: "600",
    color: TEXT_MUTED,
    textAlign: "center",
  },
  systemMessageTime: {
    fontSize: 9,
    color: TEXT_MUTED,
    marginTop: 4,
    fontWeight: "500",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  metaThem: {
    justifyContent: "flex-start",
    paddingLeft: 4,
  },
  metaMe: {
    justifyContent: "flex-end",
    paddingRight: 4,
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF8F2",
    borderWidth: 1,
    borderColor: "#FDF5EE",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 9,
    fontWeight: "700",
    color: ACCENT,
  },
  metaName: {
    fontSize: 11,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },
  metaTime: {
    fontSize: 10,
    color: TEXT_MUTED,
  },
  inputRowContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "column",
    gap: 8,
  },
  reopenNotice: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  reopenNoticeText: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "600",
  },
  inputWrapperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inputFieldWrapper: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: GRAY_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  messageTextInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY,
    paddingVertical: 0,
    height: "100%",
    fontWeight: "500",
  },
  actionCircleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: BROWN_DARK,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  actionCircleButtonDisabled: {
    backgroundColor: "#BEC9BE",
    shadowColor: "transparent",
    elevation: 0,
  },
});
