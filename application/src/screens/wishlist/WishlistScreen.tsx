import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useWishlist } from "../../context/WishlistContext";
import { Colors } from "../../constants/Colors";


const BROWN_DARK = Colors.primary; 
const WARM_YELLOW = Colors.warning; 
const LIGHT_BG = Colors.background;
const GRAY_BG = Colors.backgroundGray; 
const BORDER_COLOR = Colors.borderMedium;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;


const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "jacket", name: "Jacket" },
  { id: "shirt", name: "Shirt" },
  { id: "pant", name: "Pant" },
  { id: "t-shirt", name: "T-Shirt" },
  { id: "coat", name: "Coat" },
  { id: "sweater", name: "Sweater" },
  { id: "dress", name: "Dress" },
];

interface WishlistTabProps {
  onBack?: () => void;
}

export function WishlistTab({ onBack }: WishlistTabProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { wishlistItems, toggleLike } = useWishlist();
  
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  
  const filteredItems = wishlistItems.filter((item) => {
    
    if (activeCategory !== "all") {
      const itemCat = item.category.toLowerCase();
      const filterCat = activeCategory.toLowerCase();
      
      const matchesCategory = itemCat.includes(filterCat) || filterCat.includes(itemCat);
      if (!matchesCategory) return false;
    }
    
    
    if (searchQuery.trim().length > 0) {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push({ pathname: "/home", params: { tab: "home" } });
    }
  };

  const handleProductPress = (productId: string) => {
    router.push({ pathname: "/product-details", params: { id: productId } });
  };

  return (
    <View style={styles.root}>
      {}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.circleHeaderBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>My Wishlist</Text>
        
        <TouchableOpacity
          style={[styles.circleHeaderBtn, searchVisible && styles.circleHeaderBtnActive]}
          onPress={() => {
            setSearchVisible(!searchVisible);
            if (searchVisible) setSearchQuery("");
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={22} color={searchVisible ? "#FFFFFF" : TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      {}
      {searchVisible && (
        <View style={styles.searchBarRow}>
          <View style={styles.searchBar}>
            <Feather name="search" size={18} color={TEXT_MUTED} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search wishlist..."
              placeholderTextColor="#A8A8A8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.6}>
                <Ionicons name="close-circle" size={18} color={TEXT_MUTED} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {}
      <View style={styles.categoriesContainer}>
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
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={64} color={TEXT_MUTED} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>No items found</Text>
          <Text style={styles.emptySubtitle}>
            {wishlistItems.length === 0
              ? "Your wishlist is empty. Tap the heart symbol on products to add them here."
              : "No wishlisted products match this filter."}
          </Text>
          {wishlistItems.length === 0 && (
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => {
                if (onBack) {
                  onBack();
                } else {
                  router.push("/home");
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>Explore Shop</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.gridScrollContent,
            { paddingBottom: insets.bottom + 120 },
          ]}
        >
          <View style={styles.productsGrid}>
            {filteredItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.productCard}
                activeOpacity={0.9}
                onPress={() => handleProductPress(item.id)}
              >
                {}
                <View style={styles.productImageWrapper}>
                  <Image source={item.image} style={styles.productImage} contentFit="cover" />
                  
                  {}
                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleLike(item.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="heart"
                      size={16}
                      color="#FF0000"
                    />
                  </TouchableOpacity>
                </View>

                {}
                <View style={styles.productInfo}>
                  <View style={styles.titleRatingRow}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color={WARM_YELLOW} />
                      <Text style={styles.ratingText}>{item.rating}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.productCategory}>{item.category}</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                    <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

export default function WishlistScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: LIGHT_BG }}>
      <StatusBar style="dark" />
      
      {}
      <WishlistTab />

      {}
      <View style={styles.bottomTabBar}>
        {}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => router.push({ pathname: "/home", params: { tab: "home" } })}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => router.push("/cart")}
          activeOpacity={0.7}
        >
          <Feather name="shopping-bag" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <View style={styles.activeTabContent}>
            <Ionicons name="heart" size={20} color={BROWN_DARK} />
          </View>
        </TouchableOpacity>

        {}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => router.push({ pathname: "/home", params: { tab: "message" } })}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {}
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => router.push({ pathname: "/home", params: { tab: "profile" } })}
          activeOpacity={0.7}
        >
          <Ionicons name="person-outline" size={22} color="#FFFFFF" />
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
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    backgroundColor: LIGHT_BG,
    paddingBottom: 12,
  },
  circleHeaderBtn: {
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
    elevation: 1,
  },
  circleHeaderBtnActive: {
    backgroundColor: BROWN_DARK,
    borderColor: BROWN_DARK,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    textAlign: "center",
  },
  
  
  searchBarRow: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  searchBar: {
    height: 46,
    borderRadius: 12,
    backgroundColor: GRAY_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY,
    paddingVertical: 0,
  },

  
  categoriesContainer: {
    marginVertical: 14,
  },
  categoriesScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: GRAY_BG,
    borderWidth: 1,
    borderColor: "#F0E7DD",
  },
  categoryPillActive: {
    backgroundColor: BROWN_DARK,
    borderColor: BROWN_DARK,
  },
  categoryText: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },

  
  gridScrollContent: {
    paddingTop: 10,
    paddingBottom: 120,
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
  titleRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  productCategory: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 8,
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

  
  emptyContainer: {
    flex: 0.7,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: BROWN_DARK,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
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
});
