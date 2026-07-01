import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOrders } from "../../context/OrderContext";
import { useWishlist } from "../../context/WishlistContext";
import { Colors } from "../../constants/Colors";

const BROWN_DARK = Colors.primary; 
const TEXT_PRIMARY = Colors.textPrimary;
const TEXT_MUTED = Colors.textMuted;
const BORDER_COLOR = Colors.borderLight;

type TabType = "active" | "completed" | "cancelled";

export default function MyOrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orders, cancelOrder, reOrder, fetchOrders } = useOrders();
  const { products } = useWishlist();
  const [activeTab, setActiveTab] = useState<TabType>("active");

  React.useEffect(() => {
    if (fetchOrders) {
      fetchOrders();
    }
  }, []);

  const handleBack = () => {
    
    router.replace({ pathname: "/home" as any, params: { tab: "profile" } });
  };

  const handleSearch = () => {
    router.push("/search");
  };

  
  const filteredOrders = orders.filter((o) => o.status === activeTab);

  const handleCancelClick = (orderId: string, name: string) => {
    Alert.alert(
      "Cancel Order",
      `Are you sure you want to cancel the order for "${name}"?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            cancelOrder(orderId, "Customer Cancelled");
            Alert.alert("Success", "Your order has been cancelled.");
          },
        },
      ]
    );
  };

  const handleReorderClick = (orderId: string, name: string) => {
    reOrder(orderId);
    Alert.alert(
      "Re-Ordered",
      `"${name}" has been restored to Active Orders.`,
      [
        {
          text: "View Active",
          onPress: () => setActiveTab("active"),
        },
        { text: "OK" },
      ]
    );
  };

  const handleTrackClick = (orderId: string) => {
    router.push({ pathname: "/track-order" as any, params: { orderId } });
  };

  const renderOrderCard = (order: typeof orders[0]) => {
    const dbProduct = products.find((p) => p.id === order.productId);
    const displayImage = dbProduct ? dbProduct.image : order.image;
    switch (activeTab) {
      case "active":
        return (
          <View key={order.id} style={styles.orderCard}>
            {}
            <View style={styles.cardHeaderRow}>
              <Text style={styles.orderIdText}>Order ID : <Text style={styles.boldText}>{order.orderId}</Text></Text>
              <View style={[styles.statusBadge, styles.activeBadge]}>
                <Text style={styles.activeBadgeText}>Active Order</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {}
            <View style={styles.productRow}>
              <Image source={displayImage} style={styles.productImage} contentFit="cover" />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{order.name}</Text>
                <Text style={styles.productDetails}>
                  {order.category} | Size: {order.size} | Qty : {order.quantity}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#EEA756" />
                  <Text style={styles.ratingText}>5.0</Text>
                </View>
                <Text style={styles.priceText}>${order.price.toFixed(2)}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.7}
                onPress={() => handleCancelClick(order.orderId, order.name)}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={() => handleTrackClick(order.orderId)}
              >
                <Text style={styles.primaryButtonText}>Track Shipment</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case "completed":
        return (
          <TouchableOpacity
            key={order.id}
            style={styles.orderCard}
            activeOpacity={0.9}
            onPress={() =>
              router.push({
                pathname: "/order-details" as any,
                params: { orderId: order.orderId, productId: order.productId },
              })
            }
          >
            {}
            <View style={styles.cardHeaderRow}>
              <Text style={styles.orderIdText}>Order ID : <Text style={styles.boldText}>{order.orderId}</Text></Text>
              <View style={[styles.statusBadge, styles.completedBadge]}>
                <Text style={styles.completedBadgeText}>Completed Order</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {}
            <View style={styles.productRow}>
              <Image source={displayImage} style={styles.productImage} contentFit="cover" />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{order.name}</Text>
                <Text style={styles.productDetails}>
                  {order.category} | Size: {order.size} | Qty : {order.quantity}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#EEA756" />
                  <Text style={styles.ratingText}>4.8</Text>
                </View>
                <Text style={styles.priceText}>${order.price.toFixed(2)}</Text>
              </View>
            </View>

            {}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.7}
                onPress={() =>
                  router.push({
                    pathname: "/leave-review" as any,
                    params: { id: order.productId },
                  })
                }
              >
                <Text style={styles.secondaryButtonText}>Leave Review</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={() => router.push("/e-receipt")}
              >
                <Text style={styles.primaryButtonText}>View E-Receipt</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );

      case "cancelled":
        return (
          <View key={order.id} style={styles.orderCard}>
            {}
            <View style={styles.cardHeaderRow}>
              <Text style={styles.orderIdText}>Order ID : <Text style={styles.boldText}>{order.orderId}</Text></Text>
              <View style={[styles.statusBadge, styles.cancelledBadge]}>
                <Text style={styles.cancelledBadgeText}>Cancel Order</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {}
            <View style={styles.productRow}>
              <Image source={displayImage} style={styles.productImage} contentFit="cover" />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{order.name}</Text>
                <Text style={styles.productDetails}>
                  {order.category} | Size: {order.size} | Qty : {order.quantity}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#EEA756" />
                  <Text style={styles.ratingText}>4.7</Text>
                </View>
                <Text style={styles.priceText}>${order.price.toFixed(2)}</Text>
              </View>
            </View>

            {}
            <View style={styles.fullWidthButtonRow}>
              <TouchableOpacity
                style={styles.reorderButton}
                activeOpacity={0.85}
                onPress={() => handleReorderClick(order.orderId, order.name)}
              >
                <Text style={styles.reorderButtonText}>Re - Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.circleHeaderBtn}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity
          style={styles.circleHeaderBtn}
          onPress={handleSearch}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      {}
      <View style={styles.tabBarContainer}>
        {}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab("active")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === "active" && styles.tabTextActive]}>
            Active
          </Text>
          {activeTab === "active" && (
            <View style={styles.tabIndicatorContainer}>
              <View style={styles.tabIndicatorLine} />
              <View style={styles.tabIndicatorBump} />
            </View>
          )}
        </TouchableOpacity>

        {}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab("completed")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === "completed" && styles.tabTextActive]}>
            Completed
          </Text>
          {activeTab === "completed" && (
            <View style={styles.tabIndicatorContainer}>
              <View style={styles.tabIndicatorLine} />
              <View style={styles.tabIndicatorBump} />
            </View>
          )}
        </TouchableOpacity>

        {}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab("cancelled")}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === "cancelled" && styles.tabTextActive]}>
            Cancelled
          </Text>
          {activeTab === "cancelled" && (
            <View style={styles.tabIndicatorContainer}>
              <View style={styles.tabIndicatorLine} />
              <View style={styles.tabIndicatorBump} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 16 },
        ]}
      >
        {filteredOrders.length > 0 ? (
          filteredOrders.map(renderOrderCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={TEXT_MUTED} />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>
              {"You don't have any "}{activeTab}{" orders at the moment."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFFFFF",
    paddingBottom: 12,
  },
  circleHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },

  tabBarContainer: {
    flexDirection: "row",
    borderBottomWidth: 1.2,
    borderColor: "#EAEAEA",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    position: "relative",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#9A9A9A",
  },
  tabTextActive: {
    color: BROWN_DARK,
    fontWeight: "700",
  },
  tabIndicatorContainer: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  tabIndicatorLine: {
    width: "100%",
    height: 3,
    backgroundColor: BROWN_DARK,
    borderRadius: 1.5,
  },
  tabIndicatorBump: {
    width: 8,
    height: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: BROWN_DARK,
    position: "absolute",
    top: -4,
  },

  
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  orderCard: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },
  orderIdText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  boldText: {
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeBadge: {
    borderColor: "#FFE0B2",
    backgroundColor: "#FFF8E1",
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF9800",
  },
  completedBadge: {
    borderColor: "#C8E6C9",
    backgroundColor: "#E8F5E9",
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D32",
  },
  cancelledBadge: {
    borderColor: "#FFCDD2",
    backgroundColor: "#FFEBEE",
  },
  cancelledBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C62828",
  },
  divider: {
    height: 1,
    backgroundColor: "#F4F4F4",
    marginBottom: 12,
  },
  productRow: {
    flexDirection: "row",
  },
  productImage: {
    width: 84,
    height: 84,
    borderRadius: 16,
    backgroundColor: "#F7F7F7",
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  productDetails: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },
  priceText: {
    fontSize: 15,
    fontWeight: "800",
    color: BROWN_DARK,
    marginTop: 6,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F6F6F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: BROWN_DARK,
  },
  primaryButton: {
    flex: 1.2,
    height: 48,
    borderRadius: 24,
    backgroundColor: BROWN_DARK,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  fullWidthButtonRow: {
    marginTop: 16,
  },
  reorderButton: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    backgroundColor: BROWN_DARK,
    justifyContent: "center",
    alignItems: "center",
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
