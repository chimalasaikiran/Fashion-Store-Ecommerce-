import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { getProductDetails, submitProductReview } from "../../services/api";

const DEEP_BROWN = Colors.primary; 
const WARM_YELLOW = Colors.warning; 
const LIGHT_BG = Colors.background;
const BORDER_COLOR = Colors.borderMedium;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;
const INPUT_BG = Colors.backgroundCard; 

const MOCK_PHOTOS = [
  require("../../../assets/images/review_hat_girl.png"),
  require("../../../assets/images/brown_coat_pose1.png"),
  require("../../../assets/images/brown_coat_pose2.png"),
  require("../../../assets/images/brown_coat_pose3.png"),
  require("../../../assets/images/brown_coat_pose4.png"),
];

export default function LeaveReviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = (params.id as string) || "1";

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    const loadProduct = async () => {
      setLoading(true);
      try {
        const res = await getProductDetails(productId);
        if (res.success && active) {
          setProduct(res.product);
        }
      } catch (err) {
        console.error("Error loading product for review:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProduct();
    return () => {
      active = false;
    };
  }, [productId]);

  const isActive = rating > 0;

  const handleBack = () => {
    router.back();
  };

  const handleSelectStar = (index: number) => {
    setRating(index);
  };

  const handleAddPhotoPress = () => {
    setShowPhotoModal(true);
  };

  const handleSelectPhoto = (photo: any) => {
    if (selectedPhotos.includes(photo)) {
      setSelectedPhotos(selectedPhotos.filter((p) => p !== photo));
    } else {
      setSelectedPhotos([...selectedPhotos, photo]);
    }
  };

  const handleRemovePhoto = (photo: any) => {
    setSelectedPhotos(selectedPhotos.filter((p) => p !== photo));
  };

  const handleSubmit = async () => {
    if (!isActive) return;

    try {
      await submitProductReview(productId, {
        name: "Verified Shopper",
        rating,
        text: reviewText,
        avatar: "leslie_avatar.png",
        verified: true,
        images: selectedPhotos.map(() => "review_hat_girl.png"), 
      });

      Alert.alert(
        "Review Submitted",
        "Thank you for sharing your experience with us!",
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to submit review");
    }
  };

  if (loading || !product) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={DEEP_BROWN} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.circleHeaderBtn}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave Review</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: insets.bottom + 120,
        }}
      >
        <View style={styles.productCard}>
          {isActive ? (
            <Image
              source={product.image}
              style={styles.productImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.productImagePlaceholder} />
          )}

          <View style={styles.productInfoWrapper}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productSubtitle}>
              {product.category} | Qty. : 01 pcs
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>
                ${product.price.toFixed(2)}
              </Text>
              <Text style={styles.originalPriceValue}>
                ${product.originalPrice.toFixed(2)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.reorderBtn,
              isActive ? styles.reorderBtnActive : styles.reorderBtnInactive,
            ]}
            activeOpacity={0.8}
            onPress={() => {
              if (isActive) {
                Alert.alert("Re-Ordered", `${product.name} has been added to your bag.`);
              }
            }}
          >
            <Text style={styles.reorderBtnText}>Re-Order</Text>
          </TouchableOpacity>
        </View>

        {}
        <Text style={styles.experienceTitle}>
          How Was Your Shopping Experience?
        </Text>

        {}
        <View style={styles.ratingCard}>
          <Text style={styles.ratingCardLabel}>Your overall rating</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((index) => {
              const filled = index <= rating;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => handleSelectStar(index)}
                >
                  <Ionicons
                    name={filled ? "star" : "star"}
                    size={38}
                    color={filled ? WARM_YELLOW : "#E0E0E0"}
                    style={styles.starIcon}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {}
        <Text style={styles.inputLabel}>Add detailed review</Text>

        {}
        <TextInput
          placeholder="Enter here"
          placeholderTextColor="#A8A8A8"
          style={styles.textInput}
          multiline
          value={reviewText}
          onChangeText={setReviewText}
          textAlignVertical="top"
        />

        {}
        <TouchableOpacity
          style={styles.addPhotoBtn}
          activeOpacity={0.7}
          onPress={handleAddPhotoPress}
        >
          <Feather name="camera" size={20} color={isActive ? DEEP_BROWN : TEXT_MUTED} />
          <Text style={[styles.addPhotoText, isActive && styles.addPhotoTextActive]}>
            add photo
          </Text>
        </TouchableOpacity>

        {}
        {selectedPhotos.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.photoListContainer}
          >
            {selectedPhotos.map((photo, idx) => (
              <View key={idx} style={styles.photoWrapper}>
                <Image source={photo} style={styles.uploadedPhoto} contentFit="cover" />
                <TouchableOpacity
                  style={styles.photoDeleteBtn}
                  activeOpacity={0.8}
                  onPress={() => handleRemovePhoto(photo)}
                >
                  <Ionicons name="close-circle" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </ScrollView>

      {}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.submitBtn,
            isActive ? styles.submitBtnActive : styles.submitBtnInactive,
          ]}
          activeOpacity={isActive ? 0.9 : 1.0}
          onPress={handleSubmit}
          disabled={!isActive}
        >
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {}
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Photos</Text>
              <TouchableOpacity
                onPress={() => setShowPhotoModal(false)}
                activeOpacity={0.8}
              >
                <Ionicons name="close" size={24} color={TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={MOCK_PHOTOS}
              keyExtractor={(_, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modalList}
              renderItem={({ item }) => {
                const isSelected = selectedPhotos.includes(item);
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalPhotoItem,
                      isSelected && styles.modalPhotoItemActive,
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectPhoto(item)}
                  >
                    <Image source={item} style={styles.modalPhoto} contentFit="cover" />
                    {isSelected && (
                      <View style={styles.modalSelectionBadge}>
                        <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            <TouchableOpacity
              style={styles.modalDoneBtn}
              activeOpacity={0.8}
              onPress={() => setShowPhotoModal(false)}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </TouchableOpacity>
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

  
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: LIGHT_BG,
    borderBottomWidth: 1,
    borderColor: "#F9F6F2",
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },

  
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    backgroundColor: LIGHT_BG,
    marginTop: 8,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#F2F2F2",
  },
  productImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#F6F6F6",
  },
  productInfoWrapper: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  productSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  originalPriceValue: {
    fontSize: 13,
    color: TEXT_MUTED,
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  reorderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  reorderBtnActive: {
    backgroundColor: DEEP_BROWN,
  },
  reorderBtnInactive: {
    backgroundColor: TEXT_MUTED,
  },
  reorderBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  
  experienceTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginTop: 28,
    marginBottom: 16,
  },

  
  ratingCard: {
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    backgroundColor: LIGHT_BG,
  },
  ratingCardLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginBottom: 16,
    fontWeight: "500",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  starIcon: {
    marginHorizontal: 2,
  },

  
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginTop: 28,
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: INPUT_BG,
    borderRadius: 16,
    height: 140,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    color: TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: "transparent",
  },

  
  addPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 4,
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_MUTED,
    marginLeft: 8,
  },
  addPhotoTextActive: {
    color: DEEP_BROWN,
  },
  photoListContainer: {
    marginTop: 12,
    flexDirection: "row",
  },
  photoWrapper: {
    position: "relative",
    marginRight: 12,
    width: 60,
    height: 60,
  },
  uploadedPhoto: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  photoDeleteBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: LIGHT_BG,
    borderRadius: 10,
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
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnActive: {
    backgroundColor: DEEP_BROWN,
    shadowColor: DEEP_BROWN,
  },
  submitBtnInactive: {
    backgroundColor: TEXT_MUTED,
    shadowColor: "transparent",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: LIGHT_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 280,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  modalList: {
    paddingVertical: 12,
    gap: 12,
  },
  modalPhotoItem: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    marginRight: 10,
  },
  modalPhotoItemActive: {
    borderColor: "#34C759",
  },
  modalPhoto: {
    width: "100%",
    height: "100%",
  },
  modalSelectionBadge: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  modalDoneBtn: {
    backgroundColor: DEEP_BROWN,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 20,
  },
  modalDoneBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
