import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useProfile, resolveAvatarSource } from "../../context/ProfileContext";
import { Colors } from "../../constants/Colors";
import { completeUserProfile } from "../../services/api";


const BROWN_DARK = Colors.primary;
const ACCENT = Colors.accent;
const LIGHT_BG = Colors.background;
const INPUT_BG = Colors.backgroundLight;
const PLACEHOLDER = Colors.textPlaceholder;
const TEXT_PRIMARY = Colors.textPrimary;
const TEXT_MUTED = Colors.textMuted;

interface CountryCode {
  code: string;
  dial: string;
  name: string;
  flag: string;
}

const COUNTRY_CODES: CountryCode[] = [
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸" },
  { code: "CA", dial: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "IN", dial: "+91", name: "India", flag: "🇮🇳" },
  { code: "AU", dial: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "DE", dial: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "FR", dial: "+33", name: "France", flag: "🇫🇷" },
  { code: "JP", dial: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "BR", dial: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "ZA", dial: "+27", name: "South Africa", flag: "🇿🇦" },
];

const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Prefer not to say"];

export default function YourProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { profile, updateProfile } = useProfile();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [dob, setDob] = useState(profile.dob);
  const [gender, setGender] = useState(profile.gender);
  const [avatarAsset, setAvatarAsset] = useState<any>(profile.avatar);

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    COUNTRY_CODES.find((c) => c.dial === profile.countryCode) || COUNTRY_CODES[0]
  );
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [isGenderModalVisible, setIsGenderModalVisible] = useState(false);
  const [isPhotoSheetVisible, setIsPhotoSheetVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setDob(profile.dob);
    setGender(profile.gender);
    setAvatarAsset(profile.avatar);
  }, [profile]);

  const convertUriToBase64 = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handlePhotoSelect = async (option: string) => {
    setIsPhotoSheetVisible(false);
    if (option === "remove") {
      try {
        setLoading(true);
        const res = await completeUserProfile({ avatar: "" });
        if (res && res.success) {
          updateProfile({ avatar: res.user.avatar });
          setAvatarAsset(res.user.avatar);
          Alert.alert("Success", "Profile photo removed.");
        }
      } catch (err: any) {
        Alert.alert("Error", err.message || "Failed to remove photo.");
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      let result = null;
      if (option === "gallery") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "We need access to your photo library to select a profile photo.");
          return;
        }

        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });
      } else if (option === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "We need access to your camera to take a profile photo.");
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
          base64: true,
        });
      }

      if (result && !result.canceled && result.assets && result.assets.length > 0) {
        setLoading(true);
        const selectedUri = result.assets[0].uri;
        let dataUri = "";
        if (result.assets[0].base64) {
          dataUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        } else {
          dataUri = await convertUriToBase64(selectedUri);
        }
        const res = await completeUserProfile({ avatar: dataUri });
        if (res && res.success) {
          updateProfile({ avatar: res.user.avatar });
          setAvatarAsset(res.user.avatar);
          Alert.alert("Success", "Profile photo updated successfully!");
        }
      }
    } catch (error: any) {
      console.error("ImagePicker/Upload Error:", error);
      Alert.alert("Error", error.message || "An error occurred while uploading the photo.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Please enter your phone number.");
      return;
    }
    if (!dob.trim()) {
      setErrorMsg("Please enter your date of birth.");
      return;
    }
    if (!gender) {
      setErrorMsg("Please select your gender.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      // Call completeUserProfile API to save name, phone, gender, and countryCode in database
      const res = await completeUserProfile({
        name,
        phone,
        countryCode: selectedCountry.dial,
        gender,
      });

      if (res && res.success) {
        updateProfile({
          name: res.user.name,
          phone: res.user.phone,
          countryCode: res.user.countryCode,
          gender: res.user.gender,
          avatar: res.user.avatar,
        });
      }

      setSuccessMsg("Profile updated successfully!");

      setTimeout(() => {
        setSuccessMsg(null);
        router.back();
      }, 1000);
    } catch (error: any) {
      setErrorMsg(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = COUNTRY_CODES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.dial.includes(searchQuery)
  );

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
      {errorMsg && (
        <View style={[styles.alertContainer, styles.errorAlert, { top: insets.top + 10 }]}>
          <Ionicons name="alert-circle" size={20} color="#5C1919" />
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Profile</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 20, 24) },
        ]}
      >
        {}
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => setIsPhotoSheetVisible(true)}
          activeOpacity={0.9}
        >
          <View style={styles.avatarCircle}>
            <Image
              source={resolveAvatarSource(avatarAsset)}
              style={styles.avatarImage}
              contentFit="cover"
            />
          </View>
          <View style={styles.pencilBadge}>
            <FontAwesome5 name="pencil-alt" size={12} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {}
        {}
        <Text style={styles.label}>Name</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Ex. Jennifer Aaker"
            placeholderTextColor={PLACEHOLDER}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {}
        <Text style={styles.label}>Email</Text>
        <View style={[styles.inputBox, styles.emailContainer]}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="example@gmail.com"
            placeholderTextColor={PLACEHOLDER}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => alert("Simulated: email change request sent.")}
          >
            <Text style={styles.changeBtnText}>Change</Text>
          </TouchableOpacity>
        </View>

        {}
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneInputRow}>
          <TouchableOpacity
            style={styles.countryPickerTrigger}
            onPress={() => setIsCountryModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.countryText}>
              {selectedCountry.flag} {selectedCountry.dial}
            </Text>
            <Ionicons name="chevron-down" size={14} color={TEXT_MUTED} style={styles.chevron} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TextInput
            style={styles.phoneInput}
            placeholder="(208) 555-0112"
            placeholderTextColor={PLACEHOLDER}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            returnKeyType="next"
          />
        </View>

        {}
        <Text style={styles.label}>Date of Birth</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="15/02/2002"
            placeholderTextColor={PLACEHOLDER}
            value={dob}
            onChangeText={setDob}
            keyboardType="default"
            returnKeyType="next"
          />
        </View>

        {}
        <Text style={styles.label}>Gender</Text>
        <TouchableOpacity
          style={styles.genderPickerTrigger}
          onPress={() => setIsGenderModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={[styles.genderText, !gender && styles.genderPlaceholder]}>
            {gender || "Select"}
          </Text>
          <Ionicons name="chevron-down" size={16} color={TEXT_MUTED} />
        </TouchableOpacity>

        {}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnLoading]}
          onPress={handleUpdateProfile}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Update</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {}
      <Modal
        visible={isCountryModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCountryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismissArea} onPress={() => setIsCountryModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalGrabBar} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setIsCountryModalVisible(false)}>
                <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBarBox}>
              <Ionicons name="search" size={18} color={TEXT_MUTED} style={styles.searchIcon} />
              <TextInput
                style={styles.searchBarInput}
                placeholder="Search country name or code"
                placeholderTextColor={PLACEHOLDER}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
                autoCapitalize="none"
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedCountry.code === item.code;
                return (
                  <TouchableOpacity
                    style={[styles.countryItem, isSelected && styles.countryItemActive]}
                    onPress={() => {
                      setSelectedCountry(item);
                      setIsCountryModalVisible(false);
                      setSearchQuery("");
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.countryItemFlag}>{item.flag}</Text>
                    <Text style={styles.countryItemName}>{item.name}</Text>
                    <Text style={styles.countryItemDial}>{item.dial}</Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={18} color={BROWN_DARK} style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No country found matching &quot;{searchQuery}&quot;</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {}
      <Modal
        visible={isGenderModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsGenderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismissArea} onPress={() => setIsGenderModalVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalGrabBar} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <TouchableOpacity onPress={() => setIsGenderModalVisible(false)}>
                <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <View style={styles.genderListContainer}>
              {GENDER_OPTIONS.map((option) => {
                const isSelected = gender === option;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[styles.genderItem, isSelected && styles.genderItemActive]}
                    onPress={() => {
                      setGender(option);
                      setIsGenderModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.genderItemText}>{option}</Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={BROWN_DARK} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {}
      <Modal
        visible={isPhotoSheetVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsPhotoSheetVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalDismissArea} onPress={() => setIsPhotoSheetVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalGrabBar} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Photo</Text>
              <TouchableOpacity onPress={() => setIsPhotoSheetVisible(false)}>
                <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetOptions}>
              <TouchableOpacity
                style={styles.sheetOptionBtn}
                onPress={() => handlePhotoSelect("gallery")}
                activeOpacity={0.7}
              >
                <View style={[styles.sheetIconBox, { backgroundColor: "#E3F2FD" }]}>
                  <Ionicons name="image" size={22} color="#1E88E5" />
                </View>
                <Text style={styles.sheetOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetOptionBtn}
                onPress={() => handlePhotoSelect("camera")}
                activeOpacity={0.7}
              >
                <View style={[styles.sheetIconBox, { backgroundColor: "#EDE7F6" }]}>
                  <Ionicons name="camera" size={22} color="#5E35B1" />
                </View>
                <Text style={styles.sheetOptionText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetOptionBtn}
                onPress={() => handlePhotoSelect("remove")}
                activeOpacity={0.7}
              >
                <View style={[styles.sheetIconBox, { backgroundColor: "#FFEBEE" }]}>
                  <Ionicons name="trash" size={22} color="#E53935" />
                </View>
                <Text style={[styles.sheetOptionText, { color: "#E53935" }]}>Remove Current Photo</Text>
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
    alignItems: "stretch",
    paddingTop: 16,
  },
  avatarContainer: {
    alignSelf: "center",
    position: "relative",
    marginBottom: 32,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  pencilBadge: {
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  inputBox: {
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    paddingHorizontal: 16,
    height: 56,
    justifyContent: "center",
    marginBottom: 20,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  changeBtnText: {
    color: ACCENT,
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    height: 56,
    marginBottom: 20,
  },
  countryPickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    height: "100%",
  },
  countryText: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontWeight: "500",
  },
  chevron: {
    marginLeft: 6,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#D0D0D0",
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: TEXT_PRIMARY,
    paddingRight: 16,
  },
  genderPickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  genderText: {
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  genderPlaceholder: {
    color: PLACEHOLDER,
  },
  submitBtn: {
    backgroundColor: BROWN_DARK,
    borderRadius: 30,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  submitBtnLoading: {
    opacity: 0.9,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
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
  errorAlert: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  errorText: {
    color: "#5C1919",
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalGrabBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
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
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchBarInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  countryItemActive: {
    backgroundColor: "#FAF6F3",
  },
  countryItemFlag: {
    fontSize: 22,
    marginRight: 12,
  },
  countryItemName: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    flex: 1,
  },
  countryItemDial: {
    fontSize: 15,
    color: TEXT_MUTED,
    fontWeight: "500",
    marginRight: 8,
  },
  checkIcon: {
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  genderListContainer: {
    gap: 12,
  },
  genderItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  genderItemActive: {
    borderColor: BROWN_DARK,
    backgroundColor: "#FAF6F3",
  },
  genderItemText: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontWeight: "500",
  },
  sheetOptions: {
    gap: 16,
  },
  sheetOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  sheetIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  sheetOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
});
