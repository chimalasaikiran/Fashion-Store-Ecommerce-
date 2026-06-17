import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";


const BROWN_DARK = Colors.primary;
const ACCENT = Colors.accent;
const LIGHT_BG = Colors.background;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;
const BORDER_COLOR = Colors.borderLight;

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  
  const [salesNotify, setSalesNotify] = useState(true);
  const [orderNotify, setOrderNotify] = useState(true);
  const [newArrivalsNotify, setNewArrivalsNotify] = useState(false);
  const [securityNotify, setSecurityNotify] = useState(true);

  
  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSuccessMsg("Account successfully deleted.");
      setIsDeleteModalVisible(false);
      
      
      setTimeout(() => {
        setSuccessMsg(null);
        router.replace("/signin");
      }, 1500);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {}
      {successMsg && (
        <View style={[styles.alertContainer, styles.successAlert, { top: insets.top + 10 }]}>
          <Ionicons name="checkmark-circle" size={20} color="#1E4620" />
          <Text style={styles.successText}>{successMsg}</Text>
        </View>
      )}

      {}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {}
        <View style={styles.menuContainer}>
          {}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setIsNotificationModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="notifications-outline" size={20} color={ACCENT} />
              </View>
              <Text style={styles.menuItemLabel}>Notification Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={ACCENT} />
          </TouchableOpacity>

          {}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/password-manager")}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="key-outline" size={20} color={ACCENT} />
              </View>
              <Text style={styles.menuItemLabel}>Password Manager</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={ACCENT} />
          </TouchableOpacity>

          {}
          <TouchableOpacity
            style={[styles.menuItem, styles.lastMenuItem]}
            onPress={() => setIsDeleteModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="trash-outline" size={20} color={ACCENT} />
              </View>
              <Text style={styles.menuItemLabel}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={ACCENT} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {}
      <Modal
        visible={isNotificationModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsNotificationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBgDismiss}
            activeOpacity={1}
            onPress={() => setIsNotificationModalVisible(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.grabHandle} />
            <Text style={styles.modalTitle}>Notification Settings</Text>
            <View style={styles.modalDivider} />

            {}
            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>Order Status Updates</Text>
                <Text style={styles.toggleSubtitle}>Notify me about my package deliveries</Text>
              </View>
              <Switch
                value={orderNotify}
                onValueChange={setOrderNotify}
                trackColor={{ false: "#D1D1D6", true: BROWN_DARK }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>Sales & Promotions</Text>
                <Text style={styles.toggleSubtitle}>Alerts for flash sales and discounts</Text>
              </View>
              <Switch
                value={salesNotify}
                onValueChange={setSalesNotify}
                trackColor={{ false: "#D1D1D6", true: BROWN_DARK }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>New Arrivals</Text>
                <Text style={styles.toggleSubtitle}>Updates on new clothing collections</Text>
              </View>
              <Switch
                value={newArrivalsNotify}
                onValueChange={setNewArrivalsNotify}
                trackColor={{ false: "#D1D1D6", true: BROWN_DARK }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.toggleRow}>
              <View style={styles.toggleLeft}>
                <Text style={styles.toggleTitle}>Account Security</Text>
                <Text style={styles.toggleSubtitle}>Alerts about login activity and updates</Text>
              </View>
              <Switch
                value={securityNotify}
                onValueChange={setSecurityNotify}
                trackColor={{ false: "#D1D1D6", true: BROWN_DARK }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity
              style={styles.closeModalBtn}
              activeOpacity={0.8}
              onPress={() => setIsNotificationModalVisible(false)}
            >
              <Text style={styles.closeModalBtnText}>Save Preferences</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {}
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBgDismiss}
            activeOpacity={1}
            onPress={() => setIsDeleteModalVisible(false)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.grabHandle} />
            <Text style={[styles.modalTitle, { color: "#D32F2F" }]}>Delete Account</Text>
            <View style={styles.modalDivider} />
            <Text style={styles.modalText}>
              Are you sure you want to delete your account? This action is permanent and all your profile information, order history, and saved items will be deleted immediately.
            </Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                activeOpacity={0.7}
                onPress={() => setIsDeleteModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteBtn}
                activeOpacity={0.7}
                onPress={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteBtnText}>Yes, Delete</Text>
                )}
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
    borderColor: BORDER_COLOR,
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  menuContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F4ECE3",
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FCF5ED",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F7EFE6",
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
    fontWeight: "500",
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 22,
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
  confirmDeleteBtn: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#D32F2F",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmDeleteBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  toggleLeft: {
    flex: 1,
    paddingRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  closeModalBtn: {
    backgroundColor: BROWN_DARK,
    borderRadius: 27,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  closeModalBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
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
});
