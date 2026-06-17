import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
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

const MOCK_LOCATIONS = [
  { id: "1", title: "Mane Avenue", subtitle: "8502 Preston Rd. Ingl.." },
  { id: "2", title: "Sunset Boulevard", subtitle: "1020 Sunset Blvd, Los Angeles, CA" },
  { id: "3", title: "Broadway Street", subtitle: "542 Broadway, New York, NY" },
  { id: "4", title: "Baker Street", subtitle: "221B Baker St, London, UK" },
  { id: "5", title: "Champs-Élysées", subtitle: "102 Av. des Champs-Élysées, Paris, FR" },
];

export default function EnterLocationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("Mane Avenue");

  
  const handleSelectLocation = (locationName: string) => {
    router.replace("/home");
  };

  
  const filteredLocations = MOCK_LOCATIONS.filter(
    (loc) =>
      loc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom + 10, 16),
        },
      ]}
    >
      <StatusBar style="dark" />

      {}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          {}
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 19L8 12L15 5"
              stroke={TEXT_PRIMARY}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter Your Location</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {}
      <View style={styles.searchContainer}>
        {}
        <View style={styles.searchIcon}>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Circle
              cx="9.5"
              cy="9.5"
              r="5.5"
              stroke="#7A7A7A"
              strokeWidth="1.8"
            />
            <Path
              d="M14 14L17.5 17.5"
              stroke="#7A7A7A"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <Circle cx="14" cy="14" r="2.2" fill={ACCENT} />
          </Svg>
        </View>

        {}
        <TextInput
          style={styles.searchInput}
          placeholder="Search location"
          placeholderTextColor="#A8A8A8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => handleSelectLocation(searchQuery)}
        />

        {}
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
            activeOpacity={0.7}
          >
            <Svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <Circle
                cx="9"
                cy="9"
                r="8"
                stroke={ACCENT}
                strokeWidth="1.2"
                fill="#FFF9F5"
              />
              <Path
                d="M6.5 6.5L11.5 11.5M11.5 6.5L6.5 11.5"
                stroke={ACCENT}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
        )}
      </View>

      {}
      <TouchableOpacity
        style={styles.currentLocationRow}
        onPress={() => handleSelectLocation("Current Location")}
        activeOpacity={0.7}
      >
        <View style={styles.currentLocationIcon}>
          {}
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <Path
              d="M21 3L3 10.5L11.5 12.5L13.5 21L21 3Z"
              fill={BROWN_DARK}
            />
          </Svg>
        </View>
        <Text style={styles.currentLocationText}>Use my current location</Text>
      </TouchableOpacity>

      {}
      <View style={styles.divider} />

      {}
      <Text style={styles.searchResultHeader}>Search Result</Text>

      {}
      <FlatList
        data={filteredLocations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItemRow}
            onPress={() => handleSelectLocation(item.title)}
            activeOpacity={0.65}
          >
            <View style={styles.resultIcon}>
              <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M21 3L3 10.5L11.5 12.5L13.5 21L21 3Z"
                  fill={BROWN_DARK}
                />
              </Svg>
            </View>
            <View style={styles.resultTextContainer}>
              <Text style={styles.resultTitle}>{item.title}</Text>
              <Text style={styles.resultSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No results found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    paddingHorizontal: 24,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    width: "100%",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    textAlign: "center",
  },
  headerRightPlaceholder: {
    width: 44, 
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCFAF7",
    borderWidth: 1,
    borderColor: "#F5ECE3",
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT_PRIMARY,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  currentLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  currentLocationIcon: {
    marginRight: 14,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  divider: {
    height: 1,
    backgroundColor: "#F2F2F2",
    marginVertical: 16,
  },
  searchResultHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: "#A0A0A0",
    letterSpacing: 1,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  listContent: {
    paddingBottom: 20,
  },
  resultItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    marginBottom: 4,
  },
  resultIcon: {
    marginTop: 2,
    marginRight: 14,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    marginTop: 20,
  },
});
