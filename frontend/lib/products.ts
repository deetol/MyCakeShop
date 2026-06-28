/**
 * Product types & helpers shared between frontend pages
 * All product data comes from the backend API — no static files.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Helper: convert a raw main_image value to a usable URL
// If it already starts with http, return as-is.
// If it's a storage path, prepend APP_URL/storage
export function resolveImageUrl(rawUrl: string | null | undefined): string {
  if (!rawUrl) return '/placeholder-cake.svg';
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) return rawUrl;
  // Storage path like "products/xxx.jpg"
  return `http://127.0.0.1:8000/storage/${rawUrl}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiProductSize {
  id: number;
  size_name: string;
  price: number;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  stock: number;
  unit: string | null;
  tag: string | null;
  main_image: string | null;
  ingredients: string[] | null;
  allergens: string[] | null;
  is_active: boolean;
  rating_avg: number | null;
  review_count: number;
  rating_distribution?: { 5: number; 4: number; 3: number; 2: number; 1: number };
  recent_reviews?: {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: { name: string };
  }[];
  category: ApiCategory | null;
  sizes: ApiProductSize[];
  images?: { id: number; image_url: string; order: number }[];
}

// Normalised shape used by ProductCard & detail page
export interface FrontendProduct {
  id: string;          // string version for cart key
  numericId: number;   // numeric id for API calls
  name: string;
  slug: string;
  description: string;
  price: number;
  unit: string;
  tag: string;
  image: string;
  category: string;
  ingredients: string[];
  allergens: string[];
  stock: number;
  sizes: { id: number; name: string; price: number }[];
  gallery: string[];
  isActive: boolean;
  ratingAvg: number | null;
  reviewCount: number;
  ratingDistribution?: { 5: number; 4: number; 3: number; 2: number; 1: number };
  recentReviews?: {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: { name: string };
  }[];
}

// Map backend product to frontend shape
export function mapProduct(p: ApiProduct): FrontendProduct {
  const image = resolveImageUrl(p.main_image);
  const sizes = (p.sizes || []).map(s => ({ id: s.id, name: s.size_name, price: s.price }));

  return {
    id: p.id.toString(),
    numericId: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: sizes.length > 0 ? sizes[0].price : p.base_price,
    unit: p.unit || '',
    tag: p.tag || '',
    image,
    category: p.category?.name || '',
    ingredients: p.ingredients || [],
    allergens: p.allergens || [],
    stock: p.stock,
    sizes,
    gallery: p.images?.map(i => resolveImageUrl(i.image_url)) || [image],
    isActive: p.is_active,
    ratingAvg: p.rating_avg ?? null,
    reviewCount: p.review_count ?? 0,
    ratingDistribution: p.rating_distribution,
    recentReviews: p.recent_reviews,
  };
}

// Fetch all products (public endpoint – no auth needed)
export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  sort?: string;
  page?: number;
  per_page?: number;
}): Promise<{ products: FrontendProduct[]; total: number; lastPage: number }> {
  const qs = new URLSearchParams();
  if (params?.category)  qs.set('category', params.category);
  if (params?.search)    qs.set('search', params.search);
  if (params?.sort)      qs.set('sort', params.sort);
  if (params?.page)      qs.set('page', params.page.toString());
  if (params?.per_page)  qs.set('per_page', params.per_page.toString());

  const res = await fetch(`${API_URL}/products?${qs.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  const json = await res.json();

  const raw = json.data?.products || json.data || json.products || [];
  const pagination = json.data?.pagination || {};

  return {
    products: (raw as ApiProduct[]).map(mapProduct),
    total: pagination.total || raw.length,
    lastPage: pagination.last_page || 1,
  };
}

// Fetch single product by slug or id
export async function fetchProduct(slugOrId: string): Promise<FrontendProduct | null> {
  // Try by slug first (public endpoint)
  const res = await fetch(`${API_URL}/products/${slugOrId}`);
  if (!res.ok) return null;
  const json = await res.json();
  const p: ApiProduct = json.data;
  if (!p) return null;
  return mapProduct(p);
}

// Fetch categories
export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) return [];
  const json = await res.json();
  const raw = json.data;
  return Array.isArray(raw) ? raw : raw?.categories || raw?.data || [];
}
