import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Clipboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import Svg, { Rect } from "react-native-svg";
import { useCart } from "../../context/CartContext";
import { Colors } from "../../constants/Colors";

const BROWN_DARK = Colors.primary; 
const ACCENT = Colors.accent; 
const CARD_BG = Colors.background; 
const BORDER_COLOR = Colors.borderLight;
const DIVIDER_COLOR = Colors.divider; 
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

const MOCK_PRODUCTS = [
  {
    id: "modern_party_dress",
    name: "Modern Party Dress",
    category: "Dress",
    price: 80.0,
    originalPrice: 100.0,
    image: require("../../../assets/images/fashion_portrait_4_1781014289331.png"),
  },
  {
    id: "white_shirt",
    name: "White Shirt",
    category: "Shirt",
    price: 70.0,
    originalPrice: 100.0,
    image: require("../../../assets/images/fashion_portrait_5_1781014303170.png"),
  },
  {
    id: "brown_coat",
    name: "Brown Coat",
    category: "Coats",
    price: 75.0,
    originalPrice: 150.0,
    image: require("../../../assets/images/fashion_portrait_3_1781014096781.png"),
  },
];


const BarcodeSvg = () => {
  const pattern = [
    2, 1, 4, 2, 1, 3, 1, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 1,
    4, 2, 2, 3, 1, 2, 3, 1, 2, 1, 4, 1, 1, 2, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2,
    1, 3, 1, 2, 1, 4, 1, 1, 2
  ];
  let currentX = 0;
  
  const totalWidth = pattern.reduce((sum, w) => sum + w, 0);

  return (
    <View style={styles.barcodeWrapper}>
      <Svg
        height="72"
        width="100%"
        viewBox={`0 0 ${totalWidth} 72`}
        preserveAspectRatio="none"
      >
        {pattern.map((w, idx) => {
          const x = currentX;
          currentX += w;
          if (idx % 2 === 0) {
            return (
              <Rect
                key={idx}
                x={x}
                y="0"
                width={w}
                height="72"
                fill="#000000"
              />
            );
          }
          return null;
        })}
      </Svg>
    </View>
  );
};

export default function EReceiptScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cartItems, appliedPromo } = useCart();
  const [copied, setCopied] = useState(false);

  
  const displayProducts = cartItems.length > 0 ? cartItems : MOCK_PRODUCTS;

  const handleBack = () => {
    router.back();
  };

  const handleDownload = () => {
    Alert.alert("Success", "E-Receipt downloaded to your device storage.");
  };

  const handleCopyTransactionId = () => {
    Clipboard.setString("TR8564RTHG");
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {}
      <View
        style={[
          styles.headerContainer,
          {
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>E-Receipt</Text>

        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleDownload}
          activeOpacity={0.7}
        >
          <Ionicons name="download-outline" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
      </View>

      {}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        {}
        <BarcodeSvg />

        {}
        <Text style={styles.sectionTitle}>Products</Text>

        {}
        <View style={styles.card}>
          {displayProducts.map((product, index) => (
            <View key={product.id || index}>
              <View style={styles.productRow}>
                {}
                <Image
                  source={product.image}
                  style={styles.productImage}
                  contentFit="cover"
                />

                {}
                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name}
                  </Text>
                  <Text style={styles.productCategory}>
                    {product.category}
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>
                      ${product.price.toFixed(2)}
                    </Text>
                    <Text style={styles.productOriginalPrice}>
                      ${product.originalPrice.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {}
              {index < displayProducts.length - 1 && (
                <View style={styles.rowDivider} />
              )}
            </View>
          ))}
        </View>

        {}
        <Text style={styles.sectionTitle}>Order Details</Text>

        {}
        <View style={[styles.card, styles.detailsCard]}>
          {}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>Order ID</Text>
              <Text style={styles.gridValue}>#FN854568</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>Customer Name</Text>
              <Text style={styles.gridValue}>Jennifer Aaker</Text>
            </View>
          </View>

          {}
          <View style={styles.gridRow}>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>Phone</Text>
              <Text style={styles.gridValue}>+1 (208) 555-0112</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>Promo Code</Text>
              <Text style={styles.gridValue}>{appliedPromo || "FN8954YRGHD"}</Text>
            </View>
          </View>

          {}
          <View style={[styles.gridRow, { marginBottom: 0 }]}>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>Payment Methods</Text>
              <Text style={styles.gridValue}>Wallet</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.gridLabel}>Transaction ID</Text>
              <View style={styles.transactionIdContainer}>
                <Text style={styles.gridValue}>TR8564RTHG</Text>
                <TouchableOpacity
                  onPress={handleCopyTransactionId}
                  style={styles.copyButton}
                  activeOpacity={0.6}
                >
                  <Ionicons name="copy-outline" size={16} color={ACCENT} />
                </TouchableOpacity>

                {}
                {copied && (
                  <View style={styles.copiedBadge}>
                    <Text style={styles.copiedBadgeText}>Copied</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  barcodeWrapper: {
    width: "100%",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginTop: 18,
    marginBottom: 12,
  },
  card: {
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    marginBottom: 8,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  productImage: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: "#F8F8F8",
  },
  productDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 3,
  },
  productCategory: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: BROWN_DARK,
  },
  productOriginalPrice: {
    fontSize: 11,
    color: TEXT_MUTED,
    textDecorationLine: "line-through",
  },
  rowDivider: {
    height: 1,
    backgroundColor: DIVIDER_COLOR,
  },
  detailsCard: {
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  gridRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  gridCol: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 5,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  transactionIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    position: "relative",
  },
  copyButton: {
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  copiedBadge: {
    position: "absolute",
    left: 120,
    backgroundColor: BROWN_DARK,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  copiedBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
