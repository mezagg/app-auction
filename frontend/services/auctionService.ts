import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;
const API_BASE_URL = `${BACKEND_URL}/api`;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Types
export interface Auction {
  auction_id: string;
  title: string;
  description: string;
  reason: string;
  company_name: string;
  start_date: string;
  end_date: string;
  status: 'proxima' | 'activa' | 'finalizada';
  location: string;
  state: string;
  total_items: number;
  registration_fee: number;
}

export interface AuctionItem {
  item_id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  model?: string;
  year?: number;
  starting_price: number;
  current_bid: number;
  estimated_value: {
    min: number;
    max: number;
  };
  images: string[];
  condition: string;
  mileage?: number;
  specifications: Record<string, any>;
  location: string;
  auction_id: string;
}

export interface User {
  user_id: string;
  email: string;
  full_name: string;
  phone: string;
  company?: string;
  is_active: boolean;
  created_at: string;
  registered_auctions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  full_name: string;
  phone: string;
  company?: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// Auth Services
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    const { access_token } = response.data;
    setAuthToken(access_token);
    return response.data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', userData);
    const { access_token } = response.data;
    setAuthToken(access_token);
    return response.data;
  },

  logout() {
    setAuthToken(null);
  },
};

// Auction Services
export const auctionService = {
  async getAuctions(): Promise<Auction[]> {
    const response = await apiClient.get('/auctions');
    return response.data;
  },

  async getAuctionDetail(auctionId: string): Promise<Auction> {
    const response = await apiClient.get(`/auctions/${auctionId}`);
    return response.data;
  },

  async getAuctionItems(auctionId: string): Promise<AuctionItem[]> {
    const response = await apiClient.get(`/auctions/${auctionId}/items`);
    return response.data;
  },

  async getItemDetail(itemId: string): Promise<AuctionItem> {
    const response = await apiClient.get(`/items/${itemId}`);
    return response.data;
  },

  async searchAuctions(params: {
    category?: string;
    state?: string;
    status?: string;
    min_price?: number;
    max_price?: number;
  }): Promise<Auction[]> {
    const response = await apiClient.get('/search/auctions', { params });
    return response.data;
  },
};

// User Services
export const userService = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  async getUserAuctions(): Promise<Auction[]> {
    const response = await apiClient.get('/user/auctions');
    return response.data;
  },
};

export default {
  auth: authService,
  auctions: auctionService,
  user: userService,
  setAuthToken,
};