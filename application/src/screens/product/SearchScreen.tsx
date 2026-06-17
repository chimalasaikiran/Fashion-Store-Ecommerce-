import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useWishlist } from "../../context/WishlistContext";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";


const BROWN_DARK = Colors.primary;
const ACCENT = Colors.warning; 
const GRAY_BG = Colors.backgroundGrayLight;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { products, toggleLike } = useWishlist();

  
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState([
    "Formal Shirt",
    "T-Shirt",
    "Shirt",
    "Leather Jacket",
    "Black Hoodie",
    "Summer Dress",
    "Casual Blazer",
  ]);

  const searchResults = products.filter(
    (prod) =>
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  const recentlyViewedIds = ["4", "9", "10", "1"];
  const recentlyViewedProducts = recentlyViewedIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  const handleSearchSubmit = () => {
    const trimmed = searchQuery.trim();
    if (trimmed && !recentSearches.includes(trimmed)) {
      setRecentSearches([trimmed, ...recentSearches]);
    }
  };

  const handleSelectRecent = (term: string) => {
    setSearchQuery(term);
  };

  const handleDeleteRecent = (term: string) => {
    setRecentSearches(recentSearches.filter((item) => item !== term));
  };

  const handleClearAllRecents = () => {
    setRecentSearches([]);
  };

  const handleClearInput = () => {
    setSearchQuery("");
  };

  
  const renderProductItem = (item: any) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.productRow}
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: "/product-details", params: { id: item.id } })}
      >
        <View style={styles.imageWrapper}>
          <Image source={item.image} style={styles.productImg} contentFit="cover" />
          <TouchableOpacity
            style={styles.heartWrapper}
            onPress={(e) => {
              e.stopPropagation();
              toggleLike(item.id);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={item.liked ? "heart" : "heart-outline"}
              size={13}
              color={item.liked ? "#FF3B30" : "#7A7A7A"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoWrapper}>
          <Text style={styles.productTitle}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#EEA756" style={styles.starIcon} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
            {item.originalPrice > item.price && (
              <Text style={styles.originalPriceText}>
                ${item.originalPrice.toFixed(2)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8 }]}>
      <StatusBar style="dark" />

      {}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={TEXT_MUTED} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search.."
            placeholderTextColor="#A8A8A8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoCorrect={false}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearInput} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={20} color={TEXT_MUTED} style={styles.clearIcon} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {searchQuery.length === 0 ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Search</Text>
            {recentSearches.length > 0 && (
              <TouchableOpacity onPress={handleClearAllRecents} activeOpacity={0.6}>
                <Text style={styles.actionText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {}
          <View style={styles.tagsContainer}>
            {recentSearches.map((term) => (
              <View key={term} style={styles.tagPill}>
                <TouchableOpacity onPress={() => handleSelectRecent(term)} activeOpacity={0.7}>
                  <Text style={styles.tagText}>{term}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tagDeleteBtn}
                  onPress={() => handleDeleteRecent(term)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={14} color={TEXT_PRIMARY} />
                </TouchableOpacity>
              </View>
            ))}
            {recentSearches.length === 0 && (
              <Text style={styles.emptyText}>No recent searches</Text>
            )}
          </View>

          {}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Viewed</Text>
            <TouchableOpacity activeOpacity={0.6}>
              <Text style={styles.actionText}>See All</Text>
            </TouchableOpacity>
          </View>

          {}
          <View style={styles.recentList}>
            {recentlyViewedProducts.map((item) => renderProductItem(item))}
          </View>

        </ScrollView>
      ) : (
        
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.scrollContent, { paddingTop: 16 }]}
          ListHeaderComponent={
            <Text style={styles.resultsHeader}>
              Search Results for &quot;{searchQuery}&quot; ({searchResults.length})
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyResultsWrapper}>
              <Text style={styles.emptyResultsText}>No products found matching your search.</Text>
            </View>
          }
          renderItem={({ item }) => renderProductItem(item)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    justifyContent: "center",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#ECECEC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
    paddingVertical: 0,
  },
  clearIcon: {
    marginLeft: 6,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  actionText: {
    fontSize: 13,
    color: ACCENT,
    fontWeight: "600",
  },

  
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  tagPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 8,
  },
  tagText: {
    fontSize: 13,
    color: TEXT_PRIMARY,
    fontWeight: "500",
  },
  tagDeleteBtn: {
    marginLeft: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontStyle: "italic",
    paddingVertical: 8,
  },

  
  recentList: {
    gap: 16,
  },
  productRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F6EDE4",
    padding: 10,
    alignItems: "center",
  },
  imageWrapper: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: GRAY_BG,
  },
  productImg: {
    width: "100%",
    height: "100%",
  },
  heartWrapper: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  infoWrapper: {
    flex: 1,
    paddingLeft: 14,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  productCategory: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  starIcon: {
    marginRight: 3,
  },
  ratingText: {
    fontSize: 12,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: BROWN_DARK,
  },
  originalPriceText: {
    fontSize: 11,
    color: TEXT_MUTED,
    textDecorationLine: "line-through",
  },

  
  resultsHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  emptyResultsWrapper: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyResultsText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
});
