import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";


const BROWN_BTN = Colors.primaryButton;
const LIGHT_BG = Colors.background;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

interface Friend {
  id: string;
  name: string;
  phone: string;
  avatar: any;
  invited: boolean;
}

const INITIAL_FRIENDS: Friend[] = [
  {
    id: "1",
    name: "Isabella Davis",
    phone: "(212) 555-0147",
    avatar: require("../../../assets/images/fashion_portrait_1_1781014071035.png"),
    invited: false,
  },
  {
    id: "2",
    name: "Olivia Williams",
    phone: "(310) 555-0265",
    avatar: require("../../../assets/images/fashion_portrait_2_1781014083606.png"),
    invited: false,
  },
  {
    id: "3",
    name: "Harper Jackson",
    phone: "(202) 555-0129",
    avatar: require("../../../assets/images/fashion_portrait_3_1781014096781.png"),
    invited: false,
  },
  {
    id: "4",
    name: "Evelyn White",
    phone: "(718) 555-0246",
    avatar: require("../../../assets/images/fashion_portrait_4_1781014289331.png"),
    invited: false,
  },
  {
    id: "5",
    name: "Mia Anderson",
    phone: "(617) 555-0152",
    avatar: require("../../../assets/images/fashion_portrait_5_1781014303170.png"),
    invited: false,
  },
  {
    id: "6",
    name: "Charlotte Taylor",
    phone: "(629) 555-0129",
    avatar: require("../../../assets/images/fashion_portrait_6_1781014316459.png"),
    invited: false,
  },
  {
    id: "7",
    name: "Ralph Edwards",
    phone: "(646) 555-0234",
    avatar: require("../../../assets/images/jenny_avatar.png"),
    invited: false,
  },
  {
    id: "8",
    name: "Ronald Richards",
    phone: "(305) 555-0176",
    avatar: require("../../../assets/images/leslie_avatar.png"),
    invited: false,
  },
  {
    id: "9",
    name: "Courtney Henry",
    phone: "(302) 555-0199",
    avatar: require("../../../assets/images/seller_avatar.png"),
    invited: false,
  },
];

export default function InviteFriendsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/home?tab=profile");
    }
  };

  const handleInvite = (id: string) => {
    setFriends((prev) =>
      prev.map((friend) =>
        friend.id === id ? { ...friend, invited: !friend.invited } : friend
      )
    );
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendRow}>
      <Image source={item.avatar} style={styles.avatar} contentFit="cover" />
      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
      </View>
      <TouchableOpacity
        style={[
          styles.inviteBtn,
          item.invited && styles.invitedBtn,
        ]}
        onPress={() => handleInvite(item.id)}
        activeOpacity={0.8}
      >
        <Text style={[styles.inviteText, item.invited && styles.invitedText]}>
          {item.invited ? "Invited" : "Invite"}
        </Text>
      </TouchableOpacity>
    </View>
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
        <Text style={styles.headerTitle}>Invite Friends</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriendItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: "#F8F8F8",
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
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  details: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  phone: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
  inviteBtn: {
    width: 76,
    height: 32,
    borderRadius: 16,
    backgroundColor: BROWN_BTN,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  invitedBtn: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#EAEAEA",
    elevation: 0,
    shadowOpacity: 0,
  },
  inviteText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  invitedText: {
    color: TEXT_MUTED,
  },
});
