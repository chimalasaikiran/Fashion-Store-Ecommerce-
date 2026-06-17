import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { Colors } from "../../constants/Colors";


const BROWN_DARK = Colors.primary;
const ACCENT = Colors.accent;
const LIGHT_BG = Colors.background;
const TEXT_PRIMARY = Colors.textPrimary;
const TEXT_MUTED = Colors.textMuted;

export default function LocationAccessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  
  const handleAllowLocation = () => {
    router.replace("/home");
  };

  const handleEnterManually = () => {
    router.push("/enter-location");
  };

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom + 20, 24),
        },
      ]}
    >
      <StatusBar style="dark" />

      {}
      <View style={styles.contentContainer}>
        {}
        <View style={styles.locationCircle}>
          <Svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            {}
            <Path
              d="M40 18 C28 18 20 27 20 38 C20 48 30 58 40 68 C50 58 60 48 60 38 C60 27 52 18 40 18 Z"
              stroke={BROWN_DARK}
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {}
            <Circle
              cx="40"
              cy="38"
              r="6.5"
              stroke={ACCENT}
              strokeWidth="4"
              fill="none"
            />
          </Svg>
        </View>

        {}
        <Text style={styles.title}>What is Your Location?</Text>

        {}
        <Text style={styles.subtitle}>
          Turn on location services to get better{"\n"}delivery estimates.
        </Text>
      </View>

      {}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.allowBtn}
          onPress={handleAllowLocation}
          activeOpacity={0.85}
        >
          <Text style={styles.allowBtnText}>Allow Location Access</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.manualBtn}
          onPress={handleEnterManually}
          activeOpacity={0.7}
        >
          <Text style={styles.manualBtnText}>Enter Location Manually</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    paddingHorizontal: 28,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  locationCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  footerContainer: {
    width: "100%",
    gap: 16,
    paddingBottom: 16,
  },
  allowBtn: {
    backgroundColor: BROWN_DARK,
    borderRadius: 30,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  allowBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  manualBtn: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  manualBtnText: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: "600",
  },
});
