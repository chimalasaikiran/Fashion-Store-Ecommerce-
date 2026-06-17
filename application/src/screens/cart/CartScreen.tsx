import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { useCart, CartItem } from "../../context/CartContext";
import { Colors } from "../../constants/Colors";


const BROWN_DARK = Colors.primary;
const LIGHT_BG = Colors.backgroundLight;
const CARD_BG = Colors.background;
const BORDER_COLOR = Colors.borderMedium;
const TEXT_MUTED = Colors.textMuted;
const TEXT_PRIMARY = Colors.textPrimary;
const RED_DELETE = Colors.redDelete;

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    applyPromoCode,
    promoDiscount,
    appliedPromo,
    subTotal,
    deliveryCharge,
    tax,
    totalCost,
  } = useCart();

  
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [selectedItemToRemove, setSelectedItemToRemove] = useState<CartItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  
  useEffect(() => {
    if (appliedPromo) {
      setPromoInput(appliedPromo);
      setPromoMessage({
        text: `Promo code "${appliedPromo}" applied successfully!`,
        success: true,
      });
    }
  }, [appliedPromo]);

  const handleBack = () => {
    router.back();
  };

  
  const handleIncrease = (item: CartItem) => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = (item: CartItem) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      
      handlePromptRemove(item);
    }
  };

  
  const handlePromptRemove = (item: CartItem) => {
    setSelectedItemToRemove(item);
    setModalVisible(true);
    
    
    if (swipeableRefs.current[item.id]) {
      swipeableRefs.current[item.id]?.close();
    }
  };

  const confirmRemoval = () => {
    if (selectedItemToRemove) {
      removeFromCart(selectedItemToRemove.id);
      setSelectedItemToRemove(null);
    }
    setModalVisible(false);
  };

  const cancelRemoval = () => {
    setSelectedItemToRemove(null);
    setModalVisible(false);
  };

  
  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const success = applyPromoCode(promoInput);
    if (success) {
      setPromoMessage({ text: `Promo code "${promoInput.toUpperCase()}" applied successfully!`, success: true });
    } else {
      setPromoMessage({ text: "Invalid promo code.", success: false });
    }
    setPromoInput("");
  };

  
  const renderRightActions = (item: CartItem) => {
    return (
      <TouchableOpacity
        style={styles.deleteSwipeAction}
        onPress={() => handlePromptRemove(item)}
        activeOpacity={0.8}
      >
        <Feather name="trash-2" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {}
      <View style={[styles.headerContainer, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {}
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-bag" size={64} color={TEXT_MUTED} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>Explore products and add them to your cart!</Text>
          <TouchableOpacity
            style={styles.shopNowBtn}
            onPress={() => router.push("/home")}
            activeOpacity={0.85}
          >
            <Text style={styles.shopNowText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {}
            <View style={styles.itemsList}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.swipeableWrapper}>
                  <Swipeable
                    ref={(ref) => {
                      swipeableRefs.current[item.id] = ref;
                    }}
                    renderRightActions={() => renderRightActions(item)}
                    friction={2}
                    rightThreshold={40}
                  >
                    <View style={styles.itemCard}>
                      {}
                      <Image source={item.image} style={styles.itemImage} contentFit="cover" />

                      {}
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemCategory}>
                          {item.category}
                        </Text>
                        <View style={styles.priceRow}>
                          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                          <Text style={styles.itemOriginalPrice}>
                            ${item.originalPrice.toFixed(2)}
                          </Text>
                        </View>
                      </View>

                      {}
                      <View style={styles.quantityContainer}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => handleDecrease(item)}
                          activeOpacity={0.6}
                        >
                          <Feather name="minus" size={14} color={TEXT_PRIMARY} />
                        </TouchableOpacity>
                        
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        
                        <TouchableOpacity
                          style={[styles.qtyBtn, styles.qtyBtnPlus]}
                          onPress={() => handleIncrease(item)}
                          activeOpacity={0.6}
                        >
                          <Feather name="plus" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Swipeable>
                </View>
              ))}
            </View>
          </ScrollView>

          {}
          <View style={[styles.summaryContainer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
            {}
            <View style={styles.promoContainer}>
              <View style={styles.promoInputWrapper}>
                <TextInput
                  style={styles.promoInput}
                  placeholder="Promo Code"
                  placeholderTextColor="#A8A8A8"
                  value={promoInput}
                  onChangeText={(val) => {
                    setPromoInput(val);
                    if (promoMessage) setPromoMessage(null);
                  }}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.promoApplyBtn}
                  onPress={handleApplyPromo}
                  activeOpacity={0.8}
                >
                  <Text style={styles.promoApplyBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>

              {promoMessage && (
                <Text
                  style={[
                    styles.promoMsgText,
                    { color: promoMessage.success ? "#2E7D32" : "#D32F2F" },
                  ]}
                >
                  {promoMessage.text}
                </Text>
              )}
            </View>

            {}
            <View style={styles.breakdownTable}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Sub-Total</Text>
                <Text style={styles.breakdownVal}>${subTotal.toFixed(2)}</Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Delivery Charge</Text>
                <Text style={styles.breakdownVal}>${deliveryCharge.toFixed(2)}</Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Tax</Text>
                <Text style={styles.breakdownVal}>${tax.toFixed(2)}</Text>
              </View>

              {promoDiscount > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Discount</Text>
                  <Text style={[styles.breakdownVal, styles.discountVal]}>
                    -${promoDiscount.toFixed(2)}
                  </Text>
                </View>
              )}

              {}
              <View style={styles.dottedDivider} />

              <View style={[styles.breakdownRow, { marginTop: 10 }]}>
                <Text style={styles.totalLabel}>Total Cost</Text>
                <Text style={styles.totalVal}>${totalCost.toFixed(2)}</Text>
              </View>
            </View>

            {}
            <TouchableOpacity
              style={styles.checkoutBtn}
              activeOpacity={0.9}
              onPress={() => {
                router.push("/shipping-address");
              }}
            >
              <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}


      {}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelRemoval}
      >
        <View style={styles.modalOverlay}>
          {}
          <TouchableOpacity
            style={styles.dismissOverlay}
            activeOpacity={1}
            onPress={cancelRemoval}
          />
          
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            {}
            <View style={styles.modalGrabBar} />

            <Text style={styles.modalTitle}>Remove from Cart?</Text>
            <View style={styles.modalDivider} />

            {}
            {selectedItemToRemove && (
              <View style={styles.modalItemPreview}>
                <Image
                  source={selectedItemToRemove.image}
                  style={styles.modalItemImage}
                  contentFit="cover"
                />
                <View style={styles.modalItemDetails}>
                  <Text style={styles.modalItemName} numberOfLines={1}>
                    {selectedItemToRemove.name}
                  </Text>
                  <Text style={styles.modalItemCategory}>
                    {selectedItemToRemove.category}
                  </Text>
                  <View style={styles.modalPriceRow}>
                    <Text style={styles.modalItemPrice}>
                      ${selectedItemToRemove.price.toFixed(2)}
                    </Text>
                    <Text style={styles.modalItemOriginalPrice}>
                      ${selectedItemToRemove.originalPrice.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={cancelRemoval}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmRemoval}
                activeOpacity={0.9}
              >
                <Text style={styles.modalConfirmBtnText}>Yes, Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    backgroundColor: CARD_BG,
    borderBottomWidth: 1,
    borderColor: "#EAEAEA",
    paddingBottom: 12,
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
  scrollContent: {
    paddingBottom: 350,
  },
  itemsList: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 16,
  },
  swipeableWrapper: {
    backgroundColor: RED_DELETE,
    borderRadius: 20,
    overflow: "hidden",
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 20,
    padding: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: BROWN_DARK,
  },
  itemOriginalPrice: {
    fontSize: 12,
    color: TEXT_MUTED,
    textDecorationLine: "line-through",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    padding: 3,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  qtyBtnPlus: {
    backgroundColor: BROWN_DARK,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    paddingHorizontal: 12,
  },
  deleteSwipeAction: {
    width: 80,
    backgroundColor: RED_DELETE,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },

  summaryContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: BORDER_COLOR,
  },
  promoContainer: {
    marginBottom: 20,
  },
  promoInputWrapper: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 30,
    height: 54,
    alignItems: "center",
    paddingHorizontal: 6,
  },
  promoInput: {
    flex: 1,
    paddingLeft: 18,
    fontSize: 15,
    color: TEXT_PRIMARY,
  },
  promoApplyBtn: {
    backgroundColor: BROWN_DARK,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
  },
  promoApplyBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  promoMsgText: {
    fontSize: 12,
    marginTop: 6,
    paddingLeft: 16,
    fontWeight: "500",
  },
  breakdownTable: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    padding: 20,
    marginBottom: 24,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 6,
  },
  breakdownLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  breakdownVal: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  discountVal: {
    color: "#D32F2F",
  },
  dottedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: "800",
    color: BROWN_DARK,
  },
  checkoutBtn: {
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
  checkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  
  emptyContainer: {
    flex: 0.8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  shopNowBtn: {
    backgroundColor: BROWN_DARK,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  shopNowText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  dismissOverlay: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  modalGrabBar: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 16,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginBottom: 20,
  },
  modalItemPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    borderRadius: 20,
    padding: 12,
    marginBottom: 24,
  },
  modalItemImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
  },
  modalItemDetails: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  modalItemName: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  modalItemCategory: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginBottom: 6,
  },
  modalPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modalItemPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: BROWN_DARK,
  },
  modalItemOriginalPrice: {
    fontSize: 11,
    color: TEXT_MUTED,
    textDecorationLine: "line-through",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_MUTED,
  },
  modalConfirmBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: BROWN_DARK,
    justifyContent: "center",
    alignItems: "center",
  },
  modalConfirmBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
