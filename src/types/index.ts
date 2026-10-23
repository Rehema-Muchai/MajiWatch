export type UserRole = 'resident' | 'organisation' | 'property_manager' | 'vendor' | 'admin';

export type AccountStatus = 'active' | 'pending_approval' | 'suspended' | 'rejected';

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  preferredAreaId?: string;
  preferredAreaName?: string;
  smsConsent: boolean;
  smsConsentAt?: string;
  organisationName?: string;
  organisationType?: 'utility' | 'community_water_project' | 'county_agency';
  companyName?: string;
  vendorBusinessName?: string;
  createdAt: string;
  updatedAt: string;
}

export type NoticeType =
  | 'planned_interruption'
  | 'unexpected_interruption'
  | 'supply_schedule_update'
  | 'restoration_update'
  | 'maintenance_notice'
  | 'water_quality_advisory'
  | 'general_announcement';

export type SourceType =
  | 'official_utility'
  | 'approved_organisation'
  | 'property_manager'
  | 'vendor_reported'
  | 'community_reported'
  | 'admin_reviewed';

export type VerificationStatus =
  | 'official_source'
  | 'organisation_verified'
  | 'under_review'
  | 'community_reported'
  | 'unverified'
  | 'outdated'
  | 'resolved';

export type NoticePublicationStatus = 'draft' | 'published' | 'updated' | 'resolved' | 'cancelled';

export interface NoticeHistoryEntry {
  historyId: string;
  noticeId: string;
  actorUid: string;
  actorName: string;
  action: 'created' | 'published' | 'updated' | 'resolved' | 'cancelled';
  notes?: string;
  timestamp: string;
}

export interface WaterNotice {
  noticeId: string;
  title: string;
  description: string;
  noticeType: NoticeType;
  affectedAreaIds: string[];
  affectedAreaNames: string[];
  sourceType: SourceType;
  sourceOrganisationId?: string;
  sourceOrganisationName: string;
  sourceReference?: string;
  createdBy: string;
  createdByName: string;
  verificationStatus: VerificationStatus;
  publicationStatus: NoticePublicationStatus;
  plannedStartAt?: string;
  expectedRestorationAt?: string;
  internalNotes?: string;
  createdAt: string;
  publishedAt?: string;
  updatedAt: string;
  resolvedAt?: string;
  history: NoticeHistoryEntry[];
}

export type StorageType = 'overhead_poly_tank' | 'underground_sump' | 'rooftop_steel' | 'drum' | 'jerrycans';

export interface WaterStorageContainer {
  storageId: string;
  userId: string;
  name: string;
  storageType: StorageType;
  capacityLitres: number;
  currentAmountLitres: number;
  notes?: string;
  lastUpdatedAt: string;
  createdAt: string;
}

export interface WaterUsageLog {
  usageId: string;
  userId: string;
  date: string;
  quantityLitres: number;
  usageType: 'consumed' | 'refilled' | 'leak_adjustment';
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'utility_water_bill'
  | 'vendor_water_purchase'
  | 'water_bowser_delivery'
  | 'tank_cleaning_maintenance'
  | 'filtration_purification'
  | 'other';

export interface HouseholdExpense {
  expenseId: string;
  userId: string;
  category: ExpenseCategory;
  amountKes: number;
  date: string;
  quantityLitres?: number;
  supplierName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdBudget {
  budgetId: string;
  userId: string;
  month: string; // YYYY-MM
  amountKes: number;
  estimatedDailyConsumptionLitres: number;
  householdMembersCount: number;
  updatedAt: string;
}

export interface WaterVendor {
  vendorId: string;
  businessName: string;
  contactPerson: string;
  contactPhoneNumber: string;
  serviceAreaIds: string[];
  serviceAreaNames: string[];
  deliveryOptions: ('tanker_bowser' | '20l_refill' | 'jerrycan_cart' | 'bulk_piped')[];
  indicativePrice: number;
  pricingUnit: 'per_litre' | 'per_20l_container' | 'per_5000l_tanker' | 'per_10000l_tanker';
  minimumOrder?: string;
  availabilityStatus: 'available_now' | 'limited_supply' | 'temporarily_closed';
  lastAvailabilityUpdateAt: string;
  verificationStatus: 'verified' | 'pending_review' | 'rejected';
  description: string;
  operatingHours?: string;
  waterSource?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Building {
  buildingId: string;
  managerUid: string;
  managerName: string;
  name: string;
  generalLocation: string;
  serviceAreaId: string;
  serviceAreaName: string;
  residentialUnitsCount: number;
  tankCapacityLitres: number;
  currentTankLevelLitres: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuildingWaterUpdate {
  updateId: string;
  buildingId: string;
  buildingName: string;
  managerUid: string;
  title: string;
  description: string;
  updateType: 'rationing_schedule' | 'bowser_refill' | 'pump_maintenance' | 'low_reserve_warning' | 'normal_supply';
  status: 'active' | 'resolved';
  createdAt: string;
}

export type IssueCategory =
  | 'unexpected_interruption'
  | 'supply_has_not_returned'
  | 'schedule_differs'
  | 'suspected_leak_wastage'
  | 'water_quality_concern'
  | 'low_pressure'
  | 'other';

export type IssueReportStatus =
  | 'submitted'
  | 'under_review'
  | 'confirmed'
  | 'referred_to_utility'
  | 'resolved'
  | 'rejected';

export interface IssueReport {
  reportId: string;
  reporterUid: string;
  reporterName: string;
  category: IssueCategory;
  areaId: string;
  areaName: string;
  landmarkLocation: string;
  description: string;
  observedAt: string;
  status: IssueReportStatus;
  assignedOrganisationId?: string;
  assignedOrganisationName?: string;
  resolutionNotes?: string;
  relatedNoticeId?: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertCategory =
  | 'planned_interruptions'
  | 'unexpected_outages'
  | 'restoration_alerts'
  | 'schedule_changes'
  | 'building_updates';

export interface SMSSubscription {
  subscriptionId: string;
  userId: string;
  maskedPhoneNumber: string;
  rawPhoneNumber: string;
  areaIds: string[];
  areaNames: string[];
  alertCategories: AlertCategory[];
  consentStatus: boolean;
  isPaused: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NotificationStatus = 'delivered' | 'delivered_simulated' | 'queued' | 'failed' | 'deduplicated';

export interface NotificationEvent {
  notificationId: string;
  noticeId?: string;
  noticeTitle?: string;
  recipientReference: string; // e.g. masked phone "+254 7** *** 678"
  recipientUid: string;
  recipientArea: string;
  channel: 'sms';
  provider: 'africas_talking' | 'twilio' | 'simulation_mode';
  messageText: string;
  status: NotificationStatus;
  providerMessageId?: string;
  errorCategory?: string;
  retryCount: number;
  createdAt: string;
  sentAt?: string;
  deliveredAt?: string;
}

export interface AuditLog {
  logId: string;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'notice' | 'organisation' | 'vendor' | 'report' | 'building' | 'sms' | 'user';
  entityId: string;
  relevantChangeSummary: string;
  timestamp: string;
}

export interface NairobiArea {
  id: string;
  name: string;
  subCounty: string;
  zone: 'North' | 'South' | 'East' | 'West' | 'Central';
  estimatedPopulationEstimate?: string;
}
