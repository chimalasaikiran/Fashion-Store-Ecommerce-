import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Clipboard,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useOrders } from "../../context/OrderContext";
import { useWishlist } from "../../context/WishlistContext";
import { Colors } from "../../constants/Colors";

const BROWN_DARK = Colors.primary;
const ACCENT = Colors.accent;
const TEXT_PRIMARY = Colors.textPrimary;
const TEXT_MUTED = Colors.textMuted;
const BORDER_COLOR = Colors.borderLight;
const DIVIDER_COLOR = Colors.divider;

export default function OrderDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { orders, createReturnRequest, createReplacementRequest } = useOrders();
  const { products } = useWishlist();

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("Size doesn't fit");
  const [returnComments, setReturnComments] = useState("");
  const [replacementReason, setReplacementReason] = useState("");
  const [copied, setCopied] = useState(false);

  const orderId = params.orderId as string;
  const productId = params.productId as string;

  // Find matching order item
  const orderItem = orders.find(
    (o) => o.orderId === orderId && o.productId === productId
  ) || orders.find((o) => o.orderId === orderId);

  const handleBack = () => {
    router.back();
  };

  const handleCopyTransactionId = () => {
    if (orderItem && orderItem.transactionId) {
      Clipboard.setString(orderItem.transactionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReturnSubmit = async () => {
    if (!orderItem) return;
    const finalReason = returnReason === "Other" && returnComments ? returnComments : returnReason;
    if (!finalReason) {
      Alert.alert("Error", "Please select or enter a reason for returning the item.");
      return;
    }
    try {
      await createReturnRequest(orderItem.orderId, finalReason, orderItem.name, orderItem.price);
      setIsReturnModalOpen(false);
      Alert.alert("Success", "Your return request has been submitted successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit return request. Please try again.");
    }
  };

  const handleReplacementSubmit = async () => {
    if (!orderItem) return;
    if (!replacementReason.trim()) {
      Alert.alert("Error", "Please enter a reason for the replacement.");
      return;
    }
    try {
      await createReplacementRequest(orderItem.orderId, replacementReason, orderItem.name, orderItem.name);
      setIsReplacementModalOpen(false);
      Alert.alert("Success", "Your replacement request has been submitted successfully!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit replacement request. Please try again.");
    }
  };

  if (!orderItem) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.circleHeaderBtn} onPress={handleBack}>
            <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyWrapper}>
          <Ionicons name="document-text-outline" size={64} color={TEXT_MUTED} />
          <Text style={styles.emptyTitle}>Order Not Found</Text>
          <Text style={styles.emptySubtitle}>
            We couldn't retrieve the details for this order. Please try again.
          </Text>
        </View>
      </View>
    );
  }

  // Resolve matching product image
  const dbProduct = products.find((p) => p.id === orderItem.productId);
  const displayImage = dbProduct ? dbProduct.image : orderItem.image;

  // Resolve Timeline Events
  const getTimelineEvent = (key: string) => {
    if (!orderItem.timeline) return null;
    if (key === "evt-payment") {
      return orderItem.timeline.find((e: any) => e.id === "evt-payment");
    }
    if (key === "evt-confirmed") {
      return orderItem.timeline.find(
        (e: any) =>
          e.id === "evt-confirmed" ||
          e.title === "Order Confirmed" ||
          e.title === "Processing"
      );
    }
    if (key === "evt-shipped") {
      return orderItem.timeline.find(
        (e: any) =>
          e.id === "evt-shipped" ||
          e.id === "evt-dispatched" ||
          e.title === "Shipped" ||
          e.title === "Dispatched"
      );
    }
    if (key === "evt-out-for-delivery") {
      return orderItem.timeline.find(
        (e: any) =>
          e.id === "evt-out-for-delivery" ||
          e.title === "Out for Delivery" ||
          e.title === "Out For Delivery"
      );
    }
    if (key === "evt-delivered") {
      return orderItem.timeline.find(
        (e: any) => e.id === "evt-delivered" || e.title === "Delivered"
      );
    }
    return null;
  };

  const stages = [
    { key: "evt-payment", title: "Order Placed", defaultIcon: "card-outline" },
    { key: "evt-confirmed", title: "Processing", defaultIcon: "checkbox-outline" },
    { key: "evt-shipped", title: "Shipped", defaultIcon: "truck-outline" },
    { key: "evt-out-for-delivery", title: "Out for Delivery", defaultIcon: "bicycle-outline" },
    { key: "evt-delivered", title: "Delivered", defaultIcon: "checkmark-circle-outline" },
  ];

  const timelineSteps = stages.map((stage, index) => {
    const evt = getTimelineEvent(stage.key);
    let completed = false;
    let timestamp = "";

    if (evt) {
      completed = evt.status === "completed" || evt.status === "current";
      timestamp = evt.timestamp || "";
    } else {
      // Fallback: if any stage after this one is completed, then this stage must be completed
      const anyLaterCompleted = stages.slice(index + 1).some((s) => {
        const laterEvt = getTimelineEvent(s.key);
        return (
          laterEvt &&
          (laterEvt.status === "completed" || laterEvt.status === "current")
        );
      });
      completed = anyLaterCompleted;
    }

    return {
      title: stage.title,
      time: timestamp,
      completed,
      icon: stage.defaultIcon,
    };
  });

  const isDeliveredOrCompleted =
    orderItem.status === "completed" ||
    (orderItem.orderStatus && orderItem.orderStatus.toLowerCase() === "delivered");

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.circleHeaderBtn}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + (isDeliveredOrCompleted ? 90 : 20) },
        ]}
      >
        {/* Complete Order Info */}
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>Order ID</Text>
              <Text style={styles.gridValue}>{orderItem.orderId}</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>Order Date</Text>
              <Text style={styles.gridValue}>{orderItem.date}</Text>
            </View>
          </View>
          <View style={styles.rowDivider} />
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>Order Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  isDeliveredOrCompleted
                    ? styles.statusCompletedBadge
                    : orderItem.status === "cancelled"
                    ? styles.statusCancelledBadge
                    : styles.statusActiveBadge,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isDeliveredOrCompleted
                      ? styles.statusCompletedText
                      : orderItem.status === "cancelled"
                      ? styles.statusCancelledText
                      : styles.statusActiveText,
                  ]}
                >
                  {orderItem.orderStatus || (isDeliveredOrCompleted ? "Delivered" : "Active")}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Product Details */}
        <Text style={styles.sectionTitle}>Product Details</Text>
        <View style={styles.productCard}>
          <Image
            source={displayImage}
            style={styles.productImage}
            contentFit="cover"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {orderItem.name}
            </Text>
            <Text style={styles.productCategory}>{orderItem.category}</Text>
            <Text style={styles.productMeta}>
              Size: {orderItem.size}  |  Qty: {orderItem.quantity}  |  Color: {orderItem.color}
            </Text>
            <Text style={styles.priceText}>
              ${(orderItem.price * orderItem.quantity).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Delivery Details */}
        <Text style={styles.sectionTitle}>Delivery Details</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailsRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-outline" size={18} color={ACCENT} />
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Recipient</Text>
              <Text style={styles.detailsValue}>
                {orderItem.shippingAddress?.name || "Customer"}
              </Text>
            </View>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.detailsRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="location-outline" size={18} color={ACCENT} />
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Shipping Address</Text>
              <Text style={styles.detailsValue}>
                {orderItem.shippingAddress
                  ? `${orderItem.shippingAddress.street}, ${orderItem.shippingAddress.city}, ${orderItem.shippingAddress.state} ${orderItem.shippingAddress.zip}, ${orderItem.shippingAddress.country}`
                  : "123 Apparel Blvd, Suite 400, San Francisco, CA 94103"}
              </Text>
            </View>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.detailsRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="call-outline" size={18} color={ACCENT} />
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Phone</Text>
              <Text style={styles.detailsValue}>
                {orderItem.shippingAddress?.phone || "+1 (208) 555-0112"}
              </Text>
            </View>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.detailsRow}>
            <View style={styles.iconCircle}>
              <Feather name="truck" size={18} color={ACCENT} />
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Courier Partner & Method</Text>
              <Text style={styles.detailsValue}>
                {orderItem.courierPartner || "Delhivery"} ({orderItem.shippingMethod || "Economy"})
              </Text>
            </View>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.detailsRow}>
            <View style={styles.iconCircle}>
              <Feather name="hash" size={18} color={ACCENT} />
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Tracking ID</Text>
              <Text style={styles.detailsValue}>
                {orderItem.trackingId || "Pending Manifest"}
              </Text>
            </View>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.detailsRow}>
            <View style={styles.iconCircle}>
              <Feather name="calendar" size={18} color={ACCENT} />
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Delivery Date</Text>
              <Text style={styles.detailsValue}>
                {orderItem.deliveryDate || "Pending"}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Information */}
        <Text style={styles.sectionTitle}>Payment Information</Text>
        <View style={styles.detailsContainer}>
          <View style={styles.detailsRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="card-outline" size={18} color={ACCENT} />
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Payment Method</Text>
              <Text style={styles.detailsValue}>{orderItem.paymentMethod || "Wallet"}</Text>
            </View>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.detailsRow}>
            <View style={styles.iconCircle}>
              <Feather name="shield" size={18} color={ACCENT} />
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Transaction ID</Text>
              <View style={styles.transactionIdWrapper}>
                <Text style={styles.detailsValue}>
                  {orderItem.transactionId || "TRN-MOCK-PENDING"}
                </Text>
                {orderItem.transactionId && (
                  <TouchableOpacity
                    onPress={handleCopyTransactionId}
                    style={styles.copyButton}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="copy-outline" size={16} color={ACCENT} />
                  </TouchableOpacity>
                )}
                {copied && (
                  <View style={styles.copiedBadge}>
                    <Text style={styles.copiedBadgeText}>Copied</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.detailsRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="pricetag-outline" size={18} color={ACCENT} />
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Promo Code</Text>
              <Text style={styles.detailsValue}>
                {orderItem.promoCode || "None Applied"}
              </Text>
            </View>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.detailsRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="wallet-outline" size={18} color={ACCENT} />
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Total Order Cost</Text>
              <Text style={styles.detailsValue}>
                ${(orderItem.totalAmount || orderItem.price * orderItem.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Track Timeline */}
        <Text style={styles.sectionTitle}>Fulfillment Timeline</Text>
        <View style={styles.statusTimeline}>
          {timelineSteps.map((step, index) => {
            const isLast = index === timelineSteps.length - 1;
            return (
              <View key={index} style={styles.timelineRow}>
                {/* Left Line & Indicator */}
                <View style={styles.leftTimelineCol}>
                  <View
                    style={[
                      styles.timelineIndicatorCircle,
                      step.completed ? styles.indicatorCompleted : styles.indicatorIncomplete,
                    ]}
                  >
                    {step.completed ? (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    ) : null}
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineConnectorLine,
                        step.completed
                          ? styles.connectorCompleted
                          : styles.connectorIncomplete,
                      ]}
                    />
                  )}
                </View>

                {/* Timeline Details */}
                <View style={styles.timelineDetails}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      step.completed ? styles.timelineTitleActive : styles.timelineTitleInactive,
                    ]}
                  >
                    {step.title}
                  </Text>
                  {step.time ? <Text style={styles.timelineTime}>{step.time}</Text> : null}
                </View>

                {/* Right Icon representation */}
                <View style={styles.rightTimelineCol}>
                  {step.icon === "truck-outline" ? (
                    <MaterialCommunityIcons
                      name="truck-delivery-outline"
                      size={20}
                      color={step.completed ? ACCENT : "#D5C1AE"}
                    />
                  ) : (
                    <Ionicons
                      name={step.icon as any}
                      size={20}
                      color={step.completed ? ACCENT : "#D5C1AE"}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Return & Replacement Buttons */}
      {isDeliveredOrCompleted && (
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.returnButton}
              activeOpacity={0.7}
              onPress={() => setIsReturnModalOpen(true)}
            >
              <Text style={styles.returnButtonText}>Return</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.replacementButton}
              activeOpacity={0.85}
              onPress={() => setIsReplacementModalOpen(true)}
            >
              <Text style={styles.replacementButtonText}>Replacement</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Return Modal */}
      <Modal
        visible={isReturnModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsReturnModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Return Request</Text>
            <Text style={styles.modalSubtitle}>
              Please select a reason for returning this item.
            </Text>

            <View style={styles.reasonsList}>
              {[
                "Size doesn't fit",
                "Product color not as shown",
                "Damaged/Defective product received",
                "Incorrect item received",
                "Other",
              ].map((reason) => {
                const isSelected = returnReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={styles.reasonRow}
                    activeOpacity={0.7}
                    onPress={() => setReturnReason(reason)}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.reasonText}>{reason}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TextInput
              style={styles.commentsInput}
              placeholder="Additional comments (optional)"
              placeholderTextColor="#9A9A9A"
              multiline={true}
              value={returnComments}
              onChangeText={setReturnComments}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                activeOpacity={0.7}
                onPress={() => setIsReturnModalOpen(false)}
              >
                <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                activeOpacity={0.8}
                onPress={handleReturnSubmit}
              >
                <Text style={styles.modalPrimaryButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Replacement Modal */}
      <Modal
        visible={isReplacementModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsReplacementModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Replacement Request</Text>
            <Text style={styles.modalSubtitle}>
              Please provide the reason for replacing this item.
            </Text>

            <TextInput
              style={[styles.commentsInput, { height: 100, marginTop: 16 }]}
              placeholder="E.g., Need size L instead of M, or item was damaged during shipment."
              placeholderTextColor="#9A9A9A"
              multiline={true}
              value={replacementReason}
              onChangeText={setReplacementReason}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                activeOpacity={0.7}
                onPress={() => setIsReplacementModalOpen(false)}
              >
                <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                activeOpacity={0.8}
                onPress={handleReplacementSubmit}
              >
                <Text style={styles.modalPrimaryButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  emptyWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginTop: 18,
    marginBottom: 12,
  },
  productCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 8,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#F7F7F7",
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 3,
  },
  productCategory: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  productMeta: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "800",
    color: BROWN_DARK,
  },
  detailsContainer: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 8,
  },
  gridRow: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  gridCol: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusActiveBadge: {
    borderColor: "#FFE0B2",
    backgroundColor: "#FFF8E1",
  },
  statusActiveBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FF9800",
  },
  statusCompletedBadge: {
    borderColor: "#C8E6C9",
    backgroundColor: "#E8F5E9",
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  statusCompletedText: {
    color: "#2E7D32",
  },
  statusCancelledBadge: {
    borderColor: "#FFCDD2",
    backgroundColor: "#FFEBEE",
  },
  statusCancelledText: {
    color: "#C62828",
  },
  statusActiveText: {
    color: "#FF9800",
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FCFAF7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FAF0E6",
  },
  detailsText: {
    marginLeft: 16,
    flex: 1,
  },
  detailsLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  detailsValue: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    lineHeight: 18,
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#F6F6F6",
    marginVertical: 4,
  },
  transactionIdWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    position: "relative",
  },
  copyButton: {
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  copiedBadge: {
    position: "absolute",
    left: 140,
    backgroundColor: BROWN_DARK,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  copiedBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  statusTimeline: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 22,
    padding: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: "row",
    minHeight: 64,
  },
  leftTimelineCol: {
    alignItems: "center",
    width: 28,
  },
  timelineIndicatorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  indicatorCompleted: {
    backgroundColor: BROWN_DARK,
  },
  indicatorIncomplete: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#D5C1AE",
  },
  timelineConnectorLine: {
    width: 3,
    flex: 1,
    marginVertical: -2,
    zIndex: 1,
  },
  connectorCompleted: {
    backgroundColor: BROWN_DARK,
  },
  connectorIncomplete: {
    backgroundColor: "#EAEAEA",
  },
  timelineDetails: {
    flex: 1,
    marginLeft: 16,
    paddingTop: 1,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  timelineTitleActive: {
    color: TEXT_PRIMARY,
  },
  timelineTitleInactive: {
    color: "#9A9A9A",
  },
  timelineTime: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  rightTimelineCol: {
    justifyContent: "center",
    paddingRight: 4,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingTop: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderColor: "#F9F6F2",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  returnButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: BROWN_DARK,
    justifyContent: "center",
    alignItems: "center",
  },
  returnButtonText: {
    color: BROWN_DARK,
    fontSize: 15,
    fontWeight: "700",
  },
  replacementButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: BROWN_DARK,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  replacementButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  modalSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 6,
    lineHeight: 16,
  },
  reasonsList: {
    marginTop: 16,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D5C1AE",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: BROWN_DARK,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BROWN_DARK,
  },
  reasonText: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: "500",
  },
  commentsInput: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 12,
    height: 60,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: TEXT_PRIMARY,
    marginTop: 12,
    textAlignVertical: "top",
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalSecondaryButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  modalSecondaryButtonText: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: "700",
  },
  modalPrimaryButton: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: BROWN_DARK,
    justifyContent: "center",
    alignItems: "center",
  },
  modalPrimaryButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
