import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

const BROWN_DARK = Colors.primary; 
const ACCENT = Colors.accent; 
const CARD_BG = Colors.background; 
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

interface AddressItem {
  id: string;
  label: string;
  address: string;
}

const INITIAL_ADDRESSES: AddressItem[] = [
  {
    id: "1",
    label: "Home",
    address: "245 Madison Ave, New York, NY 10016, USA",
  },
  {
    id: "2",
    label: "Office",
    address: "780 Broadway, New York, NY 10003, USA",
  },
  {
    id: "3",
    label: "Parent's House",
    address: "210 E 34th St, New York, NY 10016, USA",
  },
  {
    id: "4",
    label: "Friend's House",
    address: "400 W 42nd St, New York, NY 10036, USA",
  },
];

export default function ShippingAddressScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  
  const [addresses, setAddresses] = useState<AddressItem[]>(INITIAL_ADDRESSES);
  const [selectedId, setSelectedId] = useState<string>("1");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddAddress = () => {
    if (!newLabel.trim()) {
      setErrorMsg("Please enter an address label.");
      return;
    }
    if (!newAddress.trim()) {
      setErrorMsg("Please enter the shipping address.");
      return;
    }

    const newId = (addresses.length + 1).toString();
    const item: AddressItem = {
      id: newId,
      label: newLabel.trim(),
      address: newAddress.trim(),
    };

    setAddresses([...addresses, item]);
    setSelectedId(newId);
    setNewLabel("");
    setNewAddress("");
    setErrorMsg(null);
    setIsModalVisible(false);

    
    setSuccessMsg("New shipping address added!");
    setTimeout(() => {
      setSuccessMsg(null);
    }, 2000);
  };

  const handleContinue = () => {
    if (!selectedId) return;
    router.push("/choose-shipping");
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

      {}
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 12,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shipping Address</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {}
          <View style={styles.addressesCard}>
            {addresses.map((item, index) => {
              const isSelected = selectedId === item.id;
              return (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.addressRow}
                    onPress={() => handleSelect(item.id)}
                    activeOpacity={0.85}
                  >
                    {}
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name="location-sharp"
                        size={22}
                        color={ACCENT}
                      />
                    </View>

                    {}
                    <View style={styles.detailsContainer}>
                      <Text style={styles.addressLabel}>{item.label}</Text>
                      <Text style={styles.addressText}>{item.address}</Text>
                    </View>

                    {}
                    <View
                      style={[
                        styles.radioButtonOuter,
                        isSelected && styles.radioButtonOuterActive,
                      ]}
                    >
                      {isSelected && <View style={styles.radioButtonInner} />}
                    </View>
                  </TouchableOpacity>

                  {index < addresses.length - 1 && (
                    <View style={styles.rowDivider} />
                  )}
                </View>
              );
            })}
          </View>

          {}
          <TouchableOpacity
            style={styles.addAddressBtn}
            onPress={() => {
              setErrorMsg(null);
              setIsModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.addAddressBtnText}>+ Add New Shipping Address</Text>
          </TouchableOpacity>
        </ScrollView>

        {}
        <View style={styles.footerContainer}>
          <TouchableOpacity
            style={[
              styles.continueBtn,
              !selectedId && styles.continueBtnDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={0.9}
            disabled={!selectedId}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>

      {}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalDismissArea}
            onPress={() => setIsModalVisible(false)}
          />
          <View style={styles.modalContent}>
            {}
            <View style={styles.modalGrabBar} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            {errorMsg && (
              <View style={styles.modalErrorBanner}>
                <Ionicons name="alert-circle" size={18} color="#5C1919" />
                <Text style={styles.modalErrorText}>{errorMsg}</Text>
              </View>
            )}

            {}
            <Text style={styles.inputLabel}>Address Label</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.inputField}
                placeholder="Ex. Home, Office, Beach House"
                placeholderTextColor="#AAAAAA"
                value={newLabel}
                onChangeText={setNewLabel}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <Text style={styles.inputLabel}>Full Shipping Address</Text>
            <View style={[styles.inputBox, styles.addressInputBox]}>
              <TextInput
                style={[styles.inputField, styles.addressInputField]}
                placeholder="Ex. 123 Main St, New York, NY 10001, USA"
                placeholderTextColor="#AAAAAA"
                value={newAddress}
                onChangeText={setNewAddress}
                multiline
                numberOfLines={3}
                returnKeyType="done"
              />
            </View>

            {}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleAddAddress}
                activeOpacity={0.9}
              >
                <Text style={styles.modalConfirmBtnText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FAFAFA", 
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EAEAEA",
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
  headerRightPlaceholder: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 100,
  },
  addressesCard: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FAF3EC", 
    justifyContent: "center",
    alignItems: "center",
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
    justifyContent: "center",
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 18,
  },
  radioButtonOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#E0D5C1", 
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonOuterActive: {
    borderColor: BROWN_DARK,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: BROWN_DARK,
  },
  rowDivider: {
    height: 1,
    backgroundColor: "#F5EFE9", 
    marginLeft: 82, 
    marginRight: 20,
  },
  addAddressBtn: {
    height: 56,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BROWN_DARK,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  addAddressBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: BROWN_DARK,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  continueBtn: {
    backgroundColor: BROWN_DARK,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  continueBtnDisabled: {
    backgroundColor: "#A8A8A8",
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnText: {
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

  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  modalGrabBar: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginVertical: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  modalErrorBanner: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  modalErrorText: {
    color: "#5C1919",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: "#F5F5F5",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    paddingHorizontal: 16,
    height: 56,
    justifyContent: "center",
    marginBottom: 20,
  },
  addressInputBox: {
    height: 90,
    justifyContent: "flex-start",
    paddingTop: Platform.OS === "ios" ? 12 : 6,
  },
  inputField: {
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  addressInputField: {
    textAlignVertical: "top",
    flex: 1,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_MUTED,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: BROWN_DARK,
    justifyContent: "center",
    alignItems: "center",
  },
  modalConfirmBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
