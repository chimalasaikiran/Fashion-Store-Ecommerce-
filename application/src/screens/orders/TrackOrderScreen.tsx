import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useOrders } from "../../context/OrderContext";
import { Colors } from "../../constants/Colors";


const BROWN_DARK = Colors.primary; 
const ACCENT = Colors.accent; 
const TEXT_PRIMARY = Colors.textPrimary;
const TEXT_MUTED = Colors.textMuted;
const BORDER_COLOR = Colors.borderLight;

export default function TrackOrderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { orders } = useOrders();

  
  const orderId = params.orderId as string;
  const order = orders.find((o) => o.orderId === orderId) || orders[0];

  const handleBack = () => {
    router.back();
  };

  const getTimelineTime = (eventId: string, defaultVal: string) => {
    if (order && order.timeline) {
      const evt = order.timeline.find((e: any) => e.id === eventId);
      if (evt && evt.timestamp) return evt.timestamp;
    }
    return defaultVal;
  };

  const currentStatus = order ? (order.orderStatus || order.status) : "Pending";
  const currentStatusLower = currentStatus.toLowerCase();

  const isStepCompleted = (eventId: string, statusLowerList: string[]) => {
    if (order && order.timeline && order.timeline.length > 0) {
      const evt = order.timeline.find((e: any) => e.id === eventId);
      if (evt) {
        return evt.status === "completed";
      }
    }
    return statusLowerList.includes(currentStatusLower);
  };

  const timelineSteps = [
    {
      title: "Pending",
      time: getTimelineTime("evt-placed", order ? order.date : "Pending"),
      icon: "document-text-outline",
      iconType: "ionicons" as const,
      completed: true,
    },
    {
      title: "Processing",
      time: getTimelineTime("evt-processing", "Awaiting confirmation"),
      icon: "cube-outline",
      iconType: "ionicons" as const,
      completed: isStepCompleted("evt-processing", ["processing", "dispatched", "shipped", "out for delivery", "delivered"]),
    },
    {
      title: "Dispatched",
      time: getTimelineTime("evt-dispatched", "Awaiting dispatch"),
      icon: "cube-outline",
      iconType: "ionicons" as const,
      completed: isStepCompleted("evt-dispatched", ["dispatched", "shipped", "out for delivery", "delivered"]),
    },
    {
      title: "Shipped",
      time: getTimelineTime("evt-shipped", "Awaiting shipping"),
      icon: "truck-outline",
      iconType: "ionicons" as const,
      completed: isStepCompleted("evt-shipped", ["shipped", "out for delivery", "delivered"]),
    },
    {
      title: "Out for Delivery",
      time: getTimelineTime("evt-out-for-delivery", "Awaiting delivery agent"),
      icon: "truck-outline",
      iconType: "ionicons" as const,
      completed: isStepCompleted("evt-out-for-delivery", ["out for delivery", "delivered"]),
    },
    {
      title: "Delivered",
      time: getTimelineTime("evt-delivered", `Expected by ${order ? order.deliveryDate : "Pending"}`),
      icon: "checkmark-circle-outline",
      iconType: "ionicons" as const,
      completed: isStepCompleted("evt-delivered", ["delivered"]),
    },
  ];

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
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
      >
        {}
        <View style={styles.productCard}>
          <Image source={order.image} style={styles.productImage} contentFit="cover" />
          <View style={styles.productInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.productName} numberOfLines={1}>{order.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#EEA756" />
                <Text style={styles.ratingText}>5.0</Text>
              </View>
            </View>
            <Text style={styles.productDetails}>
              {order.category} | Size: {order.size} | Qty : {order.quantity}
            </Text>
            <Text style={styles.priceText}>${order.price.toFixed(2)}</Text>
          </View>
        </View>

        {}
        <Text style={styles.sectionTitle}>Order Details</Text>
        <View style={styles.detailsContainer}>
          {}
          <View style={styles.detailsRow}>
            <View style={styles.iconCircle}>
              <Feather name="truck" size={18} color={ACCENT} />
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Expected Delivery Date</Text>
              <Text style={styles.detailsValue}>
                {order.orderId === "#FN854536" ? "March 11, 2026 | 03:00 PM" : order.deliveryDate}
              </Text>
            </View>
          </View>

          <View style={styles.rowDivider} />

          {}
          <View style={styles.detailsRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={18} color={ACCENT} />
            </View>
            <View style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Order ID</Text>
              <Text style={styles.detailsValue}>{order.orderId}</Text>
            </View>
          </View>
        </View>

        {}
        <Text style={styles.sectionTitle}>Order Status</Text>
        <View style={styles.statusTimeline}>
          {timelineSteps.map((step, index) => {
            const isLast = index === timelineSteps.length - 1;
            return (
              <View key={index} style={styles.timelineRow}>
                {}
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

                {}
                <View style={styles.timelineDetails}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      step.completed ? styles.timelineTitleActive : styles.timelineTitleInactive,
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text style={styles.timelineTime}>{step.time}</Text>
                </View>

                {}
                <View style={styles.rightTimelineCol}>
                  {step.iconType === "ionicons" ? (
                    <Ionicons
                      name={step.icon as any}
                      size={20}
                      color={step.completed ? ACCENT : "#D5C1AE"}
                    />
                  ) : (
                    <Feather
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
    marginBottom: 24,
  },
  productImage: {
    width: 78,
    height: 78,
    borderRadius: 16,
    backgroundColor: "#F7F7F7",
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    flex: 1,
    marginRight: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },
  productDetails: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "800",
    color: BROWN_DARK,
    marginTop: 6,
  },

  
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 12,
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
    marginBottom: 24,
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
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#F6F6F6",
    marginVertical: 4,
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
  trackLiveLocationBtn: {
    backgroundColor: BROWN_DARK,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  trackLiveLocationBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
