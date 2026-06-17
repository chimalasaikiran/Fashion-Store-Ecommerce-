import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path, Circle } from "react-native-svg";
import { useWallet, Transaction } from "../../context/WalletContext";
import { Colors } from "../../constants/Colors";

const BROWN_DARK = Colors.primary; 
const ACCENT = Colors.accent; 
const LIGHT_BG = Colors.background; 
const CARD_BG = Colors.backgroundCard; 
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;
const BORDER_COLOR = Colors.borderLight;


const WalletCardIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 6H5C3.9 6 3 6.9 3 8V16C3 17.1 3.9 18 5 18H19C20.1 18 21 17.1 21 16V8C21 6.9 20.1 6 19 6Z"
      stroke={ACCENT}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 12C16 11.2 16.7 10.5 17.5 10.5H21V13.5H17.5C16.7 13.5 16 12.8 16 12Z"
      stroke={ACCENT}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="#FAF6F0"
    />
    <Circle cx="18.5" cy="12" r="1.2" fill={ACCENT} />
  </Svg>
);

export default function MyWalletScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { balance, transactions } = useWallet();

  const handleBack = () => {
    router.back();
  };

  const handleAddMoney = () => {
    router.push("/add-money" as any);
  };

  
  const groupedTxs = useMemo(() => {
    const groups: { title: string; data: Transaction[] }[] = [];
    transactions.forEach((tx) => {
      let group = groups.find((g) => g.title === tx.sectionHeader);
      if (!group) {
        group = { title: tx.sectionHeader, data: [] };
        groups.push(group);
      }
      group.data.push(tx);
    });
    return groups;
  }, [transactions]);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + 12,
          },
        ]}
      >
        {}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + 16 },
          ]}
        >
          {}
          <View style={styles.balanceCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.balanceLabel}>Wallet Balance</Text>
                <Text style={styles.balanceAmount}>
                  ${balance.toFixed(2)}
                </Text>
              </View>
              <View style={styles.walletIconContainer}>
                <WalletCardIcon />
              </View>
            </View>

            <TouchableOpacity
              style={styles.addMoneyButton}
              onPress={handleAddMoney}
              activeOpacity={0.9}
            >
              <Text style={styles.addMoneyText}>Add Money</Text>
            </TouchableOpacity>
          </View>

          {}
          {groupedTxs.map((group) => (
            <View key={group.title} style={styles.sectionContainer}>
              <Text style={styles.sectionHeaderTitle}>{group.title}</Text>
              
              {group.data.map((tx) => {
                const isAdded = tx.type === "added";
                return (
                  <View key={tx.id} style={styles.transactionCard}>
                    <View style={styles.txLeft}>
                      <Text style={styles.txTitle} numberOfLines={1}>
                        {tx.title}
                      </Text>
                      <Text style={styles.txSubtitle}>
                        {tx.date} | {tx.time}
                      </Text>
                    </View>
                    <View style={styles.txRight}>
                      <Text
                        style={[
                          styles.txAmount,
                          isAdded ? styles.amountGreen : styles.amountRed,
                        ]}
                      >
                        {isAdded ? "+" : "-"} ${tx.amount.toFixed(2)}
                      </Text>
                      <Text style={styles.txBalance}>
                        Balance ${tx.balance.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>
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
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  headerRightPlaceholder: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  balanceCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1.2,
    borderColor: "#EAE5DF",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  walletIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  addMoneyButton: {
    backgroundColor: BROWN_DARK,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    shadowColor: BROWN_DARK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  addMoneyText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 12,
    marginTop: 8,
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  txLeft: {
    flex: 1,
    paddingRight: 12,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  txSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
  txRight: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  amountGreen: {
    color: "#27AE60",
  },
  amountRed: {
    color: "#FF3B30",
  },
  txBalance: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: "500",
  },
});
