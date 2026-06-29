/**
 * API Client Helper for MyCakeShop Frontend
 * 
 * This module provides a centralized way to make API calls to the backend.
 * Features:
 * - Automatic token handling
 * - Consistent error handling
 * - Type-safe responses
 * - Support for all HTTP methods
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export function resolveStorageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const storageUrl = API_URL.replace(/\/api$/, '') + '/storage-file';
  return `${storageUrl}/${path}`;
}

interface ApiOptions extends RequestInit {
  token?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Generic API client function
 */
export async function apiClient<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { token, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  // Add Content-Type for non-FormData requests
  if (!(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Add authorization token if provided
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle validation errors (422)
      if (response.status === 422 && data.errors) {
        throw new ValidationError(data.message, data.errors);
      }

      // Handle other errors
      throw new ApiError(data.message || `API Error: ${response.status}`, response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError || error instanceof ValidationError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError('Network error. Please check your connection.', 0);
  }
}

/**
 * Custom error classes
 */
export class ApiError extends Error {
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends Error {
  constructor(public message: string, public errors: Record<string, string[]>) {
    super(message);
    this.name = 'ValidationError';
  }

  getFirstError(): string {
    const firstKey = Object.keys(this.errors)[0];
    return this.errors[firstKey]?.[0] || this.message;
  }

  getAllErrors(): string[] {
    return Object.values(this.errors).flat();
  }
}

/**
 * Convenience API methods
 */
export const api = {
  /**
   * GET request
   */
  get: <T>(endpoint: string, token?: string) =>
    apiClient<T>(endpoint, { method: 'GET', token }),

  /**
   * POST request
   */
  post: <T>(endpoint: string, data: any, token?: string) =>
    apiClient<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  /**
   * POST request with FormData (for file uploads)
   */
  postFormData: <T>(endpoint: string, formData: FormData, token?: string) =>
    apiClient<T>(endpoint, {
      method: 'POST',
      body: formData,
      token,
    }),

  /**
   * PUT request
   */
  put: <T>(endpoint: string, data: any, token?: string) =>
    apiClient<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  /**
   * PATCH request
   */
  patch: <T>(endpoint: string, data: any, token?: string) =>
    apiClient<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      token,
    }),

  /**
   * DELETE request
   */
  delete: <T>(endpoint: string, token?: string) =>
    apiClient<T>(endpoint, { method: 'DELETE', token }),
};

/**
 * Type definitions for API responses
 */
export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: 'customer' | 'admin';
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  stock: number;
  unit?: string;
  tag?: string;
  main_image: string;
  category: Category;
  sizes?: ProductSize[];
  images?: ProductImage[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface ProductSize {
  id: number;
  size_name: string;
  price: number;
}

export interface ProductImage {
  id: number;
  image_url: string;
  order: number;
}

export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    main_image: string;
    stock: number;
  };
  size?: {
    id: number;
    size_name: string;
    price: number;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  summary: {
    subtotal: number;
    packaging_fee: number;
    tax: number;
    total: number;
  };
}

export interface Address {
  id: number;
  label: string;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

export interface ShippingMethod {
  id: number;
  name: string;
  description?: string;
  cost: number;
  estimated_time?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  type: 'bank_transfer' | 'ewallet' | 'qris';
  icon?: string;
}

export interface Order {
  id: number;
  uuid: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total: number;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends Order {
  recipient_name: string;
  recipient_phone: string;
  shipping_address: string;
  city: string;
  province: string;
  postal_code: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  notes?: string;
  shipping_method: {
    id: number;
    name: string;
    cost: number;
  };
  payment_method: {
    id: number;
    name: string;
    type: string;
  };
  items: OrderItem[];
  payment?: Payment;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_size?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Payment {
  id: number;
  status: 'pending' | 'processing' | 'success' | 'failed';
  amount: number;
  payment_proof?: string;
  paid_at?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: { name: string };
  product: { id: number; name: string; main_image: string };
}

export interface ReviewStats {
  total: number;
  average: number;
  star5: number;
  star4: number;
  star3: number;
  star2: number;
  star1: number;
}

export interface ReviewsApiData {
  items: Review[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
  stats: ReviewStats;
}
