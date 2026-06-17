import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";


if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BROWN_DARK = Colors.primary;
const ACCENT = Colors.accent;
const WARM_YELLOW = Colors.warning;
const LIGHT_BG = Colors.background;
const GRAY_BG = Colors.backgroundGray;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

interface FAQItem {
  id: string;
  category: "services" | "general" | "account";
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "faq_1",
    category: "services",
    question: "Can I track my order's delivery status?",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "faq_2",
    category: "services",
    question: "Is there a return policy?",
    answer: "Yes, we accept returns within 30 days of receipt. Items must be in their original packaging and unused condition.",
  },
  {
    id: "faq_3",
    category: "general",
    question: "Can I save my favorite items for later?",
    answer: "Yes, click on the heart icon on any product card, and it will be saved to your Wishlist accessible via the bottom menu.",
  },
  {
    id: "faq_4",
    category: "general",
    question: "Can I share products with my friends?",
    answer: "Absolutely! Tap the share button on the product details page to share it with your friends via message, WhatsApp, or other apps.",
  },
  {
    id: "faq_5",
    category: "account",
    question: "How do I contact customer support?",
    answer: "You can reach customer support through the live chat, via email at support@fashionstore.com, or directly through WhatsApp.",
  },
  {
    id: "faq_6",
    category: "account",
    question: "What payment methods are accepted?",
    answer: "We accept Visa, Mastercard, American Express, PayPal, and Apple Pay payments.",
  },
  {
    id: "faq_7",
    category: "account",
    question: "How to add review?",
    answer: "Go to My Orders, select your completed order, click 'Leave Review' and share your feedback and rating.",
  },
];

interface ContactItem {
  id: string;
  title: string;
  iconName: string;
  iconType: "ionicons" | "custom_x";
  detail: string;
}

const CONTACT_DATA: ContactItem[] = [
  {
    id: "contact_1",
    title: "Customer Service",
    iconName: "headset-outline",
    iconType: "ionicons",
    detail: "support@fashionstore.com",
  },
  {
    id: "contact_2",
    title: "WhatsApp",
    iconName: "logo-whatsapp",
    iconType: "ionicons",
    detail: "(480) 555-0103",
  },
  {
    id: "contact_3",
    title: "Website",
    iconName: "globe-outline",
    iconType: "ionicons",
    detail: "www.fashionstore.com",
  },
  {
    id: "contact_4",
    title: "Facebook",
    iconName: "logo-facebook",
    iconType: "ionicons",
    detail: "facebook.com/fashionstore",
  },
  {
    id: "contact_5",
    title: "X",
    iconName: "logo-x",
    iconType: "custom_x",
    detail: "x.com/fashionstore",
  },
  {
    id: "contact_6",
    title: "Instagram",
    iconName: "logo-instagram",
    iconType: "ionicons",
    detail: "instagram.com/fashionstore",
  },
];

export default function HelpCenterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  
  const [activeTab, setActiveTab] = useState<"faq" | "contact">("faq");

  
  const [searchQuery, setSearchQuery] = useState("");

  
  const [activeFaqCat, setActiveFaqCat] = useState<"all" | "services" | "general" | "account">("all");

  
  const [expandedFaqIds, setExpandedFaqIds] = useState<Record<string, boolean>>({
    faq_1: true, 
  });

  
  const [expandedContactIds, setExpandedContactIds] = useState<Record<string, boolean>>({
    contact_2: true, 
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home?tab=profile");
    }
  };

  const toggleFaq = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedFaqIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleContact = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedContactIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  
  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCat = activeFaqCat === "all" || item.category === activeFaqCat;
      const matchesSearch =
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [activeFaqCat, searchQuery]);

  
  const renderXLogo = (color: string) => (
    <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <Path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        fill={color}
      />
    </Svg>
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={ACCENT} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#AAAAAA"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.tabContainer}>
        {}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab("faq")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "faq" && styles.activeTabText,
            ]}
          >
            FAQ
          </Text>
          {activeTab === "faq" && (
            <View style={styles.tabIndicatorContainer}>
              <View style={styles.indicatorLine} />
              <View style={styles.indicatorTriangle} />
            </View>
          )}
        </TouchableOpacity>

        {}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => setActiveTab("contact")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "contact" && styles.activeTabText,
            ]}
          >
            Contact Us
          </Text>
          {activeTab === "contact" && (
            <View style={styles.tabIndicatorContainer}>
              <View style={styles.indicatorLine} />
              <View style={styles.indicatorTriangle} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeTab === "faq" ? (
        <View style={{ flex: 1 }}>
          {}
          <View style={styles.pillsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsScroll}
            >
              {[
                { id: "all", label: "All" },
                { id: "services", label: "Services" },
                { id: "general", label: "General" },
                { id: "account", label: "Account" },
              ].map((cat) => {
                const isActive = activeFaqCat === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.pillButton,
                      isActive && styles.pillButtonActive,
                    ]}
                    onPress={() => setActiveFaqCat(cat.id as any)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        isActive && styles.pillTextActive,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.faqContent,
              { paddingBottom: insets.bottom + 32 },
            ]}
          >
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isExpanded = !!expandedFaqIds[faq.id];
                return (
                  <View key={faq.id} style={styles.accordionCard}>
                    <TouchableOpacity
                      style={styles.accordionHeader}
                      onPress={() => toggleFaq(faq.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={ACCENT}
                      />
                    </TouchableOpacity>
                    {isExpanded && (
                      <View style={styles.accordionContent}>
                        <View style={styles.divider} />
                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyView}>
                <Text style={styles.emptyText}>No FAQs match your search.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.contactContent,
            { paddingBottom: insets.bottom + 32 },
          ]}
        >
          {CONTACT_DATA.map((item) => {
            const isExpanded = !!expandedContactIds[item.id];
            return (
              <View key={item.id} style={styles.accordionCard}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => toggleContact(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactHeaderLeft}>
                    <View style={styles.iconCircle}>
                      {item.iconType === "custom_x" ? (
                        renderXLogo(ACCENT)
                      ) : (
                        <Ionicons name={item.iconName as any} size={20} color={ACCENT} />
                      )}
                    </View>
                    <Text style={styles.contactTitle}>{item.title}</Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={ACCENT}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.accordionContent}>
                    <View style={styles.divider} />
                    <View style={styles.contactDetailRow}>
                      <View style={styles.orangeDot} />
                      <Text style={styles.contactDetailText}>{item.detail}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: LIGHT_BG,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAEAEA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  headerPlaceholder: {
    width: 44,
  },
  searchSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    height: 48,
    borderRadius: 16,
    backgroundColor: GRAY_BG,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F5ECE3",
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontWeight: "500",
    paddingVertical: 0,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1.5,
    borderBottomColor: "#F2F2F2",
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  activeTabText: {
    color: BROWN_DARK,
    fontWeight: "700",
  },
  tabIndicatorContainer: {
    position: "absolute",
    bottom: -1.5,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorLine: {
    width: "100%",
    height: 3,
    backgroundColor: BROWN_DARK,
    borderRadius: 1.5,
  },
  indicatorTriangle: {
    width: 8,
    height: 8,
    backgroundColor: BROWN_DARK,
    transform: [{ rotate: "45deg" }],
    bottom: 5.5,
    alignSelf: "center",
  },
  pillsWrapper: {
    marginBottom: 16,
  },
  pillsScroll: {
    paddingHorizontal: 24,
    gap: 8,
  },
  pillButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: GRAY_BG,
    borderWidth: 1,
    borderColor: "#F2F2F2",
  },
  pillButtonActive: {
    backgroundColor: BROWN_DARK,
    borderColor: BROWN_DARK,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  pillTextActive: {
    color: "#FFFFFF",
  },
  faqContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  contactContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  accordionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#F4ECE3",
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    flex: 1,
    marginRight: 12,
  },
  accordionContent: {
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F2F2",
    marginBottom: 12,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
  contactHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFF8F2",
    borderWidth: 1.5,
    borderColor: "#FDF5EE",
    justifyContent: "center",
    alignItems: "center",
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  contactDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
    gap: 10,
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WARM_YELLOW,
  },
  contactDetailText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  emptyView: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
});
