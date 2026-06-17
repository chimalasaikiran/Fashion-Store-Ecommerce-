import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Svg, { Path } from "react-native-svg";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  primary: Colors.primary,
  accent: Colors.warning,
  charcoal: Colors.textPrimary,
  grey: Colors.textMuted,
  lightGrey: Colors.borderLight,
  bg: Colors.backgroundGrayLight,
  white: Colors.background,
};

const PHONE_WIDTH = SCREEN_WIDTH * 0.80;
const PHONE_HEIGHT = PHONE_WIDTH * 1.95;

function Slide1Content() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false} contentContainerStyle={styles.innerContent}>
      {}
      <View style={styles.inHeader}>
        <View>
          <Text style={styles.inLocationLabel}>Location</Text>
          <View style={styles.inLocationRow}>
            <Ionicons name="location" size={10} color={COLORS.accent} />
            <Text style={styles.inLocationText}>New York, USA</Text>
            <Ionicons name="chevron-down" size={9} color={COLORS.white} />
          </View>
        </View>
        <View style={styles.inBellWrapper}>
          <Ionicons name="notifications-outline" size={13} color={COLORS.white} />
          <View style={styles.inBellDot} />
        </View>
      </View>
      {}
      <View style={styles.inSearchRow}>
        <View style={styles.inSearchBox}>
          <Feather name="search" size={10} color={COLORS.grey} />
          <Text style={styles.inSearchPlaceholder}>Search</Text>
          <Ionicons name="scan-outline" size={10} color={COLORS.grey} style={styles.inScanIcon} />
        </View>
        <View style={styles.inFilterBtn}>
          <Ionicons name="options-outline" size={12} color={COLORS.primary} />
        </View>
      </View>
      {}
      <View style={styles.inSectionRow}>
        <Text style={styles.inSectionTitle}>Special Offers</Text>
        <Text style={styles.inSeeAll}>See All</Text>
      </View>
      <View style={styles.inPromoCard}>
        <View style={styles.inPromoLeft}>
          <View style={styles.inPromoBadge}>
            <Text style={styles.inPromoBadgeText}>Today&apos;s Exclusive Deals</Text>
          </View>
          <Text style={styles.inPromoTitle}>Enjoy <Text style={{ fontStyle: "italic", fontWeight: "bold" }}>Extra Off</Text></Text>
          <Text style={styles.inPromoAmount}>Up to 30%</Text>
          <TouchableOpacity style={styles.inClaimBtn} activeOpacity={0.8}>
            <Text style={styles.inClaimText}>Claim</Text>
          </TouchableOpacity>
        </View>
        <Image source={require("../../../assets/images/fashion_portrait_2_1781014083606.png")} style={styles.inPromoImage} contentFit="cover" />
      </View>
      <View style={styles.inDots}>
        <View style={[styles.inDot, { backgroundColor: COLORS.accent, width: 10 }]} />
        <View style={styles.inDot} /><View style={styles.inDot} /><View style={styles.inDot} />
      </View>
      {}
      <View style={styles.inSectionRow}>
        <Text style={styles.inSectionTitle}>Shop by Category</Text>
        <Text style={styles.inSeeAll}>See All</Text>
      </View>
      <View style={styles.inCatRow}>
        <View style={[styles.inCatPill, { backgroundColor: COLORS.primary }]}>
          <Ionicons name="shirt" size={9} color={COLORS.white} style={{ marginRight: 3 }} />
          <Text style={[styles.inCatText, { color: COLORS.white }]}>T-Shirt</Text>
        </View>
        <View style={styles.inCatPill}><Text style={styles.inCatText}>Jacket</Text></View>
        <View style={styles.inCatPill}><Text style={styles.inCatText}>Dress</Text></View>
      </View>
      {}
      <View style={[styles.inSectionRow, { marginTop: 8 }]}>
        <Text style={styles.inSectionTitle}>Best Seller Product</Text>
        <Text style={styles.inSeeAll}>See All</Text>
      </View>
      <View style={styles.inProductRow}>
        {[
          require("../../../assets/images/fashion_portrait_5_1781014303170.png"),
          require("../../../assets/images/fashion_portrait_6_1781014316459.png"),
          require("../../../assets/images/fashion_portrait_1_1781014071035.png"),
          require("../../../assets/images/fashion_portrait_4_1781014289331.png"),
        ].map((src, i) => (
          <View key={i} style={styles.inProductCard}>
            <Image source={src} style={styles.inProductImage} contentFit="cover" />
            <View style={styles.inHeartBadge}>
              <Ionicons name="heart" size={8} color="red" />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Slide2Content() {
  const wishlistItems = [
    { img: require("../../../assets/images/fashion_portrait_3_1781014096781.png"), name: "Brown Coat", cat: "Coats", price: "$75.00", orig: "$150.00", rating: "4.8" },
    { img: require("../../../assets/images/fashion_portrait_2_1781014083606.png"), name: "Classy Light C...", cat: "Coat", price: "$165.00", orig: "$220.00", rating: "4.9" },
    { img: require("../../../assets/images/fashion_portrait_1_1781014071035.png"), name: "Light Brown S...", cat: "Sweater", price: "$35.00", orig: "$70.00", rating: "4.7" },
    { img: require("../../../assets/images/fashion_portrait_4_1781014289331.png"), name: "Brown Dress", cat: "Dress", price: "$90.00", orig: "$100.00", rating: "4.8" },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false} contentContainerStyle={styles.innerContent}>
      {}
      <View style={styles.slide2NavBar}>
        <View style={styles.slide2NavBack}>
          <Ionicons name="chevron-back" size={12} color={COLORS.charcoal} />
        </View>
        <Text style={styles.slide2NavTitle}>My Wishlist</Text>
        <Ionicons name="search-outline" size={12} color={COLORS.charcoal} />
      </View>
      {}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slide2CatRow}>
        {["All", "Jacket", "Shirt", "Pant", "T-Shirt"].map((cat, i) => (
          <View key={cat} style={[styles.slide2CatPill, i === 0 && styles.slide2CatPillActive]}>
            <Text style={[styles.slide2CatText, i === 0 && styles.slide2CatTextActive]}>{cat}</Text>
          </View>
        ))}
      </ScrollView>
      {}
      <View style={styles.inProductRow}>
        {wishlistItems.map((item, i) => (
          <View key={i} style={styles.inProductCard}>
            <Image source={item.img} style={styles.inProductImage} contentFit="cover" />
            <View style={styles.inHeartBadge}>
              <Ionicons name="heart" size={8} color="red" />
            </View>
            <View style={styles.slide2ProductInfo}>
              <Text style={styles.slide2ProductName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.slide2ProductCat}>{item.cat}</Text>
              <View style={styles.slide2RatingRow}>
                <Ionicons name="star" size={7} color="#F1C40F" />
                <Text style={styles.slide2Rating}>{item.rating}</Text>
              </View>
              <View style={styles.slide2PriceRow}>
                <Text style={styles.slide2Price}>{item.price}</Text>
                <Text style={styles.slide2OrigPrice}>{item.orig}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Slide3Content() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={false} contentContainerStyle={styles.innerContent}>
      {}
      <View style={styles.slide2NavBar}>
        <View style={styles.slide2NavBack}>
          <Ionicons name="chevron-back" size={15} color={COLORS.charcoal} />
        </View>
        <Text style={styles.slide2NavTitle}>Track Order</Text>
        <View style={{ width: 20 }} />
      </View>
      {}
      <View style={styles.slide3OrderCard}>
        <Image
          source={require("../../../assets/images/fashion_portrait_2_1781014083606.png")}
          style={styles.slide3OrderImage}
          contentFit="cover"
        />
        <View style={styles.slide3OrderInfo}>
          <Text style={styles.slide3OrderName}>Modern Party Dress</Text>
          <Text style={styles.slide3OrderMeta}>Dress | Size: M | Qty: 1</Text>
          <Text style={styles.slide3OrderPrice}>$80.00</Text>
        </View>
        <View style={styles.slide3RatingBadge}>
          <Ionicons name="star" size={14} color="#F1C40F" />
          <Text style={styles.slide3RatingText}>5.0</Text>
        </View>
      </View>
      {}
      <Text style={styles.slide3SectionTitle}>Order Details</Text>
      <View style={styles.slide3DetailRow}>
        <View style={styles.slide3IconBox}>
          <Ionicons name="time-outline" size={16} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.slide3DetailLabel}>Expected Delivery Date</Text>
          <Text style={styles.slide3DetailValue}>March 11, 2026 | 03:00 PM</Text>
        </View>
      </View>
      <View style={styles.slide3DetailRow}>
        <View style={styles.slide3IconBox}>
          <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
        </View>
        <View>
          <Text style={styles.slide3DetailLabel}>Order ID</Text>
          <Text style={styles.slide3DetailValue}>#FN854536</Text>
        </View>
      </View>
      {}
      <Text style={styles.slide3SectionTitle}>Order Status</Text>
      <View style={styles.slide3StatusRow}>
        <View style={styles.slide3StatusDot} />
        <View style={styles.slide3StatusLine} />
        <View>
          <Text style={styles.slide3StatusLabel}>Order Placed</Text>
          <Text style={styles.slide3StatusDate}>08 March 2026, 10:00 AM</Text>
        </View>
        <View style={[styles.slide3StatusCheck, { marginLeft: "auto" }]}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.grey} />
        </View>
      </View>
      <View style={[styles.slide3StatusRow, { marginTop: 8 }]}>
        <View style={[styles.slide3StatusDot, { backgroundColor: COLORS.primary }]} />
        <View>
          <Text style={styles.slide3StatusLabel}>In Progress</Text>
          <Text style={styles.slide3StatusDate}>09 March 2026, 02:00 PM</Text>
        </View>
        <View style={[styles.slide3StatusCheck, { marginLeft: "auto" }]}>
          <Ionicons name="ellipse-outline" size={16} color={COLORS.accent} />
        </View>
      </View>
    </ScrollView>
  );
}

const SLIDES = [
  {
    title: "Where Fashion Meets",
    italic: "Effortless Shopping",
  },
  {
    title: "Your Personal Collection",
    italic: "of Favorite Styles",
  },
  {
    title: "From Cart to Doorstep:",
    italic: "Fashion Delivered Fast",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      router.push("/signup");
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const renderPhoneContent = () => {
    switch (currentSlide) {
      case 0: return <Slide1Content />;
      case 1: return <Slide2Content />;
      case 2: return <Slide3Content />;
      default: return <Slide1Content />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {}
      <View style={[styles.headerRow, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.push("/")} activeOpacity={0.7} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {}
      <View style={styles.mainStack}>
        {}
        <View style={styles.phoneLayer}>
          <View style={[styles.deviceFrame, { width: PHONE_WIDTH, height: PHONE_HEIGHT }]}>
            <View style={styles.dynamicIsland} />
            <View style={styles.sideLeft1} />
            <View style={styles.sideLeft2} />
            <View style={styles.sideRight} />
            <View style={styles.innerScreen}>
              {}
              <View style={styles.internalStatusBar}>
                <Text style={styles.internalStatusTime}>9:41</Text>
                <View style={styles.internalStatusIcons}>
                  <Ionicons name="cellular" size={11} color={COLORS.white} />
                  <Ionicons name="wifi" size={11} color={COLORS.white} style={{ marginHorizontal: 3 }} />
                  <Ionicons name="battery-full" size={11} color={COLORS.white} />
                </View>
              </View>
              {}
              {renderPhoneContent()}
            </View>
          </View>
        </View>

        {}
        <View style={styles.waveLayer}>
          <Svg height={79} width={SCREEN_WIDTH} viewBox={`0 0 ${SCREEN_WIDTH} 80`}>
            <Path
              d={`M 0 0 Q ${SCREEN_WIDTH / 2} 65 ${SCREEN_WIDTH} 0 L ${SCREEN_WIDTH} 80 L 0 80 Z`}
              fill={COLORS.white}
            />
          </Svg>

          <View style={styles.infoCard}>
            <Text style={styles.titleText}>
              {SLIDES[currentSlide].title}{"\n"}
              <Text style={styles.italicTitle}>{SLIDES[currentSlide].italic}</Text>
            </Text>
            <Text style={styles.subtitleText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
            </Text>

            {}
            <View style={styles.footerRow}>
              {}
              <View style={styles.footerLeft}>
                {currentSlide > 0 ? (
                  <TouchableOpacity style={styles.backBtn} onPress={handlePrev} activeOpacity={0.85}>
                    <Feather name="arrow-left" size={22} color={COLORS.primary} />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.backBtnPlaceholder} />
                )}
              </View>

              {}
              <View style={styles.pageDots}>
                {SLIDES.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.pageDot,
                      i === currentSlide ? styles.pageDotActive : null,
                    ]}
                  />
                ))}
              </View>

              {}
              <View style={styles.footerRight}>
                <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
                  <Feather name="arrow-right" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  headerRow: { flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 24, zIndex: 20 },
  skipButton: { paddingVertical: 6, paddingHorizontal: 10 },
  skipText: { color: COLORS.accent, fontSize: 16, fontWeight: "600" },

  mainStack: { flex: 1, position: "relative" },

  phoneLayer: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 1, alignItems: "center", paddingTop: 8 },
  deviceFrame: {
    backgroundColor: "#111",
    borderRadius: 44,
    borderWidth: 8,
    borderColor: "#222",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
    padding: 3,
    position: "relative",
  },
  dynamicIsland: {
    position: "absolute", top: 12, alignSelf: "center",
    left: "50%", marginLeft: -32, width: 64, height: 20,
    backgroundColor: "#000", borderRadius: 12, zIndex: 10,
  },
  sideLeft1: { position: "absolute", left: -10, top: 80, width: 4, height: 30, backgroundColor: "#333", borderRadius: 2 },
  sideLeft2: { position: "absolute", left: -10, top: 120, width: 4, height: 50, backgroundColor: "#333", borderRadius: 2 },
  sideRight: { position: "absolute", right: -10, top: 100, width: 4, height: 60, backgroundColor: "#333", borderRadius: 2 },
  innerScreen: { flex: 1, backgroundColor: "#F9F9F9", borderRadius: 36, overflow: "hidden" },
  internalStatusBar: {
    height: 36, backgroundColor: COLORS.primary,
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-end", paddingHorizontal: 16, paddingBottom: 6,
  },
  internalStatusTime: { fontSize: 10, fontWeight: "bold", color: COLORS.white },
  internalStatusIcons: { flexDirection: "row", alignItems: "center" },
  innerContent: { paddingBottom: 20 },

  
  inHeader: {
    backgroundColor: COLORS.primary, paddingHorizontal: 14,
    paddingBottom: 12, paddingTop: 4,
    borderBottomLeftRadius: 18, borderBottomRightRadius: 18,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  inLocationLabel: { fontSize: 8, color: COLORS.accent },
  inLocationRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 1 },
  inLocationText: { fontSize: 10, fontWeight: "600", color: COLORS.white },
  inBellWrapper: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center", justifyContent: "center", position: "relative",
  },
  inBellDot: {
    position: "absolute", top: 4, right: 4,
    width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.accent,
  },
  inSearchRow: { flexDirection: "row", paddingHorizontal: 12, paddingTop: 10, gap: 6, alignItems: "center" },
  inSearchBox: {
    flex: 1, height: 28, backgroundColor: COLORS.white,
    borderRadius: 8, borderWidth: 0.5, borderColor: COLORS.lightGrey,
    flexDirection: "row", alignItems: "center", paddingHorizontal: 8, position: "relative",
  },
  inSearchPlaceholder: { fontSize: 9, color: COLORS.grey, marginLeft: 4, flex: 1 },
  inScanIcon: { position: "absolute", right: 8 },
  inFilterBtn: { width: 28, height: 28, backgroundColor: COLORS.accent, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  inSectionRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12, marginTop: 10, marginBottom: 6 },
  inSectionTitle: { fontSize: 11, fontWeight: "bold", color: COLORS.charcoal },
  inSeeAll: { fontSize: 9, color: COLORS.accent, fontWeight: "600" },
  inPromoCard: {
    marginHorizontal: 12, height: 90, backgroundColor: COLORS.white,
    borderRadius: 12, borderWidth: 0.5, borderColor: COLORS.lightGrey,
    flexDirection: "row", overflow: "hidden", padding: 8,
  },
  inPromoLeft: { flex: 1.3, justifyContent: "center" },
  inPromoBadge: { backgroundColor: COLORS.bg, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, alignSelf: "flex-start", marginBottom: 3 },
  inPromoBadgeText: { fontSize: 6, fontWeight: "bold", color: COLORS.charcoal },
  inPromoTitle: { fontSize: 10, color: COLORS.charcoal, fontWeight: "600" },
  inPromoAmount: { fontSize: 16, fontWeight: "800", color: COLORS.charcoal, marginTop: -2 },
  inClaimBtn: { backgroundColor: COLORS.primary, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 5, alignSelf: "flex-start", marginTop: 4 },
  inClaimText: { color: COLORS.white, fontSize: 7, fontWeight: "bold" },
  inPromoImage: { flex: 0.7, height: "100%", borderRadius: 10 },
  inDots: { flexDirection: "row", justifyContent: "center", gap: 4, marginTop: 6 },
  inDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.lightGrey },
  inCatRow: { flexDirection: "row", paddingHorizontal: 12, gap: 6 },
  inCatPill: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
    backgroundColor: COLORS.white, borderWidth: 0.5, borderColor: COLORS.lightGrey,
  },
  inCatText: { fontSize: 9, color: COLORS.charcoal },
  inProductRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 8 },
  inProductCard: { width: "48%", marginBottom: 8 },
  inProductImage: { width: "100%", height: 120, borderRadius: 8 },
  inHeartBadge: {
    position: "absolute", top: 5, right: 5,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center",
  },

  slide2NavBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: COLORS.white,
    borderBottomWidth: 0.5, borderColor: COLORS.lightGrey,
  },
  slide2NavBack: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1, borderColor: COLORS.lightGrey,
    alignItems: "center", justifyContent: "center",
  },
  slide2NavTitle: { fontSize: 12, fontWeight: "bold", color: COLORS.charcoal },
  slide2CatRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  slide2CatPill: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    backgroundColor: COLORS.white, borderWidth: 0.5, borderColor: COLORS.lightGrey,
  },
  slide2CatPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  slide2CatText: { fontSize: 9, color: COLORS.charcoal },
  slide2CatTextActive: { color: COLORS.white, fontWeight: "bold" },
  slide2ProductInfo: { paddingTop: 4, paddingHorizontal: 2 },
  slide2ProductName: { fontSize: 8, fontWeight: "bold", color: COLORS.charcoal },
  slide2ProductCat: { fontSize: 7, color: COLORS.grey, marginTop: 1 },
  slide2RatingRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 2 },
  slide2Rating: { fontSize: 7, color: COLORS.charcoal },
  slide2PriceRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  slide2Price: { fontSize: 8, fontWeight: "bold", color: COLORS.charcoal },
  slide2OrigPrice: { fontSize: 7, color: COLORS.grey, textDecorationLine: "line-through" },

  slide3OrderCard: {
    flexDirection: "row", marginHorizontal: 12, marginTop: 10,
    backgroundColor: COLORS.white, borderRadius: 12,
    borderWidth: 0.5, borderColor: COLORS.lightGrey,
    padding: 12, alignItems: "center",
  },
  slide3OrderImage: { width: 70, height: 82, borderRadius: 8 },
  slide3OrderInfo: { flex: 1, marginLeft: 10 },
  slide3OrderName: { fontSize: 14, fontWeight: "bold", color: COLORS.charcoal },
  slide3OrderMeta: { fontSize: 12, color: COLORS.grey, marginTop: 3 },
  slide3OrderPrice: { fontSize: 15, fontWeight: "800", color: COLORS.charcoal, marginTop: 6 },
  slide3RatingBadge: { flexDirection: "row", alignItems: "center", gap: 2 },
  slide3RatingText: { fontSize: 14, fontWeight: "bold", color: COLORS.charcoal },
  slide3SectionTitle: { fontSize: 15, fontWeight: "bold", color: COLORS.charcoal, paddingHorizontal: 14, marginTop: 16, marginBottom: 8 },
  slide3DetailRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, marginBottom: 10,
  },
  slide3IconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: COLORS.bg, alignItems: "center", justifyContent: "center",
  },
  slide3DetailLabel: { fontSize: 11, fontWeight: "bold", color: COLORS.charcoal },
  slide3DetailValue: { fontSize: 10, color: COLORS.grey, marginTop: 2 },
  slide3StatusRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, position: "relative",
  },
  slide3StatusDot: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.lightGrey, borderWidth: 2.5, borderColor: COLORS.primary,
  },
  slide3StatusLine: {
    position: "absolute", left: 21, top: 18,
    width: 2, height: 26, backgroundColor: COLORS.lightGrey,
  },
  slide3StatusLabel: { fontSize: 11, fontWeight: "bold", color: COLORS.charcoal },
  slide3StatusDate: { fontSize: 9, color: COLORS.grey, marginTop: 2 },
  slide3StatusCheck: { flexDirection: "row", alignItems: "center" },

  waveLayer: {
    position: "absolute", bottom: 0,
    top: "52%", left: 0, right: 0,
    zIndex: 10, justifyContent: "flex-end",
  },
  infoCard: { backgroundColor: COLORS.white, paddingTop: 10, paddingHorizontal: 30, paddingBottom: 70 },
  titleText: { fontSize: 24, fontWeight: "bold", color: COLORS.charcoal, textAlign: "center", lineHeight: 30, marginBottom: 4 },
  italicTitle: { color: COLORS.primary, fontStyle: "italic", fontWeight: "800" },
  subtitleText: { fontSize: 13, color: COLORS.grey, textAlign: "center", lineHeight: 19, marginTop: 10, marginBottom: 24 },

  footerRow: { flexDirection: "row", alignItems: "center" },
  footerLeft: { width: 56, alignItems: "flex-start" },
  footerRight: { width: 56, alignItems: "flex-end" },
  pageDots: { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8 },
  pageDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.lightGrey },
  pageDotActive: { backgroundColor: COLORS.accent, width: 22 },
  backBtn: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 1.5, borderColor: COLORS.primary,
    alignItems: "center", justifyContent: "center",
  },
  backBtnPlaceholder: { width: 56, height: 56 },
  nextBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 6, elevation: 5,
  },
});
