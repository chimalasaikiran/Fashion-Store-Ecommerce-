import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";

const { width } = Dimensions.get("window");


const IMAGE_WIDTH = width * 0.42;
const IMAGE_HEIGHT = IMAGE_WIDTH * 1.3;
const SPACING = 15;

const BACKGROUND_COLOR = Colors.backgroundLight;
const BUTTON_BG = Colors.primaryButton;
const TEXT_PRIMARY = Colors.textPrimary;
const TEXT_MUTED = Colors.textMuted;
const WHITE = Colors.background;
const BLACK = Colors.shadowColor;

const COL_1_IMAGES = [
  require("../../../assets/images/fashion_portrait_1_1781014071035.png"),
  require("../../../assets/images/fashion_portrait_2_1781014083606.png"),
  require("../../../assets/images/fashion_portrait_3_1781014096781.png"),
];

const COL_2_IMAGES = [
  require("../../../assets/images/fashion_portrait_4_1781014289331.png"),
  require("../../../assets/images/fashion_portrait_5_1781014303170.png"),
  require("../../../assets/images/fashion_portrait_6_1781014316459.png"),
];

const AutoScrollColumn = ({ images, duration, direction = 1, tags = [] }: any) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    
    const distance = (IMAGE_HEIGHT + SPACING) * images.length;
    
    if (direction === 1) {
      
      translateY.value = 0;
      translateY.value = withRepeat(
        withTiming(-distance, {
          duration: duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    } else {
      
      translateY.value = -distance;
      translateY.value = withRepeat(
        withTiming(0, {
          duration: duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }
  }, [direction, duration, images.length, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.colContainer}>
      <Animated.View style={[styles.scrollCol, animatedStyle]}>
        {images.map((img: any, index: number) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={img} style={styles.image} contentFit="cover" />
            {tags[index] ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{tags[index]}</Text>
              </View>
            ) : null}
          </View>
        ))}
        {}
        {images.map((img: any, index: number) => (
          <View key={`dup-${index}`} style={styles.imageWrapper}>
            <Image source={img} style={styles.image} contentFit="cover" />
            {tags[index] ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{tags[index]}</Text>
              </View>
            ) : null}
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      {}
      {}
      <View style={styles.galleryContainer}>
        {}
        <View style={{ marginTop: -IMAGE_HEIGHT / 2 }}>
          <AutoScrollColumn
            images={COL_1_IMAGES}
            duration={25000}
            direction={1}
            tags={["", "#Fashion", ""]}
          />
        </View>
        <AutoScrollColumn
          images={COL_2_IMAGES}
          duration={30000}
          direction={-1}
          tags={["#Luxury", "", "#Style"]}
        />
      </View>

      {}
      <View style={[styles.contentContainer, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}>
        <Text style={styles.title}>
          Your <Text style={styles.titleHighlight}>Personal Fashion App</Text>{"\n"}
          for Every Occasion
        </Text>

        <Text style={styles.subtitle}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
        </Text>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/onboarding")}>
          <Text style={styles.buttonText}>Let&apos;s Get Started</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signin")}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  galleryContainer: {
    flex: 1.2,
    
    marginTop: 0,
    overflow: "hidden",
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING,
  },
  colContainer: {
    width: IMAGE_WIDTH,
  },
  scrollCol: {
    flexDirection: "column",
    alignItems: "center",
  },
  imageWrapper: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    marginBottom: SPACING,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  tag: {
    position: "absolute",
    bottom: 15,
    left: 15,
    backgroundColor: "#F4A460",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    color: WHITE,
    fontWeight: "bold",
    fontSize: 12,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "flex-end",
    
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 15,
    lineHeight: 40,
  },
  titleHighlight: {
    color: BUTTON_BG,
    fontStyle: "italic",
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  button: {
    backgroundColor: BUTTON_BG,
    width: "100%",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  footerLink: {
    fontSize: 14,
    color: BUTTON_BG,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
