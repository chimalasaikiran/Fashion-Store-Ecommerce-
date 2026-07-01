import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

const getBaseUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (__DEV__ && hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:5000/api`;
  }
  return "http://localhost:5000/api";
};

export const API_URL = getBaseUrl();

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync("auth_token", token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync("auth_token");
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync("auth_token");
  } catch (error) {
    console.error("Error deleting token:", error);
  }
};

const apiRequest = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: any,
  requireAuth = false
) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = await getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = `${API_URL}${endpoint}`;
  
  try {
    console.log(`[API Request] ${method} ${url}`, body ? JSON.stringify(body).slice(0, 100) + "..." : "");
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`[API Error] ${method} ${url}:`, error.message || error);
    throw error;
  }
};


export const signupUser = async (name: string, email: string, password: string) => {
  return await apiRequest("/auth/signup", "POST", { name, email, password });
};

export const verifyOtp = async (email: string, otp: string) => {
  return await apiRequest("/auth/verify-otp", "POST", { email, otp });
};

export const resendOtp = async (email: string) => {
  return await apiRequest("/auth/resend-otp", "POST", { email });
};

export const loginUser = async (email: string, password: string) => {
  return await apiRequest("/auth/login", "POST", { email, password });
};

export const completeUserProfile = async (profileData: {
  name?: string;
  phone?: string;
  countryCode?: string;
  gender?: string;
  avatar?: string;
}) => {
  return await apiRequest("/auth/complete-profile", "PUT", profileData, true);
};

export const resetUserPassword = async (email: string, password: string) => {
  return await apiRequest("/auth/reset-password", "POST", { email, password });
};


export interface ProductQueryFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  size?: string;
  search?: string;
}

export const getProducts = async (filters: ProductQueryFilters = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      queryParams.append(key, String(val));
    }
  });
  const queryString = queryParams.toString();
  const endpoint = queryString ? `/products?${queryString}` : "/products";
  return await apiRequest(endpoint, "GET");
};

export const getCategories = async () => {
  return await apiRequest("/categories", "GET");
};

export const getProductDetails = async (id: string) => {
  return await apiRequest(`/products/${id}`, "GET");
};

export const getProductReviews = async (id: string) => {
  return await apiRequest(`/products/${id}/reviews`, "GET");
};

export const submitProductReview = async (
  id: string,
  reviewData: {
    name: string;
    rating: number;
    text: string;
    avatar?: string;
    verified?: boolean;
    images?: string[];
  }
) => {
  return await apiRequest(`/products/${id}/reviews`, "POST", reviewData);
};


export interface OrderItemInput {
  product: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  quantity: number;
  size: string;
  color: string;
}

export interface CreateOrderPayload {
  phone: string;
  promoCode?: string;
  paymentMethod: string;
  items: OrderItemInput[];
  totalAmount: number;
  shippingAddress?: { name: string; street: string; city: string; state: string; zip: string; country: string; phone: string };
  shippingMethod?: string;
}

export const createOrderApi = async (orderData: CreateOrderPayload) => {
  return await apiRequest("/orders", "POST", orderData, true);
};

export const getOrdersApi = async (status?: string) => {
  const endpoint = status ? `/orders?status=${status}` : "/orders";
  return await apiRequest(endpoint, "GET", undefined, true);
};

export const getOrderByIdApi = async (id: string) => {
  return await apiRequest(`/orders/${encodeURIComponent(id)}`, "GET", undefined, true);
};

export const cancelOrderApi = async (id: string, reason: string, comments?: string) => {
  return await apiRequest(`/orders/${encodeURIComponent(id)}/cancel`, "PUT", { reason, comments }, true);
};

export const reorderApi = async (id: string) => {
  return await apiRequest(`/orders/${encodeURIComponent(id)}/reorder`, "PUT", undefined, true);
};

export const createReturnRequestApi = async (
  id: string,
  reason: string,
  productName: string,
  productPrice: number
) => {
  return await apiRequest(`/orders/${encodeURIComponent(id)}/return`, "POST", { reason, productName, productPrice }, true);
};

export const createReplacementRequestApi = async (
  id: string,
  reason: string,
  originalProduct: string,
  replacementProduct: string
) => {
  return await apiRequest(`/orders/${encodeURIComponent(id)}/replacement`, "POST", { reason, originalProduct, replacementProduct }, true);
};

export const getCartApi = async () => {
  return await apiRequest("/cart", "GET", undefined, true);
};

export const syncCartApi = async (cartItems: any[]) => {
  return await apiRequest("/cart", "PUT", { cart: cartItems }, true);
};

