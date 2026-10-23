import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { sendSMSAlert, formatNoticeSMS, maskPhoneNumber } from './server/smsAdapter.js';
import { NAIROBI_AREAS, getAreaNameById } from './src/data/nairobiAreas.js';
import {
  UserProfile,
  WaterNotice,
  WaterStorageContainer,
  HouseholdExpense,
  WaterVendor,
  Building,
  IssueReport,
  AuditLog,
} from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Session tracker for the active user in the demo environment
// Defaults to Resident Jane Muthoni, but can be seamlessly switched to any role via /api/auth/demo-switch
let currentSessionUser: UserProfile = db.users.get('user_resident_jane')!;

// Middleware: inject current user
function authMiddleware(req: Request, res: Response, next: Function) {
  // Check header or fallback to currentSessionUser
  const headerUid = req.headers['x-user-id'] as string;
  if (headerUid && db.users.has(headerUid)) {
    (req as any).user = db.users.get(headerUid);
  } else {
    (req as any).user = currentSessionUser;
  }
  next();
}

app.use(authMiddleware);

// Helper for audit logging
function logAudit(
  actor: UserProfile,
  action: string,
  entityType: 'notice' | 'organisation' | 'vendor' | 'report' | 'building' | 'sms' | 'user',
  entityId: string,
  summary: string
) {
  const audit: AuditLog = {
    logId: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    actorUid: actor.uid,
    actorName: actor.displayName,
    actorRole: actor.role,
    action,
    entityType,
    entityId,
    relevantChangeSummary: summary,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(audit);
}

// -------------------------------------------------------------
// AUTH & PROFILE ENDPOINTS
// -------------------------------------------------------------

app.get('/api/me', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  res.json({ success: true, user });
});

app.patch('/api/me', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const { displayName, phoneNumber, preferredAreaId, smsConsent } = req.body;

  if (displayName) user.displayName = displayName;
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
  if (preferredAreaId) {
    user.preferredAreaId = preferredAreaId;
    user.preferredAreaName = getAreaNameById(preferredAreaId);
  }
  if (smsConsent !== undefined) {
    user.smsConsent = Boolean(smsConsent);
    if (smsConsent) user.smsConsentAt = new Date().toISOString();
  }
  user.updatedAt = new Date().toISOString();

  db.users.set(user.uid, user);
  currentSessionUser = user;

  res.json({ success: true, user });
});

// Demo Role Switcher: fast evaluation of Resident, Org, Property Mgr, Vendor, Admin
app.post('/api/auth/demo-switch', (req: Request, res: Response) => {
  const { role, uid } = req.body;
  if (uid && db.users.has(uid)) {
    currentSessionUser = db.users.get(uid)!;
    return res.json({ success: true, user: currentSessionUser });
  }

  const roleMap: Record<string, string> = {
    resident: 'user_resident_jane',
    organisation: 'user_org_ncwsc',
    property_manager: 'user_pm_alice',
    vendor: 'user_vendor_peter',
    admin: 'user_admin_chief',
  };

  const targetUid = roleMap[role];
  if (targetUid && db.users.has(targetUid)) {
    currentSessionUser = db.users.get(targetUid)!;
    return res.json({ success: true, user: currentSessionUser });
  }

  res.status(400).json({ success: false, message: 'Invalid role or user ID' });
});

// Register new user
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { displayName, email, phoneNumber, role, preferredAreaId, organisationName, companyName, vendorBusinessName } =
    req.body;

  if (!displayName || !role) {
    return res.status(400).json({ success: false, message: 'Name and role are required' });
  }

  const newUid = `user_${Date.now()}`;
  const newUser: UserProfile = {
    uid: newUid,
    displayName,
    email: email || undefined,
    phoneNumber: phoneNumber || undefined,
    role: role || 'resident',
    accountStatus: role === 'organisation' ? 'pending_approval' : 'active',
    preferredAreaId: preferredAreaId || 'kilimani',
    preferredAreaName: getAreaNameById(preferredAreaId || 'kilimani'),
    smsConsent: Boolean(req.body.smsConsent),
    smsConsentAt: req.body.smsConsent ? new Date().toISOString() : undefined,
    organisationName: organisationName || undefined,
    companyName: companyName || undefined,
    vendorBusinessName: vendorBusinessName || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.set(newUid, newUser);
  currentSessionUser = newUser;

  logAudit(newUser, 'REGISTER_ACCOUNT', 'user', newUid, `Registered new account with role ${role}`);

  res.json({ success: true, user: newUser });
});

// -------------------------------------------------------------
// AREAS
// -------------------------------------------------------------
app.get('/api/areas', (_req: Request, res: Response) => {
  res.json({ success: true, areas: NAIROBI_AREAS });
});

// -------------------------------------------------------------
// WATER NOTICES
// -------------------------------------------------------------
app.get('/api/notices', (req: Request, res: Response) => {
  const { areaId, noticeType, verificationStatus, status, search } = req.query;

  let list = Array.from(db.notices.values());

  if (areaId && areaId !== 'all') {
    list = list.filter((n) => n.affectedAreaIds.includes(String(areaId)));
  }

  if (noticeType && noticeType !== 'all') {
    list = list.filter((n) => n.noticeType === noticeType);
  }

  if (verificationStatus && verificationStatus !== 'all') {
    list = list.filter((n) => n.verificationStatus === verificationStatus);
  }

  if (status && status !== 'all') {
    list = list.filter((n) => n.publicationStatus === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.sourceOrganisationName.toLowerCase().includes(q) ||
        n.affectedAreaNames.some((a) => a.toLowerCase().includes(q))
    );
  }

  // Sort: most recent first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, notices: list });
});

app.get('/api/notices/:noticeId', (req: Request, res: Response) => {
  const notice = db.notices.get(req.params.noticeId);
  if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
  res.json({ success: true, notice });
});

// Create notice (Organisation, Property Manager, Admin)
app.post('/api/notices', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  if (!['organisation', 'property_manager', 'admin'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Only authorized accounts can draft notices' });
  }

  const {
    title,
    description,
    noticeType,
    affectedAreaIds,
    plannedStartAt,
    expectedRestorationAt,
    sourceReference,
    internalNotes,
    autoPublish,
  } = req.body;

  if (!title || !description || !affectedAreaIds || affectedAreaIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Missing required notice fields' });
  }

  const noticeId = `notice_${Date.now()}`;
  const areaNames = affectedAreaIds.map((id: string) => getAreaNameById(id));

  let sourceType: any = 'official_utility';
  let verificationStatus: any = 'official_source';
  if (user.role === 'property_manager') {
    sourceType = 'property_manager';
    verificationStatus = 'organisation_verified';
  } else if (user.role === 'admin') {
    sourceType = 'admin_reviewed';
    verificationStatus = 'organisation_verified';
  }

  const newNotice: WaterNotice = {
    noticeId,
    title,
    description,
    noticeType: noticeType || 'planned_interruption',
    affectedAreaIds,
    affectedAreaNames: areaNames,
    sourceType,
    sourceOrganisationId: user.organisationName ? 'org_user' : undefined,
    sourceOrganisationName: user.organisationName || user.companyName || user.displayName,
    sourceReference: sourceReference || undefined,
    createdBy: user.uid,
    createdByName: user.displayName,
    verificationStatus,
    publicationStatus: autoPublish ? 'published' : 'draft',
    plannedStartAt: plannedStartAt || undefined,
    expectedRestorationAt: expectedRestorationAt || undefined,
    internalNotes: internalNotes || undefined,
    createdAt: new Date().toISOString(),
    publishedAt: autoPublish ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
    history: [
      {
        historyId: `hist_${Date.now()}`,
        noticeId,
        actorUid: user.uid,
        actorName: user.displayName,
        action: autoPublish ? 'published' : 'created',
        notes: autoPublish ? 'Created and published immediately' : 'Draft created',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  db.notices.set(noticeId, newNotice);
  logAudit(user, autoPublish ? 'PUBLISH_NOTICE' : 'CREATE_NOTICE', 'notice', noticeId, `Created notice: ${title}`);

  // If auto-published, trigger SMS dispatch
  if (autoPublish) {
    triggerSMSForNotice(newNotice, user);
  }

  res.json({ success: true, notice: newNotice });
});

// Publish notice & dispatch SMS
app.post('/api/notices/:noticeId/publish', async (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const notice = db.notices.get(req.params.noticeId);
  if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });

  notice.publicationStatus = 'published';
  notice.publishedAt = new Date().toISOString();
  notice.updatedAt = new Date().toISOString();
  notice.history.push({
    historyId: `hist_${Date.now()}`,
    noticeId: notice.noticeId,
    actorUid: user.uid,
    actorName: user.displayName,
    action: 'published',
    notes: 'Published to public board and queued for SMS subscriber alerts',
    timestamp: new Date().toISOString(),
  });

  db.notices.set(notice.noticeId, notice);
  logAudit(user, 'PUBLISH_NOTICE', 'notice', notice.noticeId, `Published notice ${notice.title}`);

  // Trigger SMS Broadcast
  const dispatchResults = await triggerSMSForNotice(notice, user);

  res.json({ success: true, notice, dispatchResults });
});

// Mark notice resolved
app.post('/api/notices/:noticeId/resolve', async (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const notice = db.notices.get(req.params.noticeId);
  if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });

  notice.publicationStatus = 'resolved';
  notice.verificationStatus = 'resolved';
  notice.resolvedAt = new Date().toISOString();
  notice.updatedAt = new Date().toISOString();
  notice.history.push({
    historyId: `hist_${Date.now()}`,
    noticeId: notice.noticeId,
    actorUid: user.uid,
    actorName: user.displayName,
    action: 'resolved',
    notes: req.body.notes || 'Issue or maintenance marked as resolved. Normal supply restored.',
    timestamp: new Date().toISOString(),
  });

  db.notices.set(notice.noticeId, notice);
  logAudit(user, 'RESOLVE_NOTICE', 'notice', notice.noticeId, `Resolved notice ${notice.title}`);

  // Dispatch restoration update SMS if requested
  let restorationSMSCount = 0;
  if (req.body.notifySubscribers) {
    const results = await triggerSMSForNotice(
      {
        ...notice,
        title: `Supply Restored: ${notice.title}`,
        noticeType: 'restoration_update',
      },
      user
    );
    restorationSMSCount = results.length;
  }

  res.json({ success: true, notice, restorationSMSCount });
});

// Helper to trigger SMS for subscribers matching notice affected areas
async function triggerSMSForNotice(notice: WaterNotice, actor: UserProfile) {
  const subscribers = Array.from(db.subscriptions.values()).filter(
    (sub) =>
      sub.consentStatus &&
      !sub.isPaused &&
      sub.areaIds.some((aid) => notice.affectedAreaIds.includes(aid))
  );

  const formattedMsg = formatNoticeSMS({
    noticeTypeTitle: notice.title,
    areaNames: notice.affectedAreaNames,
    plannedStartAt: notice.plannedStartAt,
    expectedRestorationAt: notice.expectedRestorationAt,
    sourceOrganisationName: notice.sourceOrganisationName,
    isReportOnly: notice.sourceType === 'community_reported',
  });

  const results = [];
  for (const sub of subscribers) {
    const dispatch = await sendSMSAlert({
      rawPhoneNumber: sub.rawPhoneNumber,
      messageText: formattedMsg,
      noticeId: notice.noticeId,
      recipientUid: sub.userId,
      recipientArea: sub.areaNames[0] || 'Nairobi',
      statusType: notice.publicationStatus,
    });

    // Record notification event
    const event: any = {
      notificationId: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      noticeId: notice.noticeId,
      noticeTitle: notice.title,
      recipientReference: dispatch.recipientReference,
      recipientUid: sub.userId,
      recipientArea: sub.areaNames.join(', '),
      channel: 'sms',
      provider: dispatch.provider,
      messageText: dispatch.messageText,
      status: dispatch.status,
      providerMessageId: dispatch.providerMessageId,
      errorCategory: dispatch.error,
      retryCount: 0,
      createdAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      deliveredAt: dispatch.status.startsWith('delivered') ? new Date().toISOString() : undefined,
    };

    db.notificationEvents.unshift(event);
    results.push(dispatch);
  }

  return results;
}

// -------------------------------------------------------------
// WATER STORAGE (Household Tanks & Reserves)
// -------------------------------------------------------------
app.get('/api/water-storage', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const tanks = Array.from(db.waterStorage.values()).filter((s) => s.userId === user.uid);
  res.json({ success: true, tanks });
});

app.post('/api/water-storage', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const { name, storageType, capacityLitres, currentAmountLitres, notes } = req.body;

  if (!name || !capacityLitres || capacityLitres <= 0) {
    return res.status(400).json({ success: false, message: 'Valid container name and positive capacity required' });
  }

  const current = Math.min(Math.max(0, Number(currentAmountLitres) || 0), Number(capacityLitres));

  const storageId = `tank_${Date.now()}`;
  const newTank: WaterStorageContainer = {
    storageId,
    userId: user.uid,
    name,
    storageType: storageType || 'overhead_poly_tank',
    capacityLitres: Number(capacityLitres),
    currentAmountLitres: current,
    notes: notes || undefined,
    lastUpdatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.waterStorage.set(storageId, newTank);
  res.json({ success: true, tank: newTank });
});

app.patch('/api/water-storage/:storageId', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const tank = db.waterStorage.get(req.params.storageId);
  if (!tank || tank.userId !== user.uid) {
    return res.status(404).json({ success: false, message: 'Container not found or unauthorized' });
  }

  const { name, storageType, capacityLitres, currentAmountLitres, notes } = req.body;
  if (name) tank.name = name;
  if (storageType) tank.storageType = storageType;
  if (capacityLitres) tank.capacityLitres = Number(capacityLitres);
  if (currentAmountLitres !== undefined) {
    tank.currentAmountLitres = Math.min(Math.max(0, Number(currentAmountLitres)), tank.capacityLitres);
  }
  if (notes !== undefined) tank.notes = notes;
  tank.lastUpdatedAt = new Date().toISOString();

  db.waterStorage.set(tank.storageId, tank);
  res.json({ success: true, tank });
});

app.delete('/api/water-storage/:storageId', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const tank = db.waterStorage.get(req.params.storageId);
  if (!tank || tank.userId !== user.uid) {
    return res.status(404).json({ success: false, message: 'Container not found or unauthorized' });
  }

  db.waterStorage.delete(tank.storageId);
  res.json({ success: true, message: 'Tank record deleted' });
});

// Quick refill/consumption logger
app.post('/api/water-storage/:storageId/adjust', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const tank = db.waterStorage.get(req.params.storageId);
  if (!tank || tank.userId !== user.uid) {
    return res.status(404).json({ success: false, message: 'Container not found or unauthorized' });
  }

  const { deltaLitres, actionType } = req.body;
  const delta = Number(deltaLitres) || 0;

  if (actionType === 'consume') {
    tank.currentAmountLitres = Math.max(0, tank.currentAmountLitres - delta);
  } else if (actionType === 'refill') {
    tank.currentAmountLitres = Math.min(tank.capacityLitres, tank.currentAmountLitres + delta);
  }
  tank.lastUpdatedAt = new Date().toISOString();

  db.waterStorage.set(tank.storageId, tank);
  res.json({ success: true, tank });
});

// -------------------------------------------------------------
// HOUSEHOLD EXPENSES & BUDGET
// -------------------------------------------------------------
app.get('/api/expenses', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const list = Array.from(db.expenses.values())
    .filter((e) => e.userId === user.uid)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  res.json({ success: true, expenses: list });
});

app.post('/api/expenses', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const { category, amountKes, date, quantityLitres, supplierName, notes } = req.body;

  if (!category || !amountKes || amountKes <= 0) {
    return res.status(400).json({ success: false, message: 'Valid expense category and positive amount in KES required' });
  }

  const expenseId = `exp_${Date.now()}`;
  const newExp: HouseholdExpense = {
    expenseId,
    userId: user.uid,
    category,
    amountKes: Number(amountKes),
    date: date || new Date().toISOString().split('T')[0],
    quantityLitres: quantityLitres ? Number(quantityLitres) : undefined,
    supplierName: supplierName || undefined,
    notes: notes || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.expenses.set(expenseId, newExp);
  res.json({ success: true, expense: newExp });
});

app.delete('/api/expenses/:expenseId', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const exp = db.expenses.get(req.params.expenseId);
  if (!exp || exp.userId !== user.uid) {
    return res.status(404).json({ success: false, message: 'Expense record not found or unauthorized' });
  }
  db.expenses.delete(exp.expenseId);
  res.json({ success: true, message: 'Expense deleted' });
});

app.get('/api/budget', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  let budget = db.budgets.get(user.uid);
  if (!budget) {
    budget = {
      budgetId: `bgt_${user.uid}`,
      userId: user.uid,
      month: new Date().toISOString().slice(0, 7),
      amountKes: 5000,
      estimatedDailyConsumptionLitres: 200,
      householdMembersCount: 3,
      updatedAt: new Date().toISOString(),
    };
    db.budgets.set(user.uid, budget);
  }
  res.json({ success: true, budget });
});

app.post('/api/budget', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const { amountKes, estimatedDailyConsumptionLitres, householdMembersCount } = req.body;

  const budget = db.budgets.get(user.uid) || {
    budgetId: `bgt_${user.uid}`,
    userId: user.uid,
    month: new Date().toISOString().slice(0, 7),
    amountKes: 5000,
    estimatedDailyConsumptionLitres: 200,
    householdMembersCount: 3,
    updatedAt: new Date().toISOString(),
  };

  if (amountKes !== undefined) budget.amountKes = Number(amountKes);
  if (estimatedDailyConsumptionLitres !== undefined) {
    budget.estimatedDailyConsumptionLitres = Number(estimatedDailyConsumptionLitres);
  }
  if (householdMembersCount !== undefined) {
    budget.householdMembersCount = Number(householdMembersCount);
  }
  budget.updatedAt = new Date().toISOString();

  db.budgets.set(user.uid, budget);
  res.json({ success: true, budget });
});

// -------------------------------------------------------------
// WATER VENDOR DIRECTORY
// -------------------------------------------------------------
app.get('/api/vendors', (req: Request, res: Response) => {
  const { areaId, deliveryOption, verifiedOnly, search } = req.query;

  let list = Array.from(db.vendors.values());

  if (verifiedOnly === 'true') {
    list = list.filter((v) => v.verificationStatus === 'verified');
  }

  if (areaId && areaId !== 'all') {
    list = list.filter((v) => v.serviceAreaIds.includes(String(areaId)));
  }

  if (deliveryOption && deliveryOption !== 'all') {
    list = list.filter((v) => v.deliveryOptions.includes(deliveryOption as any));
  }

  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (v) =>
        v.businessName.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.serviceAreaNames.some((a) => a.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, vendors: list });
});

app.post('/api/vendors', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const {
    businessName,
    contactPerson,
    contactPhoneNumber,
    serviceAreaIds,
    deliveryOptions,
    indicativePrice,
    pricingUnit,
    minimumOrder,
    description,
    operatingHours,
    waterSource,
  } = req.body;

  if (!businessName || !contactPhoneNumber || !serviceAreaIds) {
    return res.status(400).json({ success: false, message: 'Business name, contact and service areas required' });
  }

  const vendorId = `vdr_${Date.now()}`;
  const areaNames = (serviceAreaIds || []).map((id: string) => getAreaNameById(id));

  const newVendor: WaterVendor = {
    vendorId,
    businessName,
    contactPerson: contactPerson || user.displayName,
    contactPhoneNumber,
    serviceAreaIds,
    serviceAreaNames: areaNames,
    deliveryOptions: deliveryOptions || ['tanker_bowser'],
    indicativePrice: Number(indicativePrice) || 1.2,
    pricingUnit: pricingUnit || 'per_litre',
    minimumOrder: minimumOrder || undefined,
    availabilityStatus: 'available_now',
    lastAvailabilityUpdateAt: new Date().toISOString(),
    verificationStatus: user.role === 'admin' ? 'verified' : 'pending_review',
    description: description || 'Licensed water supplier in Nairobi',
    operatingHours: operatingHours || '7:00 AM - 7:00 PM',
    waterSource: waterSource || 'Borehole / Spring',
    createdBy: user.uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.vendors.set(vendorId, newVendor);
  logAudit(user, 'REGISTER_VENDOR', 'vendor', vendorId, `Created vendor profile: ${businessName}`);

  res.json({ success: true, vendor: newVendor });
});

// Update vendor availability or pricing
app.patch('/api/vendors/:vendorId', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const vendor = db.vendors.get(req.params.vendorId);
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

  if (vendor.createdBy !== user.uid && user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Unauthorized to edit this vendor listing' });
  }

  const { availabilityStatus, indicativePrice, pricingUnit, serviceAreaIds, operatingHours, description } = req.body;

  if (availabilityStatus) {
    vendor.availabilityStatus = availabilityStatus;
    vendor.lastAvailabilityUpdateAt = new Date().toISOString();
  }
  if (indicativePrice !== undefined) vendor.indicativePrice = Number(indicativePrice);
  if (pricingUnit) vendor.pricingUnit = pricingUnit;
  if (operatingHours) vendor.operatingHours = operatingHours;
  if (description) vendor.description = description;
  if (serviceAreaIds) {
    vendor.serviceAreaIds = serviceAreaIds;
    vendor.serviceAreaNames = serviceAreaIds.map((id: string) => getAreaNameById(id));
  }
  vendor.updatedAt = new Date().toISOString();

  db.vendors.set(vendor.vendorId, vendor);
  res.json({ success: true, vendor });
});

// Admin verify/reject vendor
app.post('/api/vendors/:vendorId/verify', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });

  const vendor = db.vendors.get(req.params.vendorId);
  if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });

  const status = req.body.status || 'verified';
  vendor.verificationStatus = status;
  vendor.updatedAt = new Date().toISOString();

  db.vendors.set(vendor.vendorId, vendor);
  logAudit(user, 'VERIFY_VENDOR', 'vendor', vendor.vendorId, `Updated verification status to: ${status}`);

  res.json({ success: true, vendor });
});

// -------------------------------------------------------------
// BUILDINGS (Property Managers)
// -------------------------------------------------------------
app.get('/api/buildings', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  let list = Array.from(db.buildings.values());
  if (user.role === 'property_manager') {
    list = list.filter((b) => b.managerUid === user.uid);
  }
  res.json({ success: true, buildings: list });
});

app.post('/api/buildings', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  if (user.role !== 'property_manager' && user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only property managers can register buildings' });
  }

  const { name, generalLocation, serviceAreaId, residentialUnitsCount, tankCapacityLitres, currentTankLevelLitres, notes } =
    req.body;

  const buildingId = `bld_${Date.now()}`;
  const newBuilding: Building = {
    buildingId,
    managerUid: user.uid,
    managerName: user.displayName,
    name,
    generalLocation,
    serviceAreaId,
    serviceAreaName: getAreaNameById(serviceAreaId),
    residentialUnitsCount: Number(residentialUnitsCount) || 1,
    tankCapacityLitres: Number(tankCapacityLitres) || 10000,
    currentTankLevelLitres: Number(currentTankLevelLitres) || 8000,
    notes: notes || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.buildings.set(buildingId, newBuilding);
  logAudit(user, 'REGISTER_BUILDING', 'building', buildingId, `Registered property: ${name}`);

  res.json({ success: true, building: newBuilding });
});

app.get('/api/buildings/updates', (_req: Request, res: Response) => {
  const updates = Array.from(db.buildingUpdates.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json({ success: true, updates });
});

app.post('/api/buildings/:buildingId/updates', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const building = db.buildings.get(req.params.buildingId);
  if (!building) return res.status(404).json({ success: false, message: 'Building not found' });

  const { title, description, updateType } = req.body;
  const updateId = `upd_${Date.now()}`;

  const update = {
    updateId,
    buildingId: building.buildingId,
    buildingName: building.name,
    managerUid: user.uid,
    title,
    description,
    updateType: updateType || 'rationing_schedule',
    status: 'active' as const,
    createdAt: new Date().toISOString(),
  };

  db.buildingUpdates.set(updateId, update);
  logAudit(user, 'BUILDING_WATER_NOTICE', 'building', building.buildingId, `Posted tenant alert: ${title}`);

  res.json({ success: true, update });
});

// -------------------------------------------------------------
// COMMUNITY ISSUE REPORTS
// -------------------------------------------------------------
app.get('/api/reports', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  let list = Array.from(db.issueReports.values());

  // Residents see their own plus resolved community reports; admins/orgs see all
  if (user.role === 'resident') {
    list = list.filter((r) => r.reporterUid === user.uid || r.areaId === user.preferredAreaId);
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json({ success: true, reports: list });
});

app.post('/api/reports', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const { category, areaId, landmarkLocation, description, observedAt } = req.body;

  if (!category || !areaId || !description) {
    return res.status(400).json({ success: false, message: 'Category, area, and description are required' });
  }

  const reportId = `rep_${Date.now()}`;
  const newReport: IssueReport = {
    reportId,
    reporterUid: user.uid,
    reporterName: user.displayName,
    category,
    areaId,
    areaName: getAreaNameById(areaId),
    landmarkLocation: landmarkLocation || '',
    description,
    observedAt: observedAt || new Date().toISOString(),
    status: 'submitted',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.issueReports.set(reportId, newReport);
  logAudit(user, 'SUBMIT_ISSUE_REPORT', 'report', reportId, `Reported ${category} in ${newReport.areaName}`);

  res.json({ success: true, report: newReport });
});

app.patch('/api/reports/:reportId', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  if (!['admin', 'organisation'].includes(user.role)) {
    return res.status(403).json({ success: false, message: 'Only moderators or utilities can update report status' });
  }

  const report = db.issueReports.get(req.params.reportId);
  if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

  const { status, resolutionNotes, assignedOrganisationName } = req.body;
  if (status) report.status = status;
  if (resolutionNotes) report.resolutionNotes = resolutionNotes;
  if (assignedOrganisationName) report.assignedOrganisationName = assignedOrganisationName;
  report.updatedAt = new Date().toISOString();

  db.issueReports.set(report.reportId, report);
  logAudit(user, 'UPDATE_REPORT_STATUS', 'report', report.reportId, `Status changed to ${status}`);

  res.json({ success: true, report });
});

// -------------------------------------------------------------
// SMS SUBSCRIPTIONS & NOTIFICATIONS
// -------------------------------------------------------------
app.get('/api/subscriptions', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const sub = db.subscriptions.get(user.uid);
  res.json({ success: true, subscription: sub || null });
});

app.post('/api/subscriptions', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const { rawPhoneNumber, areaIds, alertCategories, consentStatus, isPaused } = req.body;

  if (!rawPhoneNumber || !areaIds || areaIds.length === 0) {
    return res.status(400).json({ success: false, message: 'Phone number and at least one Nairobi area required' });
  }

  const areaNames = areaIds.map((id: string) => getAreaNameById(id));
  const subId = `sub_${user.uid}`;

  const sub = {
    subscriptionId: subId,
    userId: user.uid,
    maskedPhoneNumber: maskPhoneNumber(rawPhoneNumber),
    rawPhoneNumber,
    areaIds,
    areaNames,
    alertCategories: alertCategories || ['planned_interruptions', 'unexpected_outages', 'restoration_alerts'],
    consentStatus: consentStatus !== false,
    isPaused: Boolean(isPaused),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.subscriptions.set(user.uid, sub);
  logAudit(user, 'UPDATE_SMS_SUBSCRIPTION', 'sms', subId, `Subscribed phone ${sub.maskedPhoneNumber} to ${areaNames.join(', ')}`);

  res.json({ success: true, subscription: sub });
});

app.post('/api/subscriptions/unsubscribe', (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const sub = db.subscriptions.get(user.uid);
  if (sub) {
    sub.consentStatus = false;
    sub.isPaused = true;
    sub.updatedAt = new Date().toISOString();
    db.subscriptions.set(user.uid, sub);
  }
  res.json({ success: true, message: 'Unsubscribed from SMS alerts' });
});

app.get('/api/notifications', (_req: Request, res: Response) => {
  res.json({ success: true, notifications: db.notificationEvents });
});

// Test SMS dispatch tool for residents & admins to preview real/simulated SMS behavior
app.post('/api/sms/test-send', async (req: Request, res: Response) => {
  const user = (req as any).user as UserProfile;
  const { rawPhoneNumber, messageText, targetArea } = req.body;

  const phone = rawPhoneNumber || user.phoneNumber || '+254712345678';
  const text = messageText || 'MAJIWATCH TEST: Water supply normal across Kilimani. Dial *384*254# for menu. MajiWatch Demo.';

  const dispatch = await sendSMSAlert({
    rawPhoneNumber: phone,
    messageText: text,
    noticeId: `test_${Date.now()}`,
    recipientUid: user.uid,
    recipientArea: targetArea || 'Nairobi Demo',
    statusType: 'test_alert',
  });

  const event: any = {
    notificationId: `notif_${Date.now()}`,
    noticeTitle: 'Test SMS Verification Alert',
    recipientReference: dispatch.recipientReference,
    recipientUid: user.uid,
    recipientArea: targetArea || 'Nairobi Demo',
    channel: 'sms',
    provider: dispatch.provider,
    messageText: text,
    status: dispatch.status,
    providerMessageId: dispatch.providerMessageId,
    retryCount: 0,
    createdAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    deliveredAt: dispatch.status.startsWith('delivered') ? new Date().toISOString() : undefined,
  };

  db.notificationEvents.unshift(event);
  logAudit(user, 'TEST_SMS_SENT', 'sms', event.notificationId, `Dispatched test SMS to ${dispatch.recipientReference}`);

  res.json({ success: true, dispatch, event });
});

// -------------------------------------------------------------
// ADMIN METRICS & AUDIT
// -------------------------------------------------------------
app.get('/api/admin/stats', (req: Request, res: Response) => {
  const totalUsers = db.users.size;
  const orgUsers = Array.from(db.users.values()).filter((u) => u.role === 'organisation').length;
  const noticesCount = db.notices.size;
  const activeNotices = Array.from(db.notices.values()).filter((n) => n.publicationStatus === 'published').length;
  const openReports = Array.from(db.issueReports.values()).filter(
    (r) => !['resolved', 'rejected'].includes(r.status)
  ).length;
  const totalVendors = db.vendors.size;
  const verifiedVendors = Array.from(db.vendors.values()).filter((v) => v.verificationStatus === 'verified').length;
  const totalNotifications = db.notificationEvents.length;

  res.json({
    success: true,
    stats: {
      totalUsers,
      orgUsers,
      noticesCount,
      activeNotices,
      openReports,
      totalVendors,
      verifiedVendors,
      totalNotifications,
    },
  });
});

app.get('/api/admin/audit-logs', (_req: Request, res: Response) => {
  res.json({ success: true, auditLogs: db.auditLogs });
});

// -------------------------------------------------------------
// VITE DEV SERVER OR STATIC PRODUCTION SERVING
// -------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MajiWatch] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
