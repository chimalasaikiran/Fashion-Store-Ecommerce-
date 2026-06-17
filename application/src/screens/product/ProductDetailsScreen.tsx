import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { Colors } from "../../constants/Colors";
import { getProductDetails } from "../../services/api";

const { width, height } = Dimensions.get("window");

const DEEP_BROWN = Colors.primary; 
const WARM_YELLOW = Colors.warning; 
const LIGHT_BG = Colors.background;
const GRAY_BG = Colors.backgroundGray; 
const BORDER_COLOR = Colors.borderMedium;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

export default function ProductDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = (params.id as string) || "1";

  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const { isLiked, toggleLike } = useWishlist();
  const liked = isLiked(productId);
  const { addToCart } = useCart();

  useEffect(() => {
    let active = true;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await getProductDetails(productId);
        if (res.success && active) {
          setDetails(res.product);
          setSelectedImageIndex(0);
          setSelectedSize(res.product.defaultSize || (res.product.sizes && res.product.sizes[0]) || "");
          setSelectedColor(res.product.defaultColor || (res.product.colors && res.product.colors[0]?.name) || "");
        }
      } catch (err) {
        console.error("Error fetching product details from backend:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchDetails();
    return () => {
      active = false;
    };
  }, [productId]);

  const handleAddToCart = () => {
    if (!details) return;
    addToCart({
      productId: details.id,
      name: details.name,
      category: details.category,
      price: details.price,
      originalPrice: details.originalPrice,
      image: details.gallery[0] || details.image,
      size: selectedSize,
      color: selectedColor,
    });
    router.push("/cart");
  };

  const handleBack = () => {
    router.back();
  };

  const handleToggleLike = () => {
    toggleLike(productId);
  };

  if (loading || !details) {
    return (
      <View style={[styles.root, { justifyContent: "center", alignItems: "center" }]}>
        <StatusBar style="dark" />
        <Text style={{ fontSize: 16, color: TEXT_MUTED }}>Loading product details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {}
        <View style={styles.imageContainer}>
          <Image
            source={details.gallery[selectedImageIndex]}
            style={styles.heroImage}
            contentFit="cover"
          />

          {}
          <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
              style={styles.circleHeaderBtn}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
            </TouchableOpacity>

            <View style={styles.rightHeaderBtns}>
              <TouchableOpacity
                style={styles.circleHeaderBtn}
                onPress={handleToggleLike}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={liked ? "heart" : "heart-outline"}
                  size={22}
                  color={liked ? "#FF0000" : TEXT_PRIMARY}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleHeaderBtn} activeOpacity={0.8}>
                <Ionicons name="share-social-outline" size={22} color={TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>

          {}
          <View style={styles.galleryWrapper}>
            {details.gallery.map((img: any, idx: number) => {
              const isSelected = selectedImageIndex === idx;
              const isLast = idx === details.gallery.length - 1;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.thumbnailContainer,
                    isSelected && styles.thumbnailContainerActive,
                  ]}
                  onPress={() => setSelectedImageIndex(idx)}
                  activeOpacity={0.9}
                >
                  <Image source={img} style={styles.thumbnailImage} contentFit="cover" />

                  {}
                  {isLast && (
                    <View style={styles.playOverlay}>
                      <Ionicons name="play-circle" size={20} color="#7A7A7A" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {}
        <View style={styles.detailsContainer}>
          {}
          <View style={styles.infoTitleRow}>
            <View>
              <Text style={styles.categoryText}>{details.category}</Text>
              <Text style={styles.titleText}>{details.name}</Text>
            </View>

            <TouchableOpacity
              style={styles.ratingContainer}
              onPress={() => router.push({ pathname: "/reviews", params: { id: details.id } })}
              activeOpacity={0.7}
            >
              <Ionicons name="star" size={20} color={WARM_YELLOW} />
              <Text style={styles.ratingValText}>{details.rating}</Text>
              <Text style={styles.reviewsCountText}>({details.reviewsCount} reviews)</Text>
            </TouchableOpacity>
          </View>

          {}
          <Text style={styles.sectionHeader}>Seller</Text>
          <View style={styles.sellerRow}>
            <View style={styles.sellerLeft}>
              <Image source={details.seller.avatar} style={styles.sellerAvatar} />
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{details.seller.name}</Text>
                <Text style={styles.sellerRole}>{details.seller.role}</Text>
              </View>
            </View>

            <View style={styles.sellerActions}>
              <TouchableOpacity style={styles.actionCircleBtn} activeOpacity={0.75}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={TEXT_PRIMARY} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionCircleBtn} activeOpacity={0.75}>
                <Ionicons name="call-outline" size={20} color={TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>
          </View>

          {}
          <Text style={styles.sectionHeader}>Size : {selectedSize}</Text>
          <View style={styles.sizesRow}>
            {details.sizes.map((size: string) => {
              const isSelected = selectedSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeBubble, isSelected && styles.sizeBubbleActive]}
                  onPress={() => setSelectedSize(size)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sizeText, isSelected && styles.sizeTextActive]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {}
          <Text style={styles.sectionHeader}>Color : {selectedColor}</Text>
          <View style={styles.colorsRow}>
            {details.colors.map((color: any) => {
              const isSelected = selectedColor === color.name;
              return (
                <TouchableOpacity
                  key={color.name}
                  style={[
                    styles.colorRing,
                    { borderColor: isSelected ? color.hex : "transparent" },
                  ]}
                  onPress={() => setSelectedColor(color.name)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.colorDot, { backgroundColor: color.hex }]} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>${details.price.toFixed(2)}</Text>
        </View>

        <TouchableOpacity 
          style={styles.addToCartBtn} 
          activeOpacity={0.9}
          onPress={handleAddToCart}
        >
          <Feather name="shopping-bag" size={20} color="#FFFFFF" style={styles.cartIcon} />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },

  
  imageContainer: {
    width: width,
    height: height * 0.52,
    position: "relative",
    backgroundColor: GRAY_BG,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  headerRow: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rightHeaderBtns: {
    flexDirection: "row",
    gap: 12,
  },
  circleHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  
  galleryWrapper: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(20px)", 
    borderRadius: 20,
    padding: 6,
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  thumbnailContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailContainerActive: {
    borderColor: DEEP_BROWN,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  
  detailsContainer: {
    backgroundColor: LIGHT_BG,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -28, 
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  infoTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: "500",
    marginBottom: 4,
  },
  titleText: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingValText: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginLeft: 4,
  },
  reviewsCountText: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginLeft: 4,
  },

  
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginTop: 20,
    marginBottom: 12,
  },

  
  sellerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: GRAY_BG,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  sellerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  sellerInfo: {
    justifyContent: "center",
  },
  sellerName: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  sellerRole: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  sellerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },

  
  sizesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeBubble: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    backgroundColor: GRAY_BG,
    justifyContent: "center",
    alignItems: "center",
  },
  sizeBubbleActive: {
    backgroundColor: DEEP_BROWN,
    borderColor: DEEP_BROWN,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  sizeTextActive: {
    color: "#FFFFFF",
  },

  
  colorsRow: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  colorRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 0.5,
    borderColor: "rgba(0, 0, 0, 0.08)",
  },

  
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: LIGHT_BG,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderColor: "#F0E7DD",
  },
  priceContainer: {
    flexDirection: "column",
  },
  priceLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  addToCartBtn: {
    flexDirection: "row",
    backgroundColor: DEEP_BROWN,
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: DEEP_BROWN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cartIcon: {
    marginRight: 2,
  },
  addToCartText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
