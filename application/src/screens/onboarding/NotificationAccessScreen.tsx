import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import { Colors } from "../../constants/Colors";

const BROWN_DARK = Colors.primary;
const ACCENT = Colors.accent;
const LIGHT_BG = Colors.background;
const TEXT_PRIMARY = Colors.textPrimary;
const TEXT_MUTED = Colors.textMuted;

export default function NotificationAccessScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  
  const handleAllowNotification = () => {
    Alert.alert(
      '"Fashion Store" Would Like to Send You Notifications',
      "Notifications may include alerts, sounds, and icon badges. These can be configured in Settings.",
      [
        {
          text: "Don't Allow",
          onPress: () => {
            
            router.replace("/location-access");
          },
          style: "cancel",
        },
        {
          text: "Allow",
          onPress: () => {
            
            router.replace("/location-access");
          },
        },
      ]
    );
  };

  const handleMaybeLater = () => {
    router.replace("/location-access");
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
        <View style={styles.bellCircle}>
          <Svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            {}
            <Path
              d="M36 56 C36 58.5 37.8 60 40 60 C42.2 60 44 58.5 44 56"
              stroke={ACCENT}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {}
            <Path
              d="M40 22
                 C33 22 30 27 30 35
                 C30 46 25 49 25 51
                 H55
                 C55 49 50 46 50 35
                 C50 27 47 22 40 22 Z"
              stroke={BROWN_DARK}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {}
            <Path
              d="M40 30 V35"
              stroke={BROWN_DARK}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </Svg>
        </View>

        {}
        <Text style={styles.title}>Enable Notification Access</Text>

        {}
        <Text style={styles.subtitle}>
          Enable notifications to receive real-time{"\n"}updates.
        </Text>
      </View>

      {}
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.allowBtn}
          onPress={handleAllowNotification}
          activeOpacity={0.85}
        >
          <Text style={styles.allowBtnText}>Allow Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.maybeBtn}
          onPress={handleMaybeLater}
          activeOpacity={0.7}
        >
          <Text style={styles.maybeBtnText}>Maybe Later</Text>
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
  bellCircle: {
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
  maybeBtn: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  maybeBtnText: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: "600",
  },
});
