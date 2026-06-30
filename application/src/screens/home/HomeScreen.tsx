import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import Svg, { Path, Circle } from "react-native-svg";
import { useWishlist } from "../../context/WishlistContext";
import { WishlistTab } from "../wishlist/WishlistScreen";
import { ChatListTab } from "../chat/ChatScreen";
import { ProfileTab } from "../profile/ProfileScreen";
import { Colors } from "../../constants/Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CAROUSEL_WIDTH = SCREEN_WIDTH - 48;

const BROWN_DARK = Colors.primary; 
const ACCENT = Colors.accent; 
const WARM_YELLOW = Colors.warning; 
const LIGHT_BG = Colors.background;
const GRAY_BG = Colors.backgroundGray; 
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

const PROMO_OFFERS = [
  {
    id: 1,
    badge: "Today's Exclusive Deals",
    title: "Enjoy ",
    italicTitle: "Extra Off",
    discountText: "Up to",
    percent: "30",
    image: require("../../../assets/images/special_offers_banner.png"),
    backgroundColor: "#F3EBE3",
  },
  {
    id: 2,
    badge: "Limited Time Offer",
    title: "New Summer ",
    italicTitle: "Arrivals",
    discountText: "Flat",
    percent: "50",
    image: require("../../../assets/images/special_offers_banner.png"),
    backgroundColor: "#E3ECF0",
  },
  {
    id: 3,
    badge: "Weekend Flash Sale",
    title: "Premium ",
    italicTitle: "Brands",
    discountText: "Save",
    percent: "20",
    image: require("../../../assets/images/special_offers_banner.png"),
    backgroundColor: "#F0E3E3",
  }
];

const CATEGORIES = [
  { id: "t-shirt", name: "T-Shirt", type: "tshirt" },
  { id: "jacket", name: "Jacket", type: "jacket" },
  { id: "dress", name: "Dress", type: "dress" },
  { id: "watch", name: "Watch", type: "watch" },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { products, toggleLike } = useWishlist();
  const [activeCategory, setActiveCategory] = useState("t-shirt");
  const [activeTab, setActiveTab] = useState("home");
  const searchQuery = "";

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Auto-play effect
  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = currentSlideIndex + 1;
      if (nextIndex >= PROMO_OFFERS.length) {
        nextIndex = 0;
      }
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: nextIndex * CAROUSEL_WIDTH,
          animated: true,
        });
      }
      setCurrentSlideIndex(nextIndex);
    }, 4000);

    return () => clearInterval(timer);
  }, [currentSlideIndex]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / CAROUSEL_WIDTH);
        if (index !== currentSlideIndex && index >= 0 && index < PROMO_OFFERS.length) {
          setCurrentSlideIndex(index);
        }
      }
    }
  );

  useEffect(() => {
    if (params.tab) {
      setActiveTab(params.tab as string);
    }
  }, [params.tab]);

  const filteredProducts = products.filter((prod) => {
    
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    
    if (params.category) {
      const filterCat = (params.category as string).toLowerCase();
      const prodCat = prod.category.toLowerCase();
      if (filterCat === "women") {
        const isWomenItem = ["coats", "dress", "sweaters", "jackets"].includes(prodCat);
        if (!isWomenItem) return false;
      } else if (filterCat === "men") {
        const isMenItem = ["shirts", "shirt", "jackets"].includes(prodCat);
        if (!isMenItem) return false;
      } else if (filterCat === "t-shirts") {
        if (prodCat !== "shirts" && prodCat !== "shirt") return false;
      } else if (filterCat === "handbags") {
        if (prodCat !== "handbags" && prodCat !== "bags") return false;
      } else {
        if (prodCat !== filterCat) return false;
      }
    }

    
    if (params.minPrice) {
      const minP = Number(params.minPrice);
      if (prod.price < minP) return false;
    }
    if (params.maxPrice) {
      const maxP = Number(params.maxPrice);
      if (prod.price > maxP) return false;
    }

    return true;
  });

  
  const renderCategoryIcon = (type: string, isActive: boolean) => {
    const color = isActive ? "#FFFFFF" : "#1A1A1A";
    if (type === "tshirt") {
      return (
        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 4L7 6L4 5L2 9L5 11V20C5 20.55 5.45 21 6 21H18C18.55 21 19 20.55 19 20V11L22 9L20 5L17 6L15 4H9Z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={isActive ? "#FFFFFF" : "none"}
          />
        </Svg>
      );
    }
    if (type === "jacket") {
      return (
        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 3L2 6V10L5 11V21H19V11L22 10V6L19 3H5Z"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <Path d="M12 3V21" stroke={color} strokeWidth="2" />
          <Path
            d="M9 7L12 9L15 7"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      );
    }
    if (type === "dress") {
      return (
        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 3L4 9L8 12V21H16V12L20 9L18 3H6Z"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <Path d="M8 3C8 4.5 9 6 12 6C15 6 16 4.5 16 3" stroke={color} strokeWidth="2" />
        </Svg>
      );
    }
    if (type === "watch") {
      return (
        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth="2" />
          <Path d="M12 2V7" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M12 17V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <Path d="M12 10V12H14" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </Svg>
      );
    }
    return null;
  };

  return (
    <View style={styles.root}>
      <StatusBar style={activeTab === "home" ? "light" : "dark"} />

      {activeTab === "home" && (
        <>
          {}
          <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTopRow}>
          {}
          <View>
            <Text style={styles.locationLabel}>Location</Text>
            <TouchableOpacity
              style={styles.locationSelector}
              onPress={() => router.push("/enter-location")}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={18} color={WARM_YELLOW} style={styles.locationIcon} />
              <Text style={styles.locationText}>New York, USA</Text>
              <Ionicons name="chevron-down" size={14} color={WARM_YELLOW} />
            </TouchableOpacity>
          </View>

          {}
          <TouchableOpacity
            style={styles.notificationBtn}
            activeOpacity={0.75}
            onPress={() => router.push("/notification")}
          >
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
            <View style={styles.redDot} />
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.searchRow}>
          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.9}
            onPress={() => router.push("/search")}
          >
            <Feather name="search" size={20} color={TEXT_MUTED} style={styles.searchIcon} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: "#A8A8A8" }}>Search</Text>
            </View>
            <TouchableOpacity activeOpacity={0.6} onPress={() => {}}>
              <Ionicons name="scan-outline" size={20} color={TEXT_MUTED} style={styles.scanIcon} />
            </TouchableOpacity>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterBtn}
            activeOpacity={0.85}
            onPress={() => router.push("/filter")}
          >
            <Ionicons name="options-outline" size={22} color={BROWN_DARK} />
          </TouchableOpacity>
        </View>
      </View>

      {}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: 120, 
          },
        ]}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <TouchableOpacity activeOpacity={0.6}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Promotion Banner Carousel */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CAROUSEL_WIDTH}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ gap: 0 }}
          >
            {PROMO_OFFERS.map((offer) => (
              <View 
                key={offer.id} 
                style={[styles.promoBanner, { width: CAROUSEL_WIDTH, backgroundColor: offer.backgroundColor, marginHorizontal: 0 }]}
              >
                {/* Text Content */}
                <View style={styles.promoTextContainer}>
                  <View style={styles.promoBadge}>
                    <Text style={styles.promoBadgeText}>{offer.badge}</Text>
                  </View>
                  <Text style={styles.promoTitle}>
                    {offer.title}<Text style={styles.italicTitleText}>{offer.italicTitle}</Text>
                  </Text>
                  <View style={styles.promoDiscountRow}>
                    <Text style={styles.promoDiscountText}>{offer.discountText}</Text>
                    <Text style={styles.promoPercentBig}>{offer.percent}</Text>
                    <View style={styles.percentCircle}>
                      <Text style={styles.percentCircleText}>%</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.claimBtn} activeOpacity={0.85}>
                    <Text style={styles.claimBtnText}>Claim</Text>
                  </TouchableOpacity>
                </View>

                {/* Image */}
                <Image
                  source={offer.image}
                  style={styles.promoImage}
                  contentFit="cover"
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Carousel Dots */}
        <View style={styles.carouselDots}>
          {PROMO_OFFERS.map((_, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [
                (i - 1) * CAROUSEL_WIDTH,
                i * CAROUSEL_WIDTH,
                (i + 1) * CAROUSEL_WIDTH,
              ],
              outputRange: [6, 16, 6],
              extrapolate: "clamp",
            });

            const dotColor = scrollX.interpolate({
              inputRange: [
                (i - 1) * CAROUSEL_WIDTH,
                i * CAROUSEL_WIDTH,
                (i + 1) * CAROUSEL_WIDTH,
              ],
              outputRange: ["#E0E0E0", WARM_YELLOW, "#E0E0E0"],
              extrapolate: "clamp",
            });

            return (
              <Animated.View
                key={i}
                style={[
                  styles.carouselDot,
                  {
                    width: dotWidth,
                    backgroundColor: dotColor,
                  },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity activeOpacity={0.6}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.75}
              >
                <View style={styles.categoryIconWrapper}>
                  {renderCategoryIcon(cat.type, isActive)}
                </View>
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Best Seller Product</Text>
          <TouchableOpacity activeOpacity={0.6}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Products Grid */}
        <View style={styles.productsGrid}>
          {filteredProducts.map((item) => {
            const isOutOfStock = item.stock === 0;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.productCard, isOutOfStock && { opacity: 0.85 }]}
                activeOpacity={0.9}
                onPress={() => router.push({ pathname: "/product-details", params: { id: item.id } })}
              >
                <View style={styles.productImageWrapper}>
                  <Image source={item.image} style={styles.productImage} contentFit="cover" />
                  
                  {isOutOfStock && (
                    <View style={styles.outOfStockOverlay}>
                      <View style={styles.outOfStockBadge}>
                        <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleLike(item.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.liked ? "heart" : "heart-outline"}
                      size={16}
                      color={item.liked ? "#FF0000" : "#7A7A7A"}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                    <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      </>
    )}

    {activeTab === "wishlist" && (
      <WishlistTab onBack={() => setActiveTab("home")} />
    )}

    {activeTab === "message" && (
      <ChatListTab onBack={() => setActiveTab("home")} />
    )}

    {activeTab === "profile" && (
      <ProfileTab onBack={() => setActiveTab("home")} />
    )}

      <View style={styles.bottomTabBar}>
        {}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setActiveTab("home")}
          activeOpacity={0.7}
        >
          {activeTab === "home" ? (
            <View style={styles.activeTabContent}>
              <Ionicons name="home" size={20} color={BROWN_DARK} />
            </View>
          ) : (
            <Ionicons name="home-outline" size={22} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        {}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => router.push("/cart")}
          activeOpacity={0.7}
        >
          {activeTab === "cart" ? (
            <View style={styles.activeTabContent}>
              <Feather name="shopping-bag" size={20} color={BROWN_DARK} />
            </View>
          ) : (
            <Feather name="shopping-bag" size={22} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        {}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setActiveTab("wishlist")}
          activeOpacity={0.7}
        >
          {activeTab === "wishlist" ? (
            <View style={styles.activeTabContent}>
              <Ionicons name="heart" size={20} color={BROWN_DARK} />
            </View>
          ) : (
            <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        {}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setActiveTab("message")}
          activeOpacity={0.7}
        >
          {activeTab === "message" ? (
            <View style={styles.activeTabContent}>
              <Ionicons name="chatbubble-ellipses" size={20} color={BROWN_DARK} />
            </View>
          ) : (
            <Ionicons name="chatbubble-ellipses-outline" size={22} color="#FFFFFF" />
          )}
        </TouchableOpacity>

        {}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setActiveTab("profile")}
          activeOpacity={0.7}
        >
          {activeTab === "profile" ? (
            <View style={styles.activeTabContent}>
              <Ionicons name="person" size={20} color={BROWN_DARK} />
            </View>
          ) : (
            <Ionicons name="person-outline" size={22} color="#FFFFFF" />
          )}
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
  scrollContent: {
    paddingBottom: 40,
  },

  
  headerContainer: {
    backgroundColor: BROWN_DARK,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  locationLabel: {
    fontSize: 12,
    color: "#C5B3A8",
    fontWeight: "500",
    marginBottom: 2,
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginRight: 6,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  redDot: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#FF3B30",
  },

  
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
    paddingVertical: 0,
  },
  scanIcon: {
    marginLeft: 10,
  },
  filterBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: WARM_YELLOW,
    justifyContent: "center",
    alignItems: "center",
  },

  
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  seeAllText: {
    fontSize: 14,
    color: ACCENT,
    fontWeight: "600",
  },

  
  carouselContainer: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F4ECE3",
  },
  promoBanner: {
    height: 150,
    backgroundColor: GRAY_BG,
    flexDirection: "row",
    overflow: "hidden",
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockBadge: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  outOfStockText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  promoTextContainer: {
    flex: 1.3,
    paddingLeft: 20,
    justifyContent: "center",
  },
  promoBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  promoBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  promoTitle: {
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontWeight: "600",
    marginBottom: 2,
  },
  italicTitleText: {
    fontStyle: "italic",
    color: BROWN_DARK,
    fontWeight: "700",
  },
  promoDiscountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  promoDiscountText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
    marginRight: 4,
    bottom: 2,
  },
  promoPercentBig: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    lineHeight: 28,
  },
  percentCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: WARM_YELLOW,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 3,
    bottom: 12,
  },
  percentCircleText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
  },
  claimBtn: {
    backgroundColor: BROWN_DARK,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  claimBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  promoImage: {
    flex: 1,
    height: "100%",
  },

  
  carouselDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E0E0E0",
  },
  carouselDotActive: {
    backgroundColor: WARM_YELLOW,
    width: 14,
  },

  
  categoriesScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: GRAY_BG,
    borderWidth: 1,
    borderColor: "#F0E7DD",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryPillActive: {
    backgroundColor: BROWN_DARK,
    borderColor: BROWN_DARK,
  },
  categoryIconWrapper: {
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },

  
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  productCard: {
    width: "48%",
    marginBottom: 20,
    backgroundColor: GRAY_BG,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F5ECE3",
  },
  productImageWrapper: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: BROWN_DARK,
  },
  originalPrice: {
    fontSize: 12,
    color: TEXT_MUTED,
    textDecorationLine: "line-through",
  },

  
  bottomTabBar: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#1D212A", 
    borderRadius: 35,
    height: 68,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tabBtn: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  tabBtnActive: {
    
  },
  activeTabContent: {
    backgroundColor: "#FFFFFF",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  placeholderTabContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: LIGHT_BG,
    paddingBottom: 100,
  },
  placeholderTabText: {
    fontSize: 16,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },
});