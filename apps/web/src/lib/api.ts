import {
  SessionResponse,
  WasteType,
  IdeaPublic,
  PaginatedResponse,
  ScanResponse,
  ImpactSummaryResponse,
  Product,
  PublicSettings,
  TodayStatsResponse,
  CommunityMakeItem,
} from '@remake/shared';

const BASE_URL = '/api';

export async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {
      // ignore
    }
    const err: any = new Error(errorData?.error?.message || `Request failed with status ${res.status}`);
    err.code = errorData?.error?.code;
    err.details = errorData?.error?.details;
    err.status = res.status;
    throw err;
  }

  return res.json();
}

// Session & Auth
export const getSession = () => fetchApi<SessionResponse>('/session');
export const registerUser = (data: { name: string; email: string; password: string }) =>
  fetchApi<{ user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const loginUser = (data: { email: string; password: string }) =>
  fetchApi<{ user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const logoutUser = () => fetchApi<{ ok: boolean }>('/auth/logout', { method: 'POST' });
export const updateMe = (data: { name?: string; locale?: string; theme?: string }) =>
  fetchApi<{ user: any }>('/me', { method: 'PATCH', body: JSON.stringify(data) });

// Waste Types & Catalog
export const getWasteTypes = () => fetchApi<WasteType[]>('/waste-types');
export const getIdeas = (query: Record<string, any>) => {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') {
      params.append(k, String(v));
    }
  }
  return fetchApi<PaginatedResponse<IdeaPublic>>(`/ideas?${params.toString()}`);
};
export const getTrendingIdeas = () => fetchApi<IdeaPublic[]>('/ideas/trending');
export const getQuickWinsIdeas = () => fetchApi<IdeaPublic[]>('/ideas/quick-wins');
export const getIdeaBySlug = (slug: string) => fetchApi<IdeaPublic>(`/ideas/${slug}`);

// Saves
export const saveIdea = (id: string) => fetchApi<{ saved: boolean }>(`/ideas/${id}/save`, { method: 'POST' });
export const unsaveIdea = (id: string) => fetchApi<{ saved: boolean }>(`/ideas/${id}/save`, { method: 'DELETE' });
export const getSavedIdeas = () => fetchApi<{ items: IdeaPublic[] }>('/me/saved');

// Scans
export const submitScan = (formData: FormData) =>
  fetchApi<ScanResponse>('/scans', { method: 'POST', body: formData });
export const patchScanItems = (scanId: string, items: Array<{ wasteTypeSlug: string; pieces: number }>) =>
  fetchApi<any>(`/scans/${scanId}/items`, { method: 'PATCH', body: JSON.stringify({ items }) });
export const suggestScanIdeas = (scanId: string, regenerate = false) =>
  fetchApi<{ ideas: any[] }>(`/scans/${scanId}/suggest`, { method: 'POST', body: JSON.stringify({ regenerate }) });
export const getScanById = (scanId: string) => fetchApi<any>(`/scans/${scanId}`);

// AI Helpers
export const askIdeaAssistant = (ideaId: string, message: string, history?: any[]) =>
  fetchApi<{ reply: string; disclaimer: string }>(`/ideas/${ideaId}/assistant`, {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
export const adaptIdeaMaterials = (ideaId: string, have: string[]) =>
  fetchApi<{ materialsMap: any[]; notes?: string }>(`/ideas/${ideaId}/adapt`, {
    method: 'POST',
    body: JSON.stringify({ have }),
  });

// Makes
export const submitMake = (ideaId: string, formData: FormData) =>
  fetchApi<{ make: any; impactAdded: any; newBadges: any[]; streak: any }>(`/ideas/${ideaId}/makes`, {
    method: 'POST',
    body: formData,
  });
export const getMyMakes = () => fetchApi<{ makes: any[] }>('/me/makes');
export const getCommunityMakes = (wasteSlug?: string, page = 1) =>
  fetchApi<PaginatedResponse<CommunityMakeItem>>(`/community?page=${page}${wasteSlug ? `&waste=${wasteSlug}` : ''}`);
export const toggleLikeMake = (makeId: string, isLiked: boolean) =>
  fetchApi<{ liked: boolean; likesCount: number }>(`/makes/${makeId}/like`, {
    method: isLiked ? 'DELETE' : 'POST',
  });

// Impact
export const getMyImpact = () => fetchApi<ImpactSummaryResponse>('/me/impact');
export const logImpact = (data: { wasteTypeSlug: string; pieces?: number; grams?: number; note?: string }) =>
  fetchApi<{ log: any; newBadges: any[] }>('/me/impact-logs', { method: 'POST', body: JSON.stringify(data) });
export const getImpactMethod = () => fetchApi<any>('/impact/method');

// Products & Shop
export const getProducts = () => fetchApi<Product[]>('/products');
export const getProductBySlug = (slug: string) => fetchApi<Product>(`/products/${slug}`);

// Misc & Stats
export const getPublicSettings = () => fetchApi<PublicSettings>('/settings/public');
export const submitSuggestion = (data: { kind: 'WASTE' | 'IDEA'; text: string }) =>
  fetchApi<any>('/suggestions', { method: 'POST', body: JSON.stringify(data) });
export const getTodayStats = () => fetchApi<TodayStatsResponse>('/stats/today');

// Admin APIs
export const getAdminDashboard = () => fetchApi<any>('/admin/dashboard');
export const getAdminIdeas = () => fetchApi<{ ideas: any[] }>('/admin/ideas');
export const createAdminIdea = (data: any) => fetchApi<any>('/admin/ideas', { method: 'POST', body: JSON.stringify(data) });
export const updateAdminIdea = (id: string, data: any) => fetchApi<any>(`/admin/ideas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteAdminIdea = (id: string) => fetchApi<any>(`/admin/ideas/${id}`, { method: 'DELETE' });
export const promoteAdminIdea = (id: string) => fetchApi<any>(`/admin/ideas/${id}/promote`, { method: 'POST' });
export const uploadAdminImage = (formData: FormData) =>
  fetchApi<{ url: string }>('/admin/uploads', { method: 'POST', body: formData });
export const getAdminMakes = (status = 'PENDING') => fetchApi<{ makes: any[] }>(`/admin/makes?status=${status}`);
export const approveAdminMake = (id: string) => fetchApi<any>(`/admin/makes/${id}/approve`, { method: 'POST' });
export const rejectAdminMake = (id: string, reason: string) =>
  fetchApi<any>(`/admin/makes/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) });
export const getAdminWasteTypes = () => fetchApi<any[]>('/admin/waste-types');
export const updateAdminWasteType = (id: string, data: any) =>
  fetchApi<any>(`/admin/waste-types/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const getAdminSettings = () => fetchApi<any>('/admin/settings');
export const updateAdminSettings = (data: any) => fetchApi<any>('/admin/settings', { method: 'PUT', body: JSON.stringify(data) });
