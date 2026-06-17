import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, Feather, FontAwesome5 } from "@expo/vector-icons";
import { useProfile } from "../../context/ProfileContext";
import { Colors } from "../../constants/Colors";


const BROWN_DARK = Colors.primary;
const ACCENT = Colors.accent;
const LIGHT_BG = Colors.background;
const GRAY_BG = Colors.backgroundGray;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

interface ProfileTabProps {
  onBack: () => void;
}

export function ProfileTab({ onBack }: ProfileTabProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile } = useProfile();
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);

  const menuItems = [
    {
      id: "your_profile",
      label: "Your profile",
      icon: "person-outline",
      iconType: "ionicons",
      route: "/your-profile",
    },
    {
      id: "manage_address",
      label: "Manage Address",
      icon: "location-outline",
      iconType: "ionicons",
      route: "/shipping-address",
    },
    {
      id: "payment_methods",
      label: "Payment Methods",
      icon: "credit-card",
      iconType: "feather",
      route: "/payment-methods",
    },
    {
      id: "my_orders",
      label: "My Orders",
      icon: "clipboard-outline",
      iconType: "ionicons",
      route: "/my-orders",
    },
    {
      id: "my_coupons",
      label: "My Coupons",
      icon: "ticket-outline",
      iconType: "ionicons",
      route: "/my-coupons",
    },
    {
      id: "my_wallet",
      label: "My Wallet",
      icon: "wallet-outline",
      iconType: "ionicons",
      route: "/my-wallet",
    },
    {
      id: "settings",
      label: "Settings",
      icon: "settings-outline",
      iconType: "ionicons",
      route: "/settings",
    },
    {
      id: "help_center",
      label: "Help Center",
      icon: "help-circle-outline",
      iconType: "ionicons",
      route: "/help-center",
    },
    {
      id: "privacy_policy",
      label: "Privacy Policy",
      icon: "shield-checkmark-outline",
      iconType: "ionicons",
      route: "/privacy-policy",
    },
    {
      id: "invite_friends",
      label: "Invite Friends",
      icon: "people-outline",
      iconType: "ionicons",
      route: "/invite-friends",
    },
    {
      id: "logout",
      label: "Logout",
      icon: "log-out-outline",
      iconType: "ionicons",
      route: "logout_modal_trigger",
    },
  ];

  const handlePress = (item: typeof menuItems[0]) => {
    if (item.route === "logout_modal_trigger") {
      setIsLogoutVisible(true);
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  const handleConfirmLogout = () => {
    setIsLogoutVisible(false);
    setTimeout(() => {
      router.replace("/signin");
    }, 200);
  };

  const renderIcon = (icon: string, type: string) => {
    if (type === "feather") {
      return <Feather name={icon as any} size={20} color={BROWN_DARK} />;
    }
    return <Ionicons name={icon as any} size={20} color={BROWN_DARK} />;
  };

  return (
    <View style={styles.root}>
      {}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={profile.avatar}
              style={styles.avatarImage}
              contentFit="cover"
            />
            <TouchableOpacity
              style={styles.editBadge}
              onPress={() => router.push("/your-profile")}
              activeOpacity={0.8}
            >
              <FontAwesome5 name="pencil-alt" size={10} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{profile.name}</Text>
        </View>

        {}
        <View style={styles.menuContainer}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                idx === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={() => handlePress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconCircle}>
                  {renderIcon(item.icon, item.iconType)}
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={ACCENT} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {}
      <Modal
        visible={isLogoutVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBgDismiss}
            activeOpacity={1}
            onPress={() => setIsLogoutVisible(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.grabHandle} />
            <Text style={styles.modalTitle}>Logout</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.7}
                onPress={() => setIsLogoutVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                activeOpacity={0.7}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.confirmBtnText}>Yes, Logout</Text>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 140, 
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BROWN_DARK,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    letterSpacing: -0.2,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GRAY_BG,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F4ECE3",
  },
  menuItemLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalBgDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  grabHandle: {
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 16,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#F2F2F2",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 32,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  confirmBtn: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: BROWN_DARK,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
