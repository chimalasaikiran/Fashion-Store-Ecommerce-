import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { getMyTicketsApi, SupportTicketType } from "../../services/api";

const BROWN_DARK = Colors.primary;
const ACCENT = Colors.accent;
const LIGHT_BG = Colors.background;
const GRAY_BG = Colors.backgroundGray;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

export default function SupportTicketsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState<SupportTicketType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const res = await getMyTicketsApi();
      if (res && res.success) {
        setTickets(res.tickets || []);
      } else {
        setError("Failed to fetch tickets.");
      }
    } catch (err: any) {
      console.error("Fetch Tickets Error:", err);
      setError(err.message || "Failed to fetch tickets.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTickets(false);
  };

  const getStatusStyle = (status: SupportTicketType["status"]) => {
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

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("order")) return "clipboard-outline";
    if (cat.includes("payment") || cat.includes("refund")) return "cash-outline";
    if (cat.includes("product") || cat.includes("quality")) return "shirt-outline";
    if (cat.includes("app") || cat.includes("feedback")) return "phone-portrait-outline";
    return "help-circle-outline";
  };

  const renderTicketCard = ({ item }: { item: SupportTicketType }) => {
    const statusStyle = getStatusStyle(item.status);
    const catIcon = getCategoryIcon(item.category);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          router.push({
            pathname: "/ticket-details" as any,
            params: { id: item._id || item.ticketId },
          })
        }

      >
        <View style={styles.cardHeader}>
          <Text style={styles.ticketId}>{item.ticketId}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
            ]}
          >
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={styles.subject} numberOfLines={2}>
          {item.subject}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.categoryBadge}>
            <Ionicons name={catIcon as any} size={14} color={ACCENT} />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.dateText}>{item.updatedDate || item.createdDate}</Text>
        </View>

        {item.assignedAgent && item.assignedAgent !== "Unassigned" && (
          <View style={styles.agentRow}>
            <Feather name="user" size={12} color={TEXT_MUTED} />
            <Text style={styles.agentText}>Assigned: {item.assignedAgent}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home?tab=profile" as any);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Tickets</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={BROWN_DARK} />
          <Text style={styles.loadingText}>Loading support tickets...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchTickets()}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={64}
              color={ACCENT}
            />
          </View>
          <Text style={styles.emptyTitle}>No Support Tickets</Text>
          <Text style={styles.emptySubtitle}>
            Have an issue with an order, payment, or your account? Raise a support
            ticket and our operations team will assist you.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/raise-ticket" as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Raise a Ticket</Text>
            <Ionicons name="add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={tickets}
            keyExtractor={(item) => item._id || item.ticketId}
            renderItem={renderTicketCard}
            contentContainerStyle={[
              styles.listContainer,
              { paddingBottom: insets.bottom + 100 },
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[BROWN_DARK]}
                tintColor={BROWN_DARK}
              />
            }
          />

          {/* Floating Action Button */}
          <TouchableOpacity
            style={[styles.fab, { bottom: insets.bottom + 24 }]}
            onPress={() => router.push("/raise-ticket" as any)}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.error,
    textAlign: "center",
    marginBottom: 20,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: BROWN_DARK,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: GRAY_BG,
    borderWidth: 2,
    borderColor: "#F4ECE3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
    marginBottom: 32,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: BROWN_DARK,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
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
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F4ECE3",
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  ticketId: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "System", 
    color: BROWN_DARK,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  subject: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 16,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GRAY_BG,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F4ECE3",
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  dateText: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
  agentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "#F4ECE3",
    marginTop: 12,
    paddingTop: 10,
  },
  agentText: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  fab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: BROWN_DARK,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
