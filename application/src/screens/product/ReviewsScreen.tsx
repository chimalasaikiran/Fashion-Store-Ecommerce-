import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { getProductReviews } from "../../services/api";

const DEEP_BROWN = Colors.primary; 
const WARM_YELLOW = Colors.warning; 
const LIGHT_BG = Colors.background;
const GRAY_BG = Colors.backgroundGray; 
const BORDER_COLOR = Colors.borderMedium;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;
const PROGRESS_BG = Colors.progressBg; 

interface ReviewItem {
  id: string;
  name: string;
  avatar: any;
  verified: boolean;
  timeAgo: string;
  rating: number;
  text: string;
  images?: any[];
}

export default function ReviewsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = (params.id as string) || "1";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>(["Verified", "Latest"]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await getProductReviews(productId);
      if (res.success) {
        setReviews(res.reviews);
      }
    } catch (err) {
      console.error("Error fetching product reviews from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const toggleFilter = (filter: string) => {
    if (selectedFilters.includes(filter)) {
      setSelectedFilters(selectedFilters.filter((f) => f !== filter));
    } else {
      setSelectedFilters([...selectedFilters, filter]);
    }
  };

  const handleBack = () => {
    router.back();
  };

  
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";

  const getStarPercentage = (star: number) => {
    if (totalReviews === 0) return 0;
    const count = reviews.filter((r) => Math.round(r.rating) === star).length;
    return count / totalReviews;
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.text.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilters = true;
    if (selectedFilters.includes("Verified") && !review.verified) {
      matchesFilters = false;
    }
    if (selectedFilters.includes("Detailed Reviews") && (!review.images || review.images.length === 0)) {
      matchesFilters = false;
    }

    return matchesSearch && matchesFilters;
  });

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
        <Text style={styles.headerTitle}>Review</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={DEEP_BROWN} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        >
          <View style={styles.ratingSection}>
            <View style={styles.ratingLeft}>
              <Text style={styles.largeRatingText}>{avgRating}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => {
                  const filled = s <= Math.round(Number(avgRating));
                  return (
                    <Ionicons key={s} name={filled ? "star" : "star-outline"} size={22} color={WARM_YELLOW} />
                  );
                })}
              </View>
              <Text style={styles.totalReviewsCount}>({totalReviews} Reviews)</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.ratingRight}>
              {[
                { stars: 5, value: getStarPercentage(5) },
                { stars: 4, value: getStarPercentage(4) },
                { stars: 3, value: getStarPercentage(3) },
                { stars: 2, value: getStarPercentage(2) },
                { stars: 1, value: getStarPercentage(1) },
              ].map((item) => (
                <View key={item.stars} style={styles.progressBarRow}>
                  <Text style={styles.progressLabel}>{item.stars}</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${item.value * 100}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color={TEXT_MUTED} style={styles.searchIcon} />
            <TextInput
              placeholder="Search in reviews"
              placeholderTextColor={TEXT_MUTED}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            <TouchableOpacity
              style={[styles.filterChip, styles.filterChipOutline]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="tune-variant" size={16} color={TEXT_PRIMARY} style={{ marginRight: 4 }} />
              <Text style={styles.filterChipText}>Filter</Text>
              <Ionicons name="chevron-down" size={14} color={TEXT_PRIMARY} style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilters.includes("Verified") ? styles.filterChipActive : styles.filterChipInactive,
              ]}
              onPress={() => toggleFilter("Verified")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilters.includes("Verified") && styles.filterChipTextActive,
                ]}
              >
                Verified
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilters.includes("Latest") ? styles.filterChipActive : styles.filterChipInactive,
              ]}
              onPress={() => toggleFilter("Latest")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilters.includes("Latest") && styles.filterChipTextActive,
                ]}
              >
                Latest
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedFilters.includes("Detailed Reviews") ? styles.filterChipActive : styles.filterChipInactive,
              ]}
              onPress={() => toggleFilter("Detailed Reviews")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedFilters.includes("Detailed Reviews") && styles.filterChipTextActive,
                ]}
              >
                Detailed Reviews
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.reviewList}>
            {filteredReviews.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="message-square" size={48} color={BORDER_COLOR} />
                <Text style={styles.emptyText}>No reviews match your filters</Text>
              </View>
            ) : (
              filteredReviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewCardHeader}>
                    <View style={styles.reviewerAvatarWrapper}>
                      <Image source={review.avatar} style={styles.reviewerAvatar} />
                      {review.verified && (
                        <View style={styles.verifiedBadge}>
                          <Ionicons name="checkmark" size={8} color="#FFFFFF" />
                        </View>
                      )}
                    </View>

                    <View style={styles.reviewerInfo}>
                      <Text style={styles.reviewerName}>{review.name}</Text>
                      <Text style={styles.reviewTime}>{review.timeAgo}</Text>
                    </View>
                  </View>

                  <Text style={styles.reviewText}>{review.text}</Text>

                  <View style={styles.reviewFooter}>
                    <View style={styles.ratingStars}>
                      {[1, 2, 3, 4, 5].map((star) => {
                        const starRating = Math.floor(review.rating);
                        const isHalf = review.rating % 1 !== 0 && star === starRating + 1;
                        const isFull = star <= starRating;

                        return (
                          <Ionicons
                            key={star}
                            name={isFull ? "star" : isHalf ? "star-half" : "star-outline"}
                            size={16}
                            color={WARM_YELLOW}
                            style={styles.starIcon}
                          />
                        );
                      })}
                      <Text style={styles.ratingValueText}>{review.rating.toFixed(1)}</Text>
                    </View>
                  </View>

                  {review.images && review.images.length > 0 && (
                    <View style={styles.imagesWrapper}>
                      {review.images.map((img, idx) => (
                        <Image key={idx} source={img} style={styles.reviewImage} contentFit="cover" />
                      ))}
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity
          style={styles.writeReviewBtn}
          activeOpacity={0.9}
          onPress={() => router.push({ pathname: "/leave-review", params: { id: productId } })}
        >
          <Text style={styles.writeReviewText}>Write Review</Text>
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
    borderColor: "#F0E7DD",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },

  
  ratingSection: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingLeft: {
    alignItems: "center",
    flex: 1.1,
  },
  largeRatingText: {
    fontSize: 48,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    lineHeight: 52,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    marginVertical: 6,
  },
  totalReviewsCount: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
  verticalDivider: {
    width: 1,
    height: 90,
    backgroundColor: BORDER_COLOR,
    marginHorizontal: 16,
  },
  ratingRight: {
    flex: 1.5,
    gap: 8,
  },
  progressBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressLabel: {
    width: 12,
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    textAlign: "center",
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: PROGRESS_BG,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: DEEP_BROWN,
    borderRadius: 3,
  },

  
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F6F2",
    borderRadius: 20,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    height: 48,
    borderWidth: 1,
    borderColor: "#F5ECE3",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: "500",
  },

  
  filtersContainer: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginRight: 6,
  },
  filterChipOutline: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  filterChipActive: {
    backgroundColor: DEEP_BROWN,
  },
  filterChipInactive: {
    backgroundColor: "#F9F6F2",
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },

  
  reviewList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  reviewCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reviewerAvatarWrapper: {
    position: "relative",
  },
  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GRAY_BG,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#63A46C", 
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  reviewerInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  reviewTime: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_MUTED,
  },
  reviewFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingStars: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  starIcon: {
    marginRight: 1,
  },
  ratingValueText: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginLeft: 6,
  },
  imagesWrapper: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  reviewImage: {
    width: 110,
    height: 110,
    borderRadius: 12,
    backgroundColor: GRAY_BG,
  },

  
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: "500",
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
  writeReviewBtn: {
    backgroundColor: DEEP_BROWN,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: DEEP_BROWN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  writeReviewText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
