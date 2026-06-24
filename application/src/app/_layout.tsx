import { Stack } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import AppSplashScreen from "../screens/onboarding/SplashScreen";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { PaymentProvider } from "../context/PaymentContext";
import { ProfileProvider } from "../context/ProfileContext";
import { OrderProvider, useOrders } from "../context/OrderContext";
import { WalletProvider } from "../context/WalletContext";
import { NotificationProvider } from "../context/NotificationContext";


SplashScreen.preventAutoHideAsync();

function NotificationWrapper({ children }: { children: React.ReactNode }) {
  const { fetchOrders, orders } = useOrders();
  return (
    <NotificationProvider fetchOrders={fetchOrders} orders={orders}>
      {children}
    </NotificationProvider>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  const handleSplashFinish = useCallback(() => {
    setShowCustomSplash(false);
  }, []);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProfileProvider>
        <WalletProvider>
          <OrderProvider>
            <NotificationWrapper>
              <CartProvider>
                <WishlistProvider>
                  <PaymentProvider>
                    <View style={{ flex: 1, backgroundColor: "#3D1800" }}>
                      {/* App Stack */}
                      <Stack screenOptions={{ headerShown: false }} />

                      {/* Splash overlay */}
                      {showCustomSplash && (
                        <AppSplashScreen onFinish={handleSplashFinish} />
                      )}
                    </View>
                  </PaymentProvider>
                </WishlistProvider>
              </CartProvider>
            </NotificationWrapper>
          </OrderProvider>
        </WalletProvider>
      </ProfileProvider>
    </GestureHandlerRootView>
  );
}

