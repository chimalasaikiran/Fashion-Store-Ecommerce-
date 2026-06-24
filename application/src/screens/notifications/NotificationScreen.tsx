import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle } from "react-native-svg";
import { Colors } from "../../constants/Colors";
import { useNotifications } from "../../context/NotificationContext";


const BROWN_DARK = Colors.primary; 
const ACCENT = Colors.accent; 
const CARD_BG = Colors.background; 
const BORDER_COLOR = Colors.borderLight;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;



const ShipIcon = ({ isRead }: { isRead: boolean }) => {
  const color = isRead ? "#7A7A7A" : "#C27B3A";
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M16.5 17.5c0 .828-.672 1.5-1.5 1.5s-1.5-.672-1.5-1.5.672-1.5 1.5-1.5 1.5.672 1.5 1.5zm-8 0c0 .828-.672 1.5-1.5 1.5S5.5 18.328 5.5 17.5 6.172 16 7 16s1.5.672 1.5 1.5z"
        fill={color}
      />
      <Path
        d="M17 16H8.5c-.276 0-.5-.224-.5-.5v-9c0-.276.224-.5.5-.5H14c.276 0 .5.224.5.5V11M14.5 10.5H19c.21 0 .408.099.533.268l2.138 2.85c.189.252.293.56.293.878V15.5c0 .276-.224.5-.5.5H19"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {}
      <Path
        d="M8.5 11l1.5 1.5 3-3"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const SaleIcon = ({ isRead }: { isRead: boolean }) => {
  const color = isRead ? "#7A7A7A" : "#C27B3A";
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2.25 2.5 3.25-.5.5 3.25 2.5 2.25-1.5 3 1.5 3-2.5 2.25-.5 3.25-3.25-.5L12 22l-2.25-2.5-3.25.5-.5-3.25-2.5-2.25 1.5-3-1.5-3 2.5-2.25.5-3.25 3.25.5L12 2z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {}
      <Path
        d="M9.5 14.5l5-5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Circle cx="10" cy="10" r="1.2" fill={color} />
      <Circle cx="14" cy="14" r="1.2" fill={color} />
    </Svg>
  );
};

const ReviewIcon = ({ isRead }: { isRead: boolean }) => {
  const color = isRead ? "#7A7A7A" : "#C27B3A";
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l2.87 5.82 6.42.93-4.64 4.53 1.1 6.39L12 16.65l-5.75 3.02 1.1-6.39L2.71 8.75l6.42-.93L12 2z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

const WalletIcon = ({ isRead }: { isRead: boolean }) => {
  const color = isRead ? "#7A7A7A" : "#C27B3A";
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M16 12c0-.8.7-1.5 1.5-1.5H21v3h-3.5c-.8 0-1.5-.7-1.5-1.5z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#FFFFFF"
      />
      {}
      <Circle cx="18.5" cy="12" r="1" fill={color} />
    </Svg>
  );
};


interface NotificationItem {
  id: string;
  category: "today" | "yesterday";
  title: string;
  description: string;
  time: string;
  type: "ship" | "sale" | "review" | "paypal";
  isRead: boolean;
}


const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    category: "today",
    title: "Order Shipped",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    time: "1h",
    type: "ship",
    isRead: false, 
  },
  {
    id: "2",
    category: "today",
    title: "Flash Sale Alert",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    time: "1h",
    type: "sale",
    isRead: false, 
  },
  {
    id: "3",
    category: "today",
    title: "Product Review Request",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis",
    time: "1h",
    type: "review",
    isRead: true, 
  },
  {
    id: "4",
    category: "yesterday",
    title: "Order Shipped",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    time: "1d",
    type: "ship",
    isRead: true, 
  },
  {
    id: "5",
    category: "yesterday",
    title: "New Paypal Added",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    time: "1d",
    type: "paypal",
    isRead: true, 
  },
  {
    id: "6",
    category: "yesterday",
    title: "Flash Sale Alert",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    time: "1d",
    type: "sale",
    isRead: true, 
  },
];

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notifications, unreadCount, markAllAsRead, toggleRead } = useNotifications();

  const handleBack = () => {
    router.back();
  };

  const handleMarkAllAsRead = (category: "today" | "yesterday") => {
    markAllAsRead(category);
  };

  const handleToggleRead = (id: string) => {
    toggleRead(id);
  };

  const renderIcon = (type: string, isRead: boolean) => {
    
    const iconBgStyle = {
      backgroundColor: isRead ? "#F5F5F5" : "#FAF3EC",
    };

    return (
      <View style={[styles.iconContainer, iconBgStyle]}>
        {type === "ship" && <ShipIcon isRead={isRead} />}
        {type === "sale" && <SaleIcon isRead={isRead} />}
        {type === "review" && <ReviewIcon isRead={isRead} />}
        {type === "paypal" && <WalletIcon isRead={isRead} />}
      </View>
    );
  };

  const renderSection = (category: "today" | "yesterday", title: string) => {
    const sectionItems = notifications.filter((n) => n.category === category);
    if (sectionItems.length === 0) return null;

    return (
      <View style={styles.sectionContainer}>
        {}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <TouchableOpacity
            onPress={() => handleMarkAllAsRead(category)}
            activeOpacity={0.6}
          >
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.cardContainer}>
          {sectionItems.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => handleToggleRead(item.id)}
                activeOpacity={0.8}
              >
                {}
                {renderIcon(item.type, item.isRead)}

                {}
                <View style={styles.textDetails}>
                  <View style={styles.titleRow}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                </View>
              </TouchableOpacity>

              {}
              {index < sectionItems.length - 1 && (
                <View style={styles.itemDivider} />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {}
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Notification</Text>

        {unreadCount > 0 ? (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{unreadCount} NEW</Text>
          </View>
        ) : (
          <View style={styles.badgePlaceholder} />
        )}
      </View>

      {}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        {renderSection("today", "TODAY")}
        {renderSection("yesterday", "YESTERDAY")}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#FAFAFA",
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  badgeContainer: {
    backgroundColor: BROWN_DARK,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  badgePlaceholder: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  sectionContainer: {
    marginTop: 18,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#8E8E93",
    letterSpacing: 0.5,
  },
  markAllText: {
    fontSize: 14,
    color: ACCENT,
    fontWeight: "600",
  },
  cardContainer: {
    backgroundColor: CARD_BG,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 18,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  textDetails: {
    flex: 1,
    marginLeft: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    flex: 1,
    marginRight: 8,
  },
  itemTime: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  itemDescription: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 19,
  },
  itemDivider: {
    height: 1,
    backgroundColor: "#F7F7F7",
  },
});
