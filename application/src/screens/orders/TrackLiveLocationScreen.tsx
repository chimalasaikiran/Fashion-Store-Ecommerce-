import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import Svg, { Path, Circle, Rect, Text as SvgText, G } from "react-native-svg";
import { useOrders } from "../../context/OrderContext";
import { Colors } from "../../constants/Colors";

const { width, height } = Dimensions.get("window");


const BROWN_DARK = Colors.primary; 
const ACCENT = Colors.accent; 
const TEXT_PRIMARY = Colors.textPrimary;
const TEXT_MUTED = Colors.textMuted;
const BORDER_COLOR = Colors.borderLight;
const DIVIDER_COLOR = Colors.divider;
const GRAY_BG = Colors.backgroundGray;


const VectorMap = () => {
  return (
    <Svg width={width} height={height * 0.65} viewBox={`0 0 ${width} 450`} style={styles.mapSvg}>
      {}
      <Rect x="0" y="0" width={width} height="450" fill="#F4F3F0" />

      {}
      {}
      <Path
        d="M-50 400 L450 10"
        stroke="#FFFFFF"
        strokeWidth="32"
        strokeLinecap="square"
      />
      {}
      <Path
        d="M100 450 L500 50"
        stroke="#FFFFFF"
        strokeWidth="28"
        strokeLinecap="square"
      />
      {}
      <Path
        d="M50 0 L350 400"
        stroke="#FFFFFF"
        strokeWidth="24"
        strokeLinecap="square"
      />
      {}
      <Path
        d="M150 0 L450 350"
        stroke="#FFFFFF"
        strokeWidth="24"
        strokeLinecap="square"
      />
      {}
      <Path
        d="M-30 180 L350 450"
        stroke="#FFFFFF"
        strokeWidth="24"
        strokeLinecap="square"
      />
      {}
      <Path
        d="M-30 250 L350 480"
        stroke="#FFFFFF"
        strokeWidth="24"
        strokeLinecap="square"
      />
      {}
      <Path
        d="M-30 320 L350 510"
        stroke="#FFFFFF"
        strokeWidth="24"
        strokeLinecap="square"
      />

      {}
      <Path
        d="M125 185 L108 220 L185 285 M185 285 L215 310 L250 340"
        stroke="#1A1A1A"
        strokeWidth="4"
        strokeDasharray="4 4"
        fill="none"
      />
      {}
      <Path
        d="M125 185 L108 220 L185 285"
        stroke="#1A1A1A"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {}
      <G transform="rotate(-38, 180, 200)">
        <SvgText fill="#A09E97" fontSize="10" fontWeight="bold" x="180" y="200">
          W Broadway
        </SvgText>
      </G>
      <G transform="rotate(-38, 320, 250)">
        <SvgText fill="#A09E97" fontSize="10" fontWeight="bold" x="320" y="250">
          Broadway
        </SvgText>
      </G>
      <G transform="rotate(52, 90, 80)">
        <SvgText fill="#A09E97" fontSize="10" fontWeight="bold" x="90" y="80">
          Worth St
        </SvgText>
      </G>
      <G transform="rotate(52, 190, 100)">
        <SvgText fill="#A09E97" fontSize="10" fontWeight="bold" x="190" y="100">
          Leonard St
        </SvgText>
      </G>
      <G transform="rotate(38, 140, 310)">
        <SvgText fill="#A09E97" fontSize="10" fontWeight="bold" x="140" y="310">
          Chambers St
        </SvgText>
      </G>
      <G transform="rotate(38, 100, 360)">
        <SvgText fill="#A09E97" fontSize="10" fontWeight="bold" x="100" y="360">
          Warren St
        </SvgText>
      </G>

      {}
      <G transform="translate(125, 185)">
        {}
        <Circle cx="0" cy="0" r="14" fill="rgba(0, 0, 0, 0.15)" />
        {}
        <Path
          d="M0 -14 C-7.7 -14 -14 -7.7 -14 0 C-14 9.8 0 24 0 24 C0 24 14 9.8 14 0 C14 -7.7 7.7 -14 0 -14 Z"
          fill={BROWN_DARK}
        />
        {}
        <Circle cx="0" cy="0" r="8" fill={ACCENT} />
        {}
        <Rect x="-3" y="-3" width="6" height="6" fill="#FFFFFF" rx="1" />
      </G>

      {}
      <G transform="translate(142, 245)">
        {}
        <Circle cx="0" cy="0" r="15" fill="rgba(194, 123, 58, 0.2)" />
        <Circle cx="0" cy="0" r="11" fill={ACCENT} />
        {}
        <Path d="M-4 -2.5 L1 -2.5 L3.5 0 L3.5 2.5 L-4 2.5 Z" fill="#FFFFFF" />
        <Circle cx="-2" cy="3.5" r="1.5" fill="#1A1A1A" />
        <Circle cx="2" cy="3.5" r="1.5" fill="#1A1A1A" />
      </G>

      {}
      <G transform="translate(185, 285)">
        <Circle cx="0" cy="0" r="14" fill="rgba(0, 0, 0, 0.15)" />
        <Path
          d="M0 -14 C-7.7 -14 -14 -7.7 -14 0 C-14 9.8 0 24 0 24 C0 24 14 9.8 14 0 C14 -7.7 7.7 -14 0 -14 Z"
          fill={BROWN_DARK}
        />
        <Circle cx="0" cy="0" r="8" fill={ACCENT} />
        {}
        <Path d="M-3 1.5 L3 1.5 L0 -2 Z" stroke="#FFFFFF" strokeWidth="1" fill="none" />
        <Path d="M0 -2.2 C0 -3 0.8 -3.5 1.2 -3.5 C1.5 -3.5 1.8 -3 1.8 -2.5" stroke="#FFFFFF" strokeWidth="1" fill="none" />
      </G>
    </Svg>
  );
};

export default function TrackLiveLocationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { orders } = useOrders();

  
  const orderId = params.orderId as string;
  const order = orders.find((o) => o.orderId === orderId) || orders[0];

  const handleBack = () => {
    router.back();
  };

  const handleCall = () => {
    Alert.alert("Calling Driver", "Connecting you to Omar Speirs (+1 208-555-0143)...");
  };

  const handleChat = () => {
    
    
    router.push({
      pathname: "/chat-conversation",
      params: { name: "Omar Speirs", role: "Delivery Man" },
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {}
      <View style={styles.mapContainer}>
        <VectorMap />
      </View>

      {}
      <View style={[styles.floatingHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.circleHeaderBtn}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Live Location</Text>
        <View style={{ width: 44 }} />
      </View>

      {}
      <TouchableOpacity
        style={[styles.crosshairButton, { bottom: height * 0.43 }]}
        activeOpacity={0.8}
        onPress={() => Alert.alert("Recenter Map", "Map centered on courier's live location.")}
      >
        <Feather name="target" size={20} color={BROWN_DARK} />
      </TouchableOpacity>

      {}
      <View
        style={[
          styles.bottomSheet,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {}
        <View style={styles.pullTab} />

        {}
        <Text style={styles.sheetLabel}>Estimated Arrival Time</Text>
        <Text style={styles.arrivalTimeText}>02:45 PM - 03:15 PM</Text>

        <View style={styles.sheetDivider} />

        {}
        <View style={styles.driverRow}>
          <Image
            source={require("../../../assets/images/seller_avatar.png")}
            style={styles.driverAvatar}
            contentFit="cover"
          />
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>Omar Speirs</Text>
            <Text style={styles.driverTitle}>Delivery Man</Text>
          </View>
          <View style={styles.driverContactRow}>
            <TouchableOpacity style={styles.contactIconBtn} onPress={handleChat} activeOpacity={0.7}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={BROWN_DARK} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactIconBtn} onPress={handleCall} activeOpacity={0.7}>
              <Ionicons name="call-outline" size={20} color={BROWN_DARK} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sheetDivider} />

        {}
        <View style={styles.stopsContainer}>
          {}
          <View style={styles.stopRow}>
            <View style={styles.stopIndicatorOuter}>
              <Circle cx="0" cy="0" r="4" fill={BROWN_DARK} />
            </View>
            <Text style={styles.stopText} numberOfLines={1}>Fashion Store Warehouse</Text>
          </View>

          {}
          <View style={styles.dottedConnector} />

          {}
          <View style={styles.stopRow}>
            <View style={[styles.stopIndicatorOuter, styles.stopIndicatorDest]}>
              <Ionicons name="location-outline" size={10} color={ACCENT} />
            </View>
            <Text style={styles.stopText} numberOfLines={1}>
              245 Madison Ave, New York, NY...
            </Text>
          </View>
        </View>

        <View style={styles.sheetDivider} />

        {}
        <Text style={styles.orderLabel}>Order Details</Text>
        {order && (
          <View style={styles.miniProductCard}>
            <Image source={order.image} style={styles.miniProductImage} contentFit="cover" />
            <Text style={styles.miniProductName} numberOfLines={1}>{order.name}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4F3F0",
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    height: height * 0.65,
  },
  mapSvg: {
    width: "100%",
  },

  
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "transparent",
    zIndex: 10,
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },

  
  crosshairButton: {
    position: "absolute",
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    zIndex: 10,
  },

  
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.02)",
  },
  pullTab: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E2E2",
    alignSelf: "center",
    marginVertical: 10,
  },
  sheetLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 6,
  },
  arrivalTimeText: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 8,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: DIVIDER_COLOR,
    marginVertical: 12,
  },

  
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F2F2F2",
  },
  driverInfo: {
    flex: 1,
    marginLeft: 14,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  driverTitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  driverContactRow: {
    flexDirection: "row",
    gap: 10,
  },
  contactIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.2,
    borderColor: "#F0E7DD",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  
  stopsContainer: {
    paddingVertical: 4,
  },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stopIndicatorOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: BROWN_DARK,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  stopIndicatorDest: {
    borderColor: ACCENT,
  },
  stopText: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: "600",
    flex: 1,
  },
  dottedConnector: {
    width: 1.5,
    height: 16,
    borderWidth: 1,
    borderColor: TEXT_MUTED,
    borderStyle: "dashed",
    marginLeft: 7.5,
    marginVertical: 3,
  },

  
  orderLabel: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  miniProductCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: GRAY_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FAF0E6",
  },
  miniProductImage: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  miniProductName: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginLeft: 12,
    flex: 1,
  },
});
