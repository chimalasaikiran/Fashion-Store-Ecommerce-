import React from "react";
import { useLocalSearchParams } from "expo-router";

import AddCardScreen from "../screens/settings/AddCardScreen";
import AddMoneyScreen from "../screens/wallet/AddMoneyScreen";
import CartScreen from "../screens/cart/CartScreen";
import ChatConversationScreen from "../screens/chat/ChatConversationScreen";
import ChatScreen from "../screens/chat/ChatScreen";
import CheckoutScreen from "../screens/checkout/CheckoutScreen";
import ChooseShippingScreen from "../screens/checkout/ChooseShippingScreen";
import CompleteProfileScreen from "../screens/auth/CompleteProfileScreen";
import EReceiptScreen from "../screens/orders/EReceiptScreen";
import EnterLocationScreen from "../screens/settings/EnterLocationScreen";
import FilterScreen from "../screens/product/FilterScreen";
import HelpCenterScreen from "../screens/settings/HelpCenterScreen";
import HomeScreen from "../screens/home/HomeScreen";
import WelcomeScreen from "../screens/onboarding/WelcomeScreen";
import InviteFriendsScreen from "../screens/settings/InviteFriendsScreen";
import LeaveReviewScreen from "../screens/orders/LeaveReviewScreen";
import LocationAccessScreen from "../screens/onboarding/LocationAccessScreen";
import OrderDetailsScreen from "../screens/orders/OrderDetailsScreen";
import MyCouponsScreen from "../screens/profile/MyCouponsScreen";
import MyOrdersScreen from "../screens/orders/MyOrdersScreen";
import MyWalletScreen from "../screens/wallet/MyWalletScreen";
import NewPasswordScreen from "../screens/auth/NewPasswordScreen";
import NotificationAccessScreen from "../screens/onboarding/NotificationAccessScreen";
import NotificationScreen from "../screens/notifications/NotificationScreen";
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import PasswordManagerScreen from "../screens/settings/PasswordManagerScreen";
import PaymentMethodsScreen from "../screens/settings/PaymentMethodsScreen";
import PaymentSuccessScreen from "../screens/checkout/PaymentSuccessScreen";
import PrivacyPolicyScreen from "../screens/settings/PrivacyPolicyScreen";
import ProductDetailsScreen from "../screens/product/ProductDetailsScreen";
import ReviewsScreen from "../screens/product/ReviewsScreen";
import SearchScreen from "../screens/product/SearchScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import ShippingAddressScreen from "../screens/settings/ShippingAddressScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import TopUpSuccessScreen from "../screens/wallet/TopUpSuccessScreen";
import TrackOrderScreen from "../screens/orders/TrackOrderScreen";
import VerifyCodeScreen from "../screens/auth/VerifyCodeScreen";
import WishlistScreen from "../screens/wishlist/WishlistScreen";
import YourProfileScreen from "../screens/profile/YourProfileScreen";

export default function RouteHandler() {
  const { route } = useLocalSearchParams<{ route?: string[] }>();
  
  const currentRoute = route && route.length > 0 ? route.join("/") : "";

  switch (currentRoute) {
    case "":
    case "index":
      return <WelcomeScreen />;
    case "add-card":
      return <AddCardScreen />;
    case "add-money":
      return <AddMoneyScreen />;
    case "cart":
      return <CartScreen />;
    case "chat-conversation":
      return <ChatConversationScreen />;
    case "chat":
      return <ChatScreen />;
    case "checkout":
      return <CheckoutScreen />;
    case "choose-shipping":
      return <ChooseShippingScreen />;
    case "complete-profile":
      return <CompleteProfileScreen />;
    case "e-receipt":
      return <EReceiptScreen />;
    case "enter-location":
      return <EnterLocationScreen />;
    case "filter":
      return <FilterScreen />;
    case "help-center":
      return <HelpCenterScreen />;
    case "home":
      return <HomeScreen />;
    case "invite-friends":
      return <InviteFriendsScreen />;
    case "leave-review":
      return <LeaveReviewScreen />;
    case "location-access":
      return <LocationAccessScreen />;
    case "my-coupons":
      return <MyCouponsScreen />;
    case "my-orders":
      return <MyOrdersScreen />;
    case "my-wallet":
      return <MyWalletScreen />;
    case "new-password":
      return <NewPasswordScreen />;
    case "notification-access":
      return <NotificationAccessScreen />;
    case "notification":
      return <NotificationScreen />;
    case "onboarding":
      return <OnboardingScreen />;
    case "password-manager":
      return <PasswordManagerScreen />;
    case "payment-methods":
      return <PaymentMethodsScreen />;
    case "payment-success":
      return <PaymentSuccessScreen />;
    case "privacy-policy":
      return <PrivacyPolicyScreen />;
    case "product-details":
      return <ProductDetailsScreen />;
    case "reviews":
      return <ReviewsScreen />;
    case "search":
      return <SearchScreen />;
    case "settings":
      return <SettingsScreen />;
    case "shipping-address":
      return <ShippingAddressScreen />;
    case "signin":
      return <LoginScreen />;
    case "signup":
      return <SignUpScreen />;
    case "top-up-success":
      return <TopUpSuccessScreen />;

    case "track-order":
      return <TrackOrderScreen />;
    case "order-details":
      return <OrderDetailsScreen />;
    case "verify-code":
      return <VerifyCodeScreen />;
    case "wishlist":
      return <WishlistScreen />;
    case "your-profile":
      return <YourProfileScreen />;
    default:
      return <WelcomeScreen />;
  }
}
