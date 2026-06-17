import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/Colors";


const BROWN_DARK = Colors.primary;
const LIGHT_BG = Colors.background;
const GRAY_BG = Colors.backgroundGray; 
const BORDER_COLOR = Colors.borderChat;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;


const AVATARS: Record<string, any> = {
  lily: require("../../../assets/images/fashion_portrait_2_1781014083606.png"),
  sophia: require("../../../assets/images/fashion_portrait_1_1781014071035.png"),
  emily: require("../../../assets/images/fashion_portrait_2_1781014083606.png"),
  grace: require("../../../assets/images/fashion_portrait_3_1781014096781.png"),
  ava: require("../../../assets/images/fashion_portrait_4_1781014289331.png"),
  jenny: require("../../../assets/images/jenny_avatar.png"),
  amelia: require("../../../assets/images/fashion_portrait_5_1781014303170.png"),
  sarah: require("../../../assets/images/fashion_portrait_6_1781014316459.png"),
  jessica: require("../../../assets/images/review_hat_girl.png"),
  harper: require("../../../assets/images/leslie_avatar.png"),
  ashley: require("../../../assets/images/seller_avatar.png"),
  megan: require("../../../assets/images/fashion_portrait_1_1781014071035.png"),
};

interface Message {
  id: string;
  type: "text" | "image" | "audio";
  content?: string;
  imageSource?: any;
  duration?: string;
  sender: "them" | "me";
  senderName: string;
  senderAvatar: any;
  time: string;
}

export default function ChatConversationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);

  
  const userId = (params.id as string) || "lily";
  const userName = (params.name as string) || "Lily Harris";
  const userAvatar = AVATARS[userId] || AVATARS["lily"];
  const userOnline = params.online === "true";

  
  const myAvatar = require("../../../assets/images/fashion_portrait_4_1781014289331.png");
  const myName = "Jennifer Aaker";

  const [inputMessage, setInputMessage] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "text",
      content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      sender: "them",
      senderName: userName,
      senderAvatar: userAvatar,
      time: "08:04 pm",
    },
    {
      id: "2",
      type: "text",
      content: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
      sender: "me",
      senderName: myName,
      senderAvatar: myAvatar,
      time: "08:04 pm",
    },
    {
      id: "3",
      type: "image",
      imageSource: require("../../../assets/images/fashion_portrait_3_1781014096781.png"),
      sender: "them",
      senderName: userName,
      senderAvatar: userAvatar,
      time: "08:04 pm",
    },
    {
      id: "4",
      type: "audio",
      duration: "0:13",
      sender: "me",
      senderName: myName,
      senderAvatar: myAvatar,
      time: "08:04 pm",
    },
  ]);

  
  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleSendMessage = () => {
    if (inputMessage.trim().length === 0) return;

    
    const date = new Date();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const strMinutes = minutes < 10 ? "0" + minutes : minutes;
    const timeStr = `${hours}:${strMinutes} ${ampm}`;

    const newMsg: Message = {
      id: Math.random().toString(),
      type: "text",
      content: inputMessage.trim(),
      sender: "me",
      senderName: myName,
      senderAvatar: myAvatar,
      time: timeStr,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
    scrollToBottom();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
    >
      <StatusBar style="light" />

      {}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          {}
          <TouchableOpacity
            style={styles.circleHeaderBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
          </TouchableOpacity>

          {}
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <Image source={userAvatar} style={styles.headerAvatar} contentFit="cover" />
              {userOnline && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.textDetails}>
              <Text style={styles.headerName} numberOfLines={1}>{userName}</Text>
              <Text style={styles.headerStatus}>{userOnline ? "Online" : "Offline"}</Text>
            </View>
          </View>

          {}
          <TouchableOpacity
            style={styles.circleHeaderBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={22} color={TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>

      {}
      <View style={styles.bodyContainer}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.messagesScroll, { paddingBottom: insets.bottom + 85 }]}
          onContentSizeChange={scrollToBottom}
        >
          {}
          <Text style={styles.dateSeparator}>TODAY</Text>

          {messages.map((item) => {
            const isMe = item.sender === "me";
            return (
              <View key={item.id} style={[styles.messageRow, isMe ? styles.rowMe : styles.rowThem]}>
                
                {}
                {item.type === "text" && (
                  <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
                      {item.content}
                    </Text>
                  </View>
                )}

                {item.type === "image" && (
                  <View style={[styles.imageBubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    <Image source={item.imageSource} style={styles.embeddedImage} contentFit="cover" />
                  </View>
                )}

                {item.type === "audio" && (
                  <View style={[styles.bubble, styles.audioBubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    <TouchableOpacity
                      onPress={() => setIsPlayingAudio(!isPlayingAudio)}
                      activeOpacity={0.8}
                      style={styles.audioPlayBtn}
                    >
                      <Ionicons
                        name={isPlayingAudio ? "pause-circle" : "play-circle"}
                        size={32}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                    
                    {}
                    <View style={styles.waveformContainer}>
                      {[4, 12, 18, 6, 14, 22, 10, 16, 8, 20, 12, 6, 14, 18, 4, 10, 16, 8, 22, 12, 18, 4].map((h, i) => (
                        <View
                          key={i}
                          style={[
                            styles.waveformBar,
                            {
                              height: h,
                              backgroundColor: isPlayingAudio && i % 3 === 0 ? "#EEA756" : "#FFFFFF",
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.audioDuration}>• {item.duration}</Text>
                  </View>
                )}

                {}
                <View style={[styles.metaRow, isMe ? styles.metaMe : styles.metaThem]}>
                  {!isMe && (
                    <>
                      <Image source={item.senderAvatar} style={styles.metaAvatar} contentFit="cover" />
                      <Text style={styles.metaName}>{item.senderName}</Text>
                      <Text style={styles.metaTime}>{item.time}</Text>
                    </>
                  )}
                  {isMe && (
                    <>
                      <Text style={styles.metaTime}>{item.time}</Text>
                      <Text style={styles.metaName}>{item.senderName}</Text>
                      <Image source={item.senderAvatar} style={styles.metaAvatar} contentFit="cover" />
                    </>
                  )}
                </View>

              </View>
            );
          })}
        </ScrollView>

        {}
        <View style={[styles.inputRowContainer, { bottom: insets.bottom + 12 }]}>
          <View style={styles.inputFieldWrapper}>
            <TouchableOpacity activeOpacity={0.7} style={styles.inputIconButton}>
              <Ionicons name="happy-outline" size={24} color={TEXT_MUTED} />
            </TouchableOpacity>
            
            <TextInput
              style={styles.messageTextInput}
              placeholder="Type a message here..."
              placeholderTextColor="#A8A8A8"
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline={false}
              onSubmitEditing={handleSendMessage}
            />

            <TouchableOpacity activeOpacity={0.7} style={styles.inputIconButton}>
              <Feather name="paperclip" size={20} color={TEXT_MUTED} />
            </TouchableOpacity>
          </View>

          {}
          <TouchableOpacity
            style={styles.actionCircleButton}
            onPress={inputMessage.trim().length > 0 ? handleSendMessage : undefined}
            activeOpacity={0.8}
          >
            {inputMessage.trim().length > 0 ? (
              <Ionicons name="send" size={20} color="#FFFFFF" style={{ marginLeft: 3 }} />
            ) : (
              <Feather name="mic" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  profileSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
  },
  avatarWrapper: {
    position: "relative",
    marginRight: 10,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: "#E3C9B8",
  },
  onlineDot: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CD964",
    borderWidth: 2,
    borderColor: BROWN_DARK,
  },
  textDetails: {
    justifyContent: "center",
  },
  headerName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  headerStatus: {
    color: "#D0C0B4",
    fontSize: 12,
    fontWeight: "500",
  },

  
  bodyContainer: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20, 
    paddingTop: 16,
    position: "relative",
  },
  messagesScroll: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  dateSeparator: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: TEXT_MUTED,
    textAlign: "center",
    marginVertical: 18,
  },

  
  messageRow: {
    marginBottom: 20,
    width: "100%",
  },
  rowMe: {
    alignItems: "flex-end",
  },
  rowThem: {
    alignItems: "flex-start",
  },

  
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: "82%",
  },
  bubbleThem: {
    backgroundColor: LIGHT_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  bubbleMe: {
    backgroundColor: BROWN_DARK,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextThem: {
    color: TEXT_PRIMARY,
  },
  messageTextMe: {
    color: "#FFFFFF",
  },

  
  imageBubble: {
    borderRadius: 16,
    overflow: "hidden",
    width: "75%",
    height: 160,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  embeddedImage: {
    width: "100%",
    height: "100%",
  },

  
  audioBubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BROWN_DARK,
    width: "72%",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  audioPlayBtn: {
    marginRight: 8,
  },
  waveformContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 30,
    marginRight: 6,
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
  },
  audioDuration: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  metaThem: {
    justifyContent: "flex-start",
    paddingLeft: 4,
  },
  metaMe: {
    justifyContent: "flex-end",
    paddingRight: 4,
  },
  metaAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  metaName: {
    fontSize: 12,
    color: TEXT_PRIMARY,
    fontWeight: "600",
  },
  metaTime: {
    fontSize: 11,
    color: TEXT_MUTED,
  },

  
  inputRowContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inputFieldWrapper: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: GRAY_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  inputIconButton: {
    padding: 6,
  },
  messageTextInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 0,
    height: "100%",
  },
  actionCircleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: BROWN_DARK,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
});
