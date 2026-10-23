import {
  UserProfile,
  WaterNotice,
  WaterStorageContainer,
  HouseholdExpense,
  HouseholdBudget,
  WaterVendor,
  Building,
  BuildingWaterUpdate,
  IssueReport,
  SMSSubscription,
  NotificationEvent,
  AuditLog,
  NairobiArea,
} from '../types';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || `Request to ${endpoint} failed (${response.status})`);
  }

  return data;
}

export const api = {
  // Auth & Profile
  getMe: async (): Promise<{ success: boolean; user: UserProfile }> => {
    return request('/me');
  },
  updateMe: async (data: Partial<UserProfile>): Promise<{ success: boolean; user: UserProfile }> => {
    return request('/me', { method: 'PATCH', body: JSON.stringify(data) });
  },
  switchDemoRole: async (role: string, uid?: string): Promise<{ success: boolean; user: UserProfile }> => {
    return request('/auth/demo-switch', { method: 'POST', body: JSON.stringify({ role, uid }) });
  },
  register: async (data: any): Promise<{ success: boolean; user: UserProfile }> => {
    return request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
  },

  // Areas
  getAreas: async (): Promise<{ success: boolean; areas: NairobiArea[] }> => {
    return request('/areas');
  },

  // Notices
  getNotices: async (params: {
    areaId?: string;
    noticeType?: string;
    verificationStatus?: string;
    status?: string;
    search?: string;
  } = {}): Promise<{ success: boolean; notices: WaterNotice[] }> => {
    const searchParams = new URLSearchParams();
    if (params.areaId) searchParams.set('areaId', params.areaId);
    if (params.noticeType) searchParams.set('noticeType', params.noticeType);
    if (params.verificationStatus) searchParams.set('verificationStatus', params.verificationStatus);
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return request(`/notices${query ? `?${query}` : ''}`);
  },
  getNotice: async (noticeId: string): Promise<{ success: boolean; notice: WaterNotice }> => {
    return request(`/notices/${noticeId}`);
  },
  createNotice: async (data: any): Promise<{ success: boolean; notice: WaterNotice }> => {
    return request('/notices', { method: 'POST', body: JSON.stringify(data) });
  },
  publishNotice: async (noticeId: string): Promise<{ success: boolean; notice: WaterNotice; dispatchResults: any[] }> => {
    return request(`/notices/${noticeId}/publish`, { method: 'POST' });
  },
  resolveNotice: async (
    noticeId: string,
    data: { notes?: string; notifySubscribers?: boolean } = {}
  ): Promise<{ success: boolean; notice: WaterNotice; restorationSMSCount: number }> => {
    return request(`/notices/${noticeId}/resolve`, { method: 'POST', body: JSON.stringify(data) });
  },

  // Water Storage (Household)
  getWaterStorage: async (): Promise<{ success: boolean; tanks: WaterStorageContainer[] }> => {
    return request('/water-storage');
  },
  createWaterStorage: async (data: Partial<WaterStorageContainer>): Promise<{ success: boolean; tank: WaterStorageContainer }> => {
    return request('/water-storage', { method: 'POST', body: JSON.stringify(data) });
  },
  updateWaterStorage: async (
    storageId: string,
    data: Partial<WaterStorageContainer>
  ): Promise<{ success: boolean; tank: WaterStorageContainer }> => {
    return request(`/water-storage/${storageId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  deleteWaterStorage: async (storageId: string): Promise<{ success: boolean; message: string }> => {
    return request(`/water-storage/${storageId}`, { method: 'DELETE' });
  },
  adjustWaterStorage: async (
    storageId: string,
    deltaLitres: number,
    actionType: 'consume' | 'refill'
  ): Promise<{ success: boolean; tank: WaterStorageContainer }> => {
    return request(`/water-storage/${storageId}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ deltaLitres, actionType }),
    });
  },

  // Household Expenses & Budget
  getExpenses: async (): Promise<{ success: boolean; expenses: HouseholdExpense[] }> => {
    return request('/expenses');
  },
  createExpense: async (data: Partial<HouseholdExpense>): Promise<{ success: boolean; expense: HouseholdExpense }> => {
    return request('/expenses', { method: 'POST', body: JSON.stringify(data) });
  },
  deleteExpense: async (expenseId: string): Promise<{ success: boolean; message: string }> => {
    return request(`/expenses/${expenseId}`, { method: 'DELETE' });
  },
  getBudget: async (): Promise<{ success: boolean; budget: HouseholdBudget }> => {
    return request('/budget');
  },
  updateBudget: async (data: Partial<HouseholdBudget>): Promise<{ success: boolean; budget: HouseholdBudget }> => {
    return request('/budget', { method: 'POST', body: JSON.stringify(data) });
  },

  // Vendors
  getVendors: async (params: {
    areaId?: string;
    deliveryOption?: string;
    verifiedOnly?: boolean;
    search?: string;
  } = {}): Promise<{ success: boolean; vendors: WaterVendor[] }> => {
    const searchParams = new URLSearchParams();
    if (params.areaId) searchParams.set('areaId', params.areaId);
    if (params.deliveryOption) searchParams.set('deliveryOption', params.deliveryOption);
    if (params.verifiedOnly) searchParams.set('verifiedOnly', 'true');
    if (params.search) searchParams.set('search', params.search);

    const query = searchParams.toString();
    return request(`/vendors${query ? `?${query}` : ''}`);
  },
  createVendor: async (data: any): Promise<{ success: boolean; vendor: WaterVendor }> => {
    return request('/vendors', { method: 'POST', body: JSON.stringify(data) });
  },
  updateVendor: async (vendorId: string, data: any): Promise<{ success: boolean; vendor: WaterVendor }> => {
    return request(`/vendors/${vendorId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  verifyVendor: async (vendorId: string, status: 'verified' | 'rejected'): Promise<{ success: boolean; vendor: WaterVendor }> => {
    return request(`/vendors/${vendorId}/verify`, { method: 'POST', body: JSON.stringify({ status }) });
  },

  // Buildings (Property Manager)
  getBuildings: async (): Promise<{ success: boolean; buildings: Building[] }> => {
    return request('/buildings');
  },
  createBuilding: async (data: any): Promise<{ success: boolean; building: Building }> => {
    return request('/buildings', { method: 'POST', body: JSON.stringify(data) });
  },
  getBuildingUpdates: async (): Promise<{ success: boolean; updates: BuildingWaterUpdate[] }> => {
    return request('/buildings/updates');
  },
  createBuildingUpdate: async (
    buildingId: string,
    data: any
  ): Promise<{ success: boolean; update: BuildingWaterUpdate }> => {
    return request(`/buildings/${buildingId}/updates`, { method: 'POST', body: JSON.stringify(data) });
  },

  // Reports
  getReports: async (): Promise<{ success: boolean; reports: IssueReport[] }> => {
    return request('/reports');
  },
  createReport: async (data: any): Promise<{ success: boolean; report: IssueReport }> => {
    return request('/reports', { method: 'POST', body: JSON.stringify(data) });
  },
  updateReport: async (reportId: string, data: any): Promise<{ success: boolean; report: IssueReport }> => {
    return request(`/reports/${reportId}`, { method: 'PATCH', body: JSON.stringify(data) });
  },

  // Subscriptions & SMS
  getSubscription: async (): Promise<{ success: boolean; subscription: SMSSubscription | null }> => {
    return request('/subscriptions');
  },
  saveSubscription: async (data: any): Promise<{ success: boolean; subscription: SMSSubscription }> => {
    return request('/subscriptions', { method: 'POST', body: JSON.stringify(data) });
  },
  unsubscribe: async (): Promise<{ success: boolean; message: string }> => {
    return request('/subscriptions/unsubscribe', { method: 'POST' });
  },
  getNotifications: async (): Promise<{ success: boolean; notifications: NotificationEvent[] }> => {
    return request('/notifications');
  },
  sendTestSMS: async (params: {
    rawPhoneNumber?: string;
    messageText?: string;
    targetArea?: string;
  }): Promise<{ success: boolean; dispatch: any; event: NotificationEvent }> => {
    return request('/sms/test-send', { method: 'POST', body: JSON.stringify(params) });
  },

  // Admin
  getAdminStats: async (): Promise<{ success: boolean; stats: any }> => {
    return request('/admin/stats');
  },
  getAuditLogs: async (): Promise<{ success: boolean; auditLogs: AuditLog[] }> => {
    return request('/admin/audit-logs');
  },
};
