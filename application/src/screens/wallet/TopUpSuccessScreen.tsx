import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { Colors } from "../../constants/Colors";

const BROWN_DARK = Colors.primary; 
const LIGHT_BG = Colors.background; 
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;
const BORDER_COLOR = Colors.borderLight;

export default function TopUpSuccessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const amount = (params.amount as string) || "0.00";

  const handleBackToWallet = () => {
    
    router.replace("/my-wallet" as any);
  };

  
  const generateRosettePath = (
    cx: number,
    cy: number,
    lobes: number,
    innerRadius: number,
    outerRadius: number
  ) => {
    let path = "";
    const step = Math.PI / lobes;
    for (let i = 0; i < lobes * 2; i++) {
      const angle = i * step;
      const r = i % 2 === 0 ? outerRadius : innerRadius;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        const midAngle = angle - step / 2;
        const midR = (innerRadius + outerRadius) / 2 + 3.5; 
        const cpX = cx + Math.cos(midAngle) * midR;
        const cpY = cy + Math.sin(midAngle) * midR;
        path += ` Q ${cpX} ${cpY} ${x} ${y}`;
      }
    }
    path += " Z";
    return path;
  };

  const rosettePath = generateRosettePath(60, 60, 8, 40, 50);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
        {}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToWallet}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.centerContent}>
          {}
          <View style={styles.badgeContainer}>
            <Svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <Path d={rosettePath} fill={BROWN_DARK} />
              <Path
                d="M44 60 L54 70 L76 48"
                stroke="#FFFFFF"
                strokeWidth="5.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={styles.successTitle}>Top Up Successful!</Text>
          <Text style={styles.successSubtitle}>
            You have successfully Top-Up{"\n"}e-wallet for ${amount}
          </Text>
        </View>

        {}
        <View
          style={[
            styles.footerContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 8 },
          ]}
        >
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleBackToWallet}
            activeOpacity={0.9}
          >
            <Text style={styles.actionBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 60, 
  },
  badgeContainer: {
    marginBottom: 28,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 16,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 22,
  },
  footerContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    paddingHorizontal: 24,
    paddingTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 8,
  },
  actionBtn: {
    backgroundColor: BROWN_DARK,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
