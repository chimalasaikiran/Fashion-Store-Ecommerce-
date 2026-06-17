import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  PanResponder,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";

const { width } = Dimensions.get("window");


const BROWN_LIGHT = Colors.primaryButton; 
const GRAY_LIGHT = Colors.backgroundGrayLight; 
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;
const STAR_YELLOW = Colors.warning;


const CATEGORIES = ["Women", "Men", "T-Shirts", "Handbags", "Accessories", "Shoes"];
const SIZES = ["S", "M", "L", "XL", "XXL", "XXXL"];
const REVIEWS = [
  { label: "4.5 and above", min: 4.5 },
  { label: "4.0 - 4.5", min: 4.0 },
  { label: "3.5 - 4.0", min: 3.5 },
  { label: "3.0 - 3.5", min: 3.0 },
  { label: "2.5 - 3.0", min: 2.5 },
];
const COLORS = [
  { name: "brown", hex: "#4A2E1B" },
  { name: "black", hex: "#1C1C1C" },
  { name: "orange", hex: "#C27B3A" },
  { name: "red", hex: "#A51C30" },
  { name: "green", hex: "#007F5F" },
  { name: "grey", hex: "#D3D3D3" },
  { name: "white", hex: "#FFFFFF" },
];
const PRICE_STEPS = [10, 15, 20, 25, 30, 35, 40, 45];
const KNOB_SIZE = 24;

export default function FilterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  
  const [selectedCategory, setSelectedCategory] = useState("Women");
  const [selectedSize, setSelectedSize] = useState("S");
  const [selectedReview, setSelectedReview] = useState("4.5 and above");
  const [selectedColor, setSelectedColor] = useState("brown");

  
  const [lowIdx, setLowIdx] = useState(1);
  const [highIdx, setHighIdx] = useState(6);

  
  const [trackWidth, setTrackWidth] = useState(width - 48); 
  const trackRef = useRef<View>(null);

  
  const getIndexFromX = (x: number) => {
    const stepWidth = trackWidth / (PRICE_STEPS.length - 1);
    const calculatedIdx = Math.round(x / stepWidth);
    return Math.max(0, Math.min(PRICE_STEPS.length - 1, calculatedIdx));
  };

  
  const leftPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        
        const stepWidth = trackWidth / (PRICE_STEPS.length - 1);
        const currentX = lowIdx * stepWidth + gestureState.dx;
        const newIdx = getIndexFromX(currentX);
        if (newIdx < highIdx) {
          setLowIdx(newIdx);
        }
      },
    })
  ).current;

  
  const rightPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const stepWidth = trackWidth / (PRICE_STEPS.length - 1);
        const currentX = highIdx * stepWidth + gestureState.dx;
        const newIdx = getIndexFromX(currentX);
        if (newIdx > lowIdx) {
          setHighIdx(newIdx);
        }
      },
    })
  ).current;

  
  const handleReset = () => {
    setSelectedCategory("Women");
    setSelectedSize("S");
    setSelectedReview("4.5 and above");
    setSelectedColor("brown");
    setLowIdx(1); 
    setHighIdx(6); 
  };

  const handleApply = () => {
    
    router.push({
      pathname: "/home",
      params: {
        category: selectedCategory,
        size: selectedSize,
        minPrice: PRICE_STEPS[lowIdx],
        maxPrice: PRICE_STEPS[highIdx],
        color: selectedColor,
      },
    });
  };

  
  const stepWidth = trackWidth / (PRICE_STEPS.length - 1);
  const leftKnobX = lowIdx * stepWidth;
  const rightKnobX = highIdx * stepWidth;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
      <StatusBar style="dark" />

      {}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Size</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sizeScroll}
          >
            {SIZES.map((size) => {
              const isActive = selectedSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  style={[styles.sizeCircle, isActive && styles.sizeCircleActive]}
                  onPress={() => setSelectedSize(size)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.sizeText, isActive && styles.sizeTextActive]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Reviews</Text>
          <View style={styles.reviewsList}>
            {REVIEWS.map((rev) => {
              const isActive = selectedReview === rev.label;
              return (
                <TouchableOpacity
                  key={rev.label}
                  style={styles.reviewRow}
                  onPress={() => setSelectedReview(rev.label)}
                  activeOpacity={0.8}
                >
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons key={s} name="star" size={18} color={STAR_YELLOW} style={styles.starIcon} />
                    ))}
                    <Text style={styles.reviewText}>{rev.label}</Text>
                  </View>
                  <View style={styles.radioOutline}>
                    {isActive && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Price Range</Text>
          <View style={styles.sliderContainer}>
            {}
            <View
              ref={trackRef}
              style={styles.trackWrapper}
              onLayout={(e) => {
                const { width: w } = e.nativeEvent.layout;
                setTrackWidth(w);
              }}
            >
              {}
              <View style={styles.inactiveTrack} />

              {}
              <View
                style={[
                  styles.activeTrack,
                  {
                    left: leftKnobX,
                    width: rightKnobX - leftKnobX,
                  },
                ]}
              />

              {}
              <View
                style={[styles.knob, { left: leftKnobX - KNOB_SIZE / 2 }]}
                {...leftPanResponder.panHandlers}
              />

              {}
              <View
                style={[styles.knob, { left: rightKnobX - KNOB_SIZE / 2 }]}
                {...rightPanResponder.panHandlers}
              />
            </View>

            {}
            <View style={styles.priceLabelsContainer}>
              {PRICE_STEPS.map((step, idx) => (
                <Text
                  key={step}
                  style={[
                    styles.priceLabelText,
                    (idx === lowIdx || idx === highIdx) && styles.priceLabelActive,
                  ]}
                >
                  ${step}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Color</Text>
          <View style={styles.colorsRow}>
            {COLORS.map((col) => {
              const isSelected = selectedColor === col.name;
              const isWhite = col.name === "white";
              return (
                <TouchableOpacity
                  key={col.name}
                  style={[
                    styles.colorOutlineRing,
                    isSelected && styles.colorOutlineRingActive,
                  ]}
                  onPress={() => setSelectedColor(col.name)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: col.hex },
                      isWhite && styles.colorCircleWhiteBorder,
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {}
      <View style={styles.bottomButtonsRow}>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.85}>
          <Text style={styles.resetBtnText}>Reset Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.85}>
          <Text style={styles.applyBtnText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    height: 48,
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
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 14,
  },

  
  categoryScroll: {
    gap: 12,
  },
  categoryPill: {
    backgroundColor: GRAY_LIGHT,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  categoryPillActive: {
    backgroundColor: BROWN_LIGHT,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },

  
  sizeScroll: {
    gap: 10,
  },
  sizeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GRAY_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  sizeCircleActive: {
    backgroundColor: BROWN_LIGHT,
  },
  sizeText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  sizeTextActive: {
    color: "#FFFFFF",
  },

  
  reviewsList: {
    gap: 14,
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    marginRight: 4,
  },
  reviewText: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: "500",
    marginLeft: 8,
  },
  radioOutline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#C5B3A8",
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: BROWN_LIGHT,
  },

  
  sliderContainer: {
    marginTop: 10,
    paddingHorizontal: 6,
  },
  trackWrapper: {
    height: 24,
    justifyContent: "center",
    position: "relative",
  },
  inactiveTrack: {
    height: 4,
    backgroundColor: "#ECECEC",
    borderRadius: 2,
    position: "absolute",
    left: 0,
    right: 0,
  },
  activeTrack: {
    height: 4,
    backgroundColor: BROWN_LIGHT,
    borderRadius: 2,
    position: "absolute",
  },
  knob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: BROWN_LIGHT,
    position: "absolute",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  priceLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  priceLabelText: {
    fontSize: 11,
    color: TEXT_MUTED,
    fontWeight: "600",
  },
  priceLabelActive: {
    color: TEXT_PRIMARY,
    fontWeight: "700",
  },

  
  colorsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  colorOutlineRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorOutlineRingActive: {
    borderColor: BROWN_LIGHT,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  colorCircleWhiteBorder: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  
  bottomButtonsRow: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: "row",
    gap: 16,
    backgroundColor: "#FFFFFF",
  },
  resetBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: GRAY_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  applyBtn: {
    flex: 1.2,
    height: 52,
    borderRadius: 26,
    backgroundColor: BROWN_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
