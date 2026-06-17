import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";


const BROWN_DARK = Colors.primary; 
const WARM_YELLOW = Colors.warning; 
const LIGHT_BG = Colors.background;
const BORDER_COLOR = Colors.borderChat;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;

const STORIES = [
  { id: "sophia", name: "Sophia", avatar: require("../../../assets/images/fashion_portrait_1_1781014071035.png"), online: true },
  { id: "emily", name: "Emily", avatar: require("../../../assets/images/fashion_portrait_2_1781014083606.png"), online: true },
  { id: "grace", name: "Grace", avatar: require("../../../assets/images/fashion_portrait_3_1781014096781.png"), online: true },
  { id: "ava", name: "Ava", avatar: require("../../../assets/images/fashion_portrait_4_1781014289331.png"), online: true },
  { id: "jenny", name: "Jenny", avatar: require("../../../assets/images/jenny_avatar.png"), online: true },
];

const CHATS_DATA = [
  {
    id: "lily",
    name: "Lily Harris",
    avatar: require("../../../assets/images/fashion_portrait_2_1781014083606.png"),
    lastMsg: "Thanks!",
    time: "08:04 PM",
    unreadCount: 1,
    online: true,
    isRead: false,
  },
  {
    id: "amelia",
    name: "Amelia Johnson",
    avatar: require("../../../assets/images/fashion_portrait_5_1781014303170.png"),
    lastMsg: "How Are You?",
    time: "09:34 PM",
    unreadCount: 2,
    online: true,
    isRead: false,
  },
  {
    id: "sarah",
    name: "Sarah Williams",
    avatar: require("../../../assets/images/fashion_portrait_6_1781014316459.png"),
    lastMsg: "Thanks!",
    time: "08:34 PM",
    unreadCount: 0,
    online: true,
    isRead: true,
  },
  {
    id: "jessica",
    name: "Jessica Brown",
    avatar: require("../../../assets/images/review_hat_girl.png"),
    lastMsg: "Welcome!",
    time: "04:28 PM",
    unreadCount: 0,
    online: false,
    isRead: true,
  },
  {
    id: "harper",
    name: "Harper Anderson",
    avatar: require("../../../assets/images/leslie_avatar.png"),
    lastMsg: "Thanks!",
    time: "02:34 PM",
    unreadCount: 3,
    online: true,
    isRead: false,
  },
  {
    id: "ashley",
    name: "Ashley Davis",
    avatar: require("../../../assets/images/seller_avatar.png"),
    lastMsg: "Good Morning!",
    time: "01:14 PM",
    unreadCount: 3,
    online: false,
    isRead: false,
  },
  {
    id: "megan",
    name: "Megan Miller",
    avatar: require("../../../assets/images/fashion_portrait_1_1781014071035.png"),
    lastMsg: "Thanks!",
    time: "12:34 PM",
    unreadCount: 0,
    online: true,
    isRead: false,
  },
];

interface ChatListTabProps {
  onBack?: () => void;
}

export function ChatListTab({ onBack }: ChatListTabProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [activeSubTab, setActiveSubTab] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);

  
  const filteredChats = CHATS_DATA.filter((chat) => {
    
    if (activeSubTab === "unread" && chat.unreadCount === 0) {
      return false;
    }
    
    if (searchQuery.trim().length > 0) {
      return chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push({ pathname: "/home", params: { tab: "home" } });
    }
  };

  const handleOpenChat = (chatUser: typeof CHATS_DATA[0]) => {
    router.push({
      pathname: "/chat-conversation",
      params: {
        id: chatUser.id,
        name: chatUser.name,
        avatar: chatUser.avatar,
        online: chatUser.online ? "true" : "false",
      },
    });
  };

  return (
    <View style={styles.root}>
      {}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.circleHeaderBtn}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Chat</Text>
          
          <TouchableOpacity
            style={[styles.circleHeaderBtn, searchVisible && styles.circleHeaderBtnActive]}
            onPress={() => {
              setSearchVisible(!searchVisible);
              if (searchVisible) setSearchQuery("");
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="search-outline" size={22} color={searchVisible ? "#FFFFFF" : TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        {}
        {searchVisible && (
          <View style={styles.searchBarRow}>
            <View style={styles.searchBar}>
              <Feather name="search" size={18} color={TEXT_MUTED} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search chats..."
                placeholderTextColor="#A8A8A8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")} activeOpacity={0.6}>
                  <Ionicons name="close-circle" size={18} color={TEXT_MUTED} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesScroll}
        >
          {STORIES.map((story) => (
            <TouchableOpacity
              key={story.id}
              style={styles.storyContainer}
              onPress={() => {
                const foundChat = CHATS_DATA.find(c => c.id === story.id) || {
                  id: story.id,
                  name: story.name,
                  avatar: story.avatar,
                  online: story.online,
                };
                router.push({
                  pathname: "/chat-conversation",
                  params: {
                    id: foundChat.id,
                    name: foundChat.name,
                    avatar: foundChat.avatar,
                    online: foundChat.online ? "true" : "false",
                  },
                });
              }}
              activeOpacity={0.8}
            >
              <View style={styles.storyAvatarWrapper}>
                <Image source={story.avatar} style={styles.storyAvatar} contentFit="cover" />
                {story.online && <View style={styles.storyOnlineIndicator} />}
              </View>
              <Text style={styles.storyName}>{story.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {}
      <View style={styles.bodyContainer}>
        {}
        <View style={styles.subTabsRow}>
          <TouchableOpacity
            style={[styles.subTab, activeSubTab === "all" && styles.subTabActive]}
            onPress={() => setActiveSubTab("all")}
            activeOpacity={0.7}
          >
            <Text style={[styles.subTabText, activeSubTab === "all" && styles.subTabTextActive]}>All</Text>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.subTab, activeSubTab === "unread" && styles.subTabActive]}
            onPress={() => setActiveSubTab("unread")}
            activeOpacity={0.7}
          >
            <Text style={[styles.subTabText, activeSubTab === "unread" && styles.subTabTextActive]}>Unread</Text>
          </TouchableOpacity>
        </View>

        {}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatsListScroll}
        >
          {filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatCard}
              onPress={() => handleOpenChat(chat)}
              activeOpacity={0.8}
            >
              <View style={styles.chatCardAvatarWrapper}>
                <Image source={chat.avatar} style={styles.chatCardAvatar} contentFit="cover" />
                {chat.online && <View style={styles.chatCardOnlineIndicator} />}
              </View>
              
              <View style={styles.chatCardMiddle}>
                <Text style={styles.chatCardName}>{chat.name}</Text>
                <Text style={styles.chatCardLastMsg} numberOfLines={1}>{chat.lastMsg}</Text>
              </View>
              
              <View style={styles.chatCardRight}>
                <Text style={styles.chatCardTime}>{chat.time}</Text>
                {chat.unreadCount > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>{chat.unreadCount}</Text>
                  </View>
                ) : chat.isRead ? (
                  <Ionicons name="checkmark-done" size={18} color="#4A90E2" style={styles.readTicks} />
                ) : (
                  <Ionicons name="checkmark-done" size={18} color={TEXT_MUTED} style={styles.readTicks} />
                )}
              </View>
            </TouchableOpacity>
          ))}
          {filteredChats.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No chats found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const router = useRouter();
  
  return (
    <View style={{ flex: 1, backgroundColor: LIGHT_BG }}>
      <StatusBar style="light" />
      
      {}
      <ChatListTab />

      {}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => router.push({ pathname: "/home", params: { tab: "home" } })}
          activeOpacity={0.7}
        >
          <Ionicons name="home-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => router.push("/cart")}
          activeOpacity={0.7}
        >
          <Feather name="shopping-bag" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => router.push({ pathname: "/home", params: { tab: "wishlist" } })}
          activeOpacity={0.7}
        >
          <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <View style={styles.activeTabContent}>
            <Ionicons name="chatbubble-ellipses" size={20} color={BROWN_DARK} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => router.push({ pathname: "/home", params: { tab: "profile" } })}
          activeOpacity={0.7}
        >
          <Ionicons name="person-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  
  
  headerContainer: {
    backgroundColor: BROWN_DARK,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  circleHeaderBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  circleHeaderBtnActive: {
    backgroundColor: WARM_YELLOW,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  
  
  searchBarRow: {
    marginBottom: 16,
  },
  searchBar: {
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchIcon: {
    marginRight: 8,
    color: "#E5DCD3",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    paddingVertical: 0,
  },
  
  
  storiesScroll: {
    gap: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
  storyContainer: {
    alignItems: "center",
    width: 68,
  },
  storyAvatarWrapper: {
    position: "relative",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#E3C9B8",
    padding: 2,
    marginBottom: 6,
  },
  storyAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: 27,
  },
  storyOnlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: "#4CD964",
    borderWidth: 2,
    borderColor: BROWN_DARK,
  },
  storyName: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },

  
  bodyContainer: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20, 
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  
  
  subTabsRow: {
    flexDirection: "row",
    gap: 16,
    borderBottomWidth: 1,
    borderColor: "#F4ECE3",
    paddingBottom: 12,
    marginBottom: 16,
  },
  subTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
  },
  subTabActive: {
    borderBottomWidth: 2,
    borderColor: BROWN_DARK,
  },
  subTabText: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_MUTED,
  },
  subTabTextActive: {
    color: TEXT_PRIMARY,
  },
  badgeContainer: {
    backgroundColor: WARM_YELLOW,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginLeft: 6,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },

  
  chatsListScroll: {
    paddingBottom: 110,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LIGHT_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  chatCardAvatarWrapper: {
    position: "relative",
    marginRight: 12,
  },
  chatCardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  chatCardOnlineIndicator: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CD964",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  chatCardMiddle: {
    flex: 1,
    justifyContent: "center",
  },
  chatCardName: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  chatCardLastMsg: {
    fontSize: 13,
    color: TEXT_MUTED,
  },
  chatCardRight: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 42,
  },
  chatCardTime: {
    fontSize: 11,
    color: TEXT_MUTED,
  },
  unreadBadge: {
    backgroundColor: WARM_YELLOW,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  readTicks: {
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
  },

  
  bottomTabBar: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "#1D212A",
    borderRadius: 35,
    height: 68,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  tabBtn: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabContent: {
    backgroundColor: "#FFFFFF",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
});
