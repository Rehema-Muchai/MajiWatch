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
} from '../src/types';

// In-memory persistent database store initialized with realistic Nairobi data
class DatabaseStore {
  public users: Map<string, UserProfile> = new Map();
  public notices: Map<string, WaterNotice> = new Map();
  public waterStorage: Map<string, WaterStorageContainer> = new Map();
  public expenses: Map<string, HouseholdExpense> = new Map();
  public budgets: Map<string, HouseholdBudget> = new Map();
  public vendors: Map<string, WaterVendor> = new Map();
  public buildings: Map<string, Building> = new Map();
  public buildingUpdates: Map<string, BuildingWaterUpdate> = new Map();
  public issueReports: Map<string, IssueReport> = new Map();
  public subscriptions: Map<string, SMSSubscription> = new Map();
  public notificationEvents: NotificationEvent[] = [];
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Predefined Demo Users
    const demoUsers: UserProfile[] = [
      {
        uid: 'user_resident_jane',
        displayName: 'Jane Muthoni',
        email: 'jane.muthoni@example.com',
        phoneNumber: '+254712345678',
        role: 'resident',
        accountStatus: 'active',
        preferredAreaId: 'kilimani',
        preferredAreaName: 'Kilimani',
        smsConsent: true,
        smsConsentAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        uid: 'user_org_ncwsc',
        displayName: 'Eng. David Mwangi',
        email: 'dmwangi@nairobiwater.co.ke',
        phoneNumber: '+254722000111',
        role: 'organisation',
        accountStatus: 'active',
        organisationName: 'Nairobi City Water & Sewerage Co. (NCWSC)',
        organisationType: 'utility',
        preferredAreaId: 'cbd',
        preferredAreaName: 'Nairobi Central Business District',
        smsConsent: true,
        createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        uid: 'user_pm_alice',
        displayName: 'Alice Wanjiku',
        email: 'alice@greenstonepm.co.ke',
        phoneNumber: '+254733444555',
        role: 'property_manager',
        accountStatus: 'active',
        companyName: 'Greenstone Property Management',
        preferredAreaId: 'kilimani',
        preferredAreaName: 'Kilimani',
        smsConsent: true,
        createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        uid: 'user_vendor_peter',
        displayName: 'Peter Ochieng',
        email: 'peter@majisafibowsers.co.ke',
        phoneNumber: '+254701999888',
        role: 'vendor',
        accountStatus: 'active',
        vendorBusinessName: 'Maji Safi Clean Bowsers Ltd',
        preferredAreaId: 'westlands',
        preferredAreaName: 'Westlands',
        smsConsent: true,
        createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        uid: 'user_admin_chief',
        displayName: 'MajiWatch Administrator',
        email: 'admin@majiwatch.or.ke',
        phoneNumber: '+254720000000',
        role: 'admin',
        accountStatus: 'active',
        smsConsent: true,
        createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    demoUsers.forEach((u) => this.users.set(u.uid, u));

    // 2. Predefined Water Notices
    const now = Date.now();
    const demoNotices: WaterNotice[] = [
      {
        noticeId: 'notice_ncwsc_01',
        title: 'Sasumua Transmission Main Repair - Supply Interruption',
        description:
          'Planned maintenance on the Sasumua transmission line supplying Western Nairobi. Water supply will be temporarily shut off to facilitate high-pressure valve replacement.',
        noticeType: 'planned_interruption',
        affectedAreaIds: ['kilimani', 'kileleshwa', 'lavington', 'westlands'],
        affectedAreaNames: ['Kilimani', 'Kileleshwa', 'Lavington', 'Westlands'],
        sourceType: 'official_utility',
        sourceOrganisationId: 'org_ncwsc',
        sourceOrganisationName: 'Nairobi City Water & Sewerage Co. (NCWSC)',
        sourceReference: 'NCWSC/OPS/2026/MNT-041',
        createdBy: 'user_org_ncwsc',
        createdByName: 'Eng. David Mwangi (NCWSC)',
        verificationStatus: 'official_source',
        publicationStatus: 'published',
        plannedStartAt: new Date(now - 12 * 3600000).toISOString(),
        expectedRestorationAt: new Date(now + 24 * 3600000).toISOString(),
        internalNotes: 'Contractor on site; pressure test scheduled for tomorrow morning.',
        createdAt: new Date(now - 24 * 3600000).toISOString(),
        publishedAt: new Date(now - 20 * 3600000).toISOString(),
        updatedAt: new Date(now - 12 * 3600000).toISOString(),
        history: [
          {
            historyId: 'hist_01',
            noticeId: 'notice_ncwsc_01',
            actorUid: 'user_org_ncwsc',
            actorName: 'Eng. David Mwangi',
            action: 'created',
            notes: 'Notice drafted by technical team',
            timestamp: new Date(now - 24 * 3600000).toISOString(),
          },
          {
            historyId: 'hist_02',
            noticeId: 'notice_ncwsc_01',
            actorUid: 'user_org_ncwsc',
            actorName: 'Eng. David Mwangi',
            action: 'published',
            notes: 'Broadcast dispatched to registered area subscribers',
            timestamp: new Date(now - 20 * 3600000).toISOString(),
          },
        ],
      },
      {
        noticeId: 'notice_ncwsc_02',
        title: 'Emergency Burst Pipe Along Thika Superhighway',
        description:
          'An unforeseen pipe rupture has occurred near Roysambu roundabout. Technicians have isolated the line. Low pressure or dry taps will be experienced in Kasarani and surrounding areas.',
        noticeType: 'unexpected_interruption',
        affectedAreaIds: ['kasarani', 'roysambu', 'zimmerman'],
        affectedAreaNames: ['Kasarani & Clay City', 'Roysambu & Mirema', 'Zimmerman & Githurai 44'],
        sourceType: 'official_utility',
        sourceOrganisationId: 'org_ncwsc',
        sourceOrganisationName: 'Nairobi City Water & Sewerage Co. (NCWSC)',
        sourceReference: 'NCWSC/EMERG/2026/089',
        createdBy: 'user_org_ncwsc',
        createdByName: 'Eng. David Mwangi (NCWSC)',
        verificationStatus: 'official_source',
        publicationStatus: 'published',
        plannedStartAt: new Date(now - 4 * 3600000).toISOString(),
        expectedRestorationAt: new Date(now + 14 * 3600000).toISOString(),
        createdAt: new Date(now - 5 * 3600000).toISOString(),
        publishedAt: new Date(now - 4 * 3600000).toISOString(),
        updatedAt: new Date(now - 4 * 3600000).toISOString(),
        history: [
          {
            historyId: 'hist_03',
            noticeId: 'notice_ncwsc_02',
            actorUid: 'user_org_ncwsc',
            actorName: 'Eng. David Mwangi',
            action: 'published',
            timestamp: new Date(now - 4 * 3600000).toISOString(),
          },
        ],
      },
      {
        noticeId: 'notice_pm_03',
        title: 'Kilimani Heights: Booster Pump Overhaul Notice',
        description:
          'Building management will be servicing the overhead pressure pump between 10:00 AM and 2:00 PM today. Communal reserve is at 75%. Please store essential drinking water beforehand.',
        noticeType: 'maintenance_notice',
        affectedAreaIds: ['kilimani'],
        affectedAreaNames: ['Kilimani'],
        sourceType: 'property_manager',
        sourceOrganisationName: 'Greenstone Property Management',
        createdBy: 'user_pm_alice',
        createdByName: 'Alice Wanjiku (Property Manager)',
        verificationStatus: 'organisation_verified',
        publicationStatus: 'published',
        plannedStartAt: new Date(now + 3 * 3600000).toISOString(),
        expectedRestorationAt: new Date(now + 7 * 3600000).toISOString(),
        createdAt: new Date(now - 8 * 3600000).toISOString(),
        publishedAt: new Date(now - 6 * 3600000).toISOString(),
        updatedAt: new Date(now - 6 * 3600000).toISOString(),
        history: [],
      },
      {
        noticeId: 'notice_ncwsc_04',
        title: 'Langata Road Feeder Pumping Restored',
        description:
          'Repairs on the Langata booster line are complete. Normal supply pressure has resumed across Nairobi West and South C.',
        noticeType: 'restoration_update',
        affectedAreaIds: ['langata', 'south_c'],
        affectedAreaNames: ["Lang'ata & Nairobi West", 'South C & Bellevue'],
        sourceType: 'official_utility',
        sourceOrganisationName: 'Nairobi City Water & Sewerage Co. (NCWSC)',
        createdBy: 'user_org_ncwsc',
        createdByName: 'Eng. David Mwangi (NCWSC)',
        verificationStatus: 'resolved',
        publicationStatus: 'resolved',
        createdAt: new Date(now - 48 * 3600000).toISOString(),
        publishedAt: new Date(now - 48 * 3600000).toISOString(),
        updatedAt: new Date(now - 18 * 3600000).toISOString(),
        resolvedAt: new Date(now - 18 * 3600000).toISOString(),
        history: [],
      },
    ];

    demoNotices.forEach((n) => this.notices.set(n.noticeId, n));

    // 3. Water Storage Containers for Resident Jane Muthoni
    const demoStorage: WaterStorageContainer[] = [
      {
        storageId: 'tank_01',
        userId: 'user_resident_jane',
        name: 'Rooftop Roto Tank (Main)',
        storageType: 'overhead_poly_tank',
        capacityLitres: 2500,
        currentAmountLitres: 1850,
        notes: 'Feeds kitchen and master bathroom taps via gravity',
        lastUpdatedAt: new Date(now - 2 * 3600000).toISOString(),
        createdAt: new Date(now - 60 * 86400000).toISOString(),
      },
      {
        storageId: 'tank_02',
        userId: 'user_resident_jane',
        name: 'Ground Underground Sump',
        storageType: 'underground_sump',
        capacityLitres: 1500,
        currentAmountLitres: 900,
        notes: 'Filled during utility tap flow; requires booster pump to lift',
        lastUpdatedAt: new Date(now - 14 * 3600000).toISOString(),
        createdAt: new Date(now - 60 * 86400000).toISOString(),
      },
      {
        storageId: 'tank_03',
        userId: 'user_resident_jane',
        name: 'Emergency Blue Drum (Kitchen)',
        storageType: 'drum',
        capacityLitres: 210,
        currentAmountLitres: 180,
        notes: 'Treated drinking and cooking water reserve',
        lastUpdatedAt: new Date(now - 5 * 3600000).toISOString(),
        createdAt: new Date(now - 20 * 86400000).toISOString(),
      },
    ];

    demoStorage.forEach((s) => this.waterStorage.set(s.storageId, s));

    // 4. Household Expenses for Resident Jane Muthoni
    const demoExpenses: HouseholdExpense[] = [
      {
        expenseId: 'exp_01',
        userId: 'user_resident_jane',
        category: 'utility_water_bill',
        amountKes: 1450,
        date: new Date(now - 18 * 86400000).toISOString().split('T')[0],
        quantityLitres: 16000,
        supplierName: 'NCWSC Meter Account #418290',
        notes: 'September metered piped water bill',
        createdAt: new Date(now - 18 * 86400000).toISOString(),
        updatedAt: new Date(now - 18 * 86400000).toISOString(),
      },
      {
        expenseId: 'exp_02',
        userId: 'user_resident_jane',
        category: 'water_bowser_delivery',
        amountKes: 3200,
        date: new Date(now - 8 * 86400000).toISOString().split('T')[0],
        quantityLitres: 5000,
        supplierName: 'Maji Safi Bowsers',
        notes: 'Refilled compound overhead and ground tanks during line repair',
        createdAt: new Date(now - 8 * 86400000).toISOString(),
        updatedAt: new Date(now - 8 * 86400000).toISOString(),
      },
      {
        expenseId: 'exp_03',
        userId: 'user_resident_jane',
        category: 'vendor_water_purchase',
        amountKes: 400,
        date: new Date(now - 3 * 86400000).toISOString().split('T')[0],
        quantityLitres: 160,
        supplierName: 'Kilimani Mineral Water Kiosk',
        notes: '8 x 20-litre refill bottles for drinking',
        createdAt: new Date(now - 3 * 86400000).toISOString(),
        updatedAt: new Date(now - 3 * 86400000).toISOString(),
      },
      {
        expenseId: 'exp_04',
        userId: 'user_resident_jane',
        category: 'filtration_purification',
        amountKes: 650,
        date: new Date(now - 25 * 86400000).toISOString().split('T')[0],
        supplierName: 'WaterGuard & Ceramic Candle Filter',
        notes: 'Monthly replacement cartridge and chlorine drops',
        createdAt: new Date(now - 25 * 86400000).toISOString(),
        updatedAt: new Date(now - 25 * 86400000).toISOString(),
      },
    ];

    demoExpenses.forEach((e) => this.expenses.set(e.expenseId, e));

    // 5. Budget for Jane Muthoni
    this.budgets.set('user_resident_jane', {
      budgetId: 'bgt_jane',
      userId: 'user_resident_jane',
      month: new Date().toISOString().slice(0, 7),
      amountKes: 6000,
      estimatedDailyConsumptionLitres: 220, // 3-4 person household estimate
      householdMembersCount: 4,
      updatedAt: new Date().toISOString(),
    });

    // 6. Water Vendors
    const demoVendors: WaterVendor[] = [
      {
        vendorId: 'vdr_01',
        businessName: 'Maji Safi Clean Bowsers Ltd',
        contactPerson: 'Peter Ochieng',
        contactPhoneNumber: '+254701999888',
        serviceAreaIds: ['kilimani', 'kileleshwa', 'lavington', 'westlands'],
        serviceAreaNames: ['Kilimani', 'Kileleshwa', 'Lavington', 'Westlands'],
        deliveryOptions: ['tanker_bowser'],
        indicativePrice: 1.15,
        pricingUnit: 'per_litre',
        minimumOrder: '5,000 Litres (1 tanker)',
        availabilityStatus: 'available_now',
        lastAvailabilityUpdateAt: new Date(now - 30 * 60000).toISOString(),
        verificationStatus: 'verified',
        description:
          'Licensed potable water bowsers. High-capacity stainless tankers with KEBS-compliant chlorinated spring water. Dispatched with 30m hose.',
        operatingHours: '6:00 AM - 9:00 PM Daily',
        waterSource: 'Ruiru Deep Borehole & Licensed Spring Source',
        createdBy: 'user_vendor_peter',
        createdAt: new Date(now - 60 * 86400000).toISOString(),
        updatedAt: new Date(now - 30 * 60000).toISOString(),
      },
      {
        vendorId: 'vdr_02',
        businessName: 'Nairobi Pure Springs Express',
        contactPerson: 'Grace Njeri',
        contactPhoneNumber: '+254722881122',
        serviceAreaIds: ['westlands', 'parklands', 'spring_valley'],
        serviceAreaNames: ['Westlands', 'Parklands & Highridge', 'Spring Valley & Lower Kabete'],
        deliveryOptions: ['tanker_bowser', '20l_refill'],
        indicativePrice: 60,
        pricingUnit: 'per_20l_container',
        minimumOrder: '3 containers or 5000L tanker',
        availabilityStatus: 'available_now',
        lastAvailabilityUpdateAt: new Date(now - 2 * 3600000).toISOString(),
        verificationStatus: 'verified',
        description:
          'Reverse osmosis purified drinking water delivered to estates and offices. Doorstep refill available.',
        operatingHours: '7:00 AM - 8:00 PM',
        waterSource: 'Commercial Purification Plant, Parklands',
        createdBy: 'user_vendor_grace',
        createdAt: new Date(now - 45 * 86400000).toISOString(),
        updatedAt: new Date(now - 2 * 3600000).toISOString(),
      },
      {
        vendorId: 'vdr_03',
        businessName: 'Kasarani Oasis Tanker Services',
        contactPerson: 'Samuel Mutua',
        contactPhoneNumber: '+254734556677',
        serviceAreaIds: ['kasarani', 'roysambu', 'zimmerman', 'kahawa_west'],
        serviceAreaNames: ['Kasarani & Clay City', 'Roysambu & Mirema', 'Zimmerman & Githurai 44', 'Kahawa West & Wendani'],
        deliveryOptions: ['tanker_bowser', 'jerrycan_cart'],
        indicativePrice: 1.0,
        pricingUnit: 'per_litre',
        minimumOrder: '3,000 Litres',
        availabilityStatus: 'limited_supply',
        lastAvailabilityUpdateAt: new Date(now - 45 * 60000).toISOString(),
        verificationStatus: 'verified',
        description:
          'Quick response water delivery across Thika Road corridor estates. Electric booster pump on all trucks.',
        operatingHours: '24 Hours Emergency Service',
        waterSource: 'Certified Borehole, Kasarani Sports Road',
        createdBy: 'user_vendor_samuel',
        createdAt: new Date(now - 30 * 86400000).toISOString(),
        updatedAt: new Date(now - 45 * 60000).toISOString(),
      },
      {
        vendorId: 'vdr_04',
        businessName: 'Langata Fresh Waters',
        contactPerson: 'Hassan Aden',
        contactPhoneNumber: '+254711334455',
        serviceAreaIds: ['langata', 'karen', 'south_c'],
        serviceAreaNames: ["Lang'ata & Nairobi West", 'Karen & Hardy', 'South C & Bellevue'],
        deliveryOptions: ['tanker_bowser'],
        indicativePrice: 3800,
        pricingUnit: 'per_5000l_tanker',
        availabilityStatus: 'available_now',
        lastAvailabilityUpdateAt: new Date(now - 3 * 3600000).toISOString(),
        verificationStatus: 'pending_review',
        description:
          '5,000L and 10,000L trucks serving Karen, Langata and South C residential compounds. Fast delivery.',
        operatingHours: '6:30 AM - 7:30 PM',
        waterSource: 'Oloolua Tested Borehole',
        createdBy: 'user_vendor_hassan',
        createdAt: new Date(now - 5 * 86400000).toISOString(),
        updatedAt: new Date(now - 5 * 86400000).toISOString(),
      },
    ];

    demoVendors.forEach((v) => this.vendors.set(v.vendorId, v));

    // 7. Buildings Managed by Property Manager Alice
    const demoBuildings: Building[] = [
      {
        buildingId: 'bld_01',
        managerUid: 'user_pm_alice',
        managerName: 'Alice Wanjiku',
        name: 'Kilimani Heights Apartments',
        generalLocation: 'Dennis Pritt Road, Block B',
        serviceAreaId: 'kilimani',
        serviceAreaName: 'Kilimani',
        residentialUnitsCount: 36,
        tankCapacityLitres: 35000,
        currentTankLevelLitres: 22000,
        notes: 'Underground 25kL reservoir + 10kL rooftop header tank',
        createdAt: new Date(now - 90 * 86400000).toISOString(),
        updatedAt: new Date(now - 2 * 86400000).toISOString(),
      },
      {
        buildingId: 'bld_02',
        managerUid: 'user_pm_alice',
        managerName: 'Alice Wanjiku',
        name: 'Westlands Ridge Court',
        generalLocation: 'Muthithi Road, Westlands',
        serviceAreaId: 'westlands',
        serviceAreaName: 'Westlands',
        residentialUnitsCount: 24,
        tankCapacityLitres: 20000,
        currentTankLevelLitres: 14500,
        notes: 'Dual poly tanks with automated borehole transfer pump',
        createdAt: new Date(now - 60 * 86400000).toISOString(),
        updatedAt: new Date(now - 1 * 86400000).toISOString(),
      },
    ];

    demoBuildings.forEach((b) => this.buildings.set(b.buildingId, b));

    // Building updates
    this.buildingUpdates.set('upd_01', {
      updateId: 'upd_01',
      buildingId: 'bld_01',
      buildingName: 'Kilimani Heights Apartments',
      managerUid: 'user_pm_alice',
      title: 'Water Rationing Hours During NCWSC Line Work',
      description:
        'Due to the area interruption on Sasumua pipeline, taps will be opened between 6:00 AM - 9:00 AM and 6:00 PM - 9:00 PM to conserve communal reservoir levels.',
      updateType: 'rationing_schedule',
      status: 'active',
      createdAt: new Date(now - 10 * 3600000).toISOString(),
    });

    // 8. Issue Reports from Residents
    const demoReports: IssueReport[] = [
      {
        reportId: 'rep_01',
        reporterUid: 'user_resident_jane',
        reporterName: 'Jane Muthoni',
        category: 'unexpected_interruption',
        areaId: 'kilimani',
        areaName: 'Kilimani',
        landmarkLocation: 'Near Argwings Kodhek junction / Chaka Place',
        description:
          'No tap water since yesterday afternoon. Neighbouring court also reports dry pipes. Was this part of the Sasumua shutdown?',
        observedAt: new Date(now - 16 * 3600000).toISOString(),
        status: 'under_review',
        assignedOrganisationId: 'org_ncwsc',
        assignedOrganisationName: 'NCWSC Technical Team',
        createdAt: new Date(now - 16 * 3600000).toISOString(),
        updatedAt: new Date(now - 12 * 3600000).toISOString(),
      },
      {
        reportId: 'rep_02',
        reporterUid: 'user_resident_brian',
        reporterName: 'Brian Kiprop',
        category: 'suspected_leak_wastage',
        areaId: 'westlands',
        areaName: 'Westlands',
        landmarkLocation: 'Mpaka Road opposite Westgate Mall',
        description:
          'Piped clean water gushing from underneath the pavement edge. Appears to be a high-pressure municipal main line rupture.',
        observedAt: new Date(now - 6 * 3600000).toISOString(),
        status: 'referred_to_utility',
        assignedOrganisationId: 'org_ncwsc',
        assignedOrganisationName: 'NCWSC Rapid Response',
        resolutionNotes: 'Dispatched maintenance repair crew to isolate valve.',
        createdAt: new Date(now - 6 * 3600000).toISOString(),
        updatedAt: new Date(now - 3 * 3600000).toISOString(),
      },
      {
        reportId: 'rep_03',
        reporterUid: 'user_resident_mercy',
        reporterName: 'Mercy Auma',
        category: 'water_quality_concern',
        areaId: 'kasarani',
        areaName: 'Kasarani & Clay City',
        landmarkLocation: 'Hunters Stage, Kasarani',
        description:
          'Piped water came out brown/turbid with strong sediment after pressure returned this morning.',
        observedAt: new Date(now - 28 * 3600000).toISOString(),
        status: 'resolved',
        assignedOrganisationId: 'org_ncwsc',
        assignedOrganisationName: 'NCWSC Quality Assurance',
        resolutionNotes: 'Hydrant flushed to clear sediment following pipeline repair. Normal clarity restored.',
        createdAt: new Date(now - 28 * 3600000).toISOString(),
        updatedAt: new Date(now - 8 * 3600000).toISOString(),
      },
    ];

    demoReports.forEach((r) => this.issueReports.set(r.reportId, r));

    // 9. SMS Subscriptions
    this.subscriptions.set('user_resident_jane', {
      subscriptionId: 'sub_jane',
      userId: 'user_resident_jane',
      maskedPhoneNumber: '+254 712 *** 678',
      rawPhoneNumber: '+254712345678',
      areaIds: ['kilimani', 'kileleshwa'],
      areaNames: ['Kilimani', 'Kileleshwa'],
      alertCategories: ['planned_interruptions', 'unexpected_outages', 'restoration_alerts', 'building_updates'],
      consentStatus: true,
      isPaused: false,
      createdAt: new Date(now - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 10. Sample Notification Events (for transparency and inspection)
    this.notificationEvents = [
      {
        notificationId: 'notif_001',
        noticeId: 'notice_ncwsc_01',
        noticeTitle: 'Sasumua Transmission Main Repair',
        recipientReference: '+254 712 *** 678',
        recipientUid: 'user_resident_jane',
        recipientArea: 'Kilimani',
        channel: 'sms',
        provider: 'simulation_mode',
        messageText:
          'MAJIWATCH: Planned interruption for Kilimani, Kileleshwa from 08:00 AM. Expected restoration: Oct 24, 02:00 PM. Source: NCWSC. Stay prepared.',
        status: 'delivered_simulated',
        providerMessageId: 'SIM-SMS-254-892110',
        retryCount: 0,
        createdAt: new Date(now - 20 * 3600000).toISOString(),
        sentAt: new Date(now - 20 * 3600000 + 400).toISOString(),
        deliveredAt: new Date(now - 20 * 3600000 + 1200).toISOString(),
      },
      {
        notificationId: 'notif_002',
        noticeId: 'notice_ncwsc_02',
        noticeTitle: 'Emergency Burst Pipe Along Thika Superhighway',
        recipientReference: '+254 734 *** 192',
        recipientUid: 'user_resident_samuel',
        recipientArea: 'Kasarani & Clay City',
        channel: 'sms',
        provider: 'simulation_mode',
        messageText:
          'MAJIWATCH: Unexpected interruption for Kasarani & Clay City, Roysambu. Expected restoration: Under assessment. Source: NCWSC.',
        status: 'delivered_simulated',
        providerMessageId: 'SIM-SMS-254-892144',
        retryCount: 0,
        createdAt: new Date(now - 4 * 3600000).toISOString(),
        sentAt: new Date(now - 4 * 3600000 + 350).toISOString(),
        deliveredAt: new Date(now - 4 * 3600000 + 950).toISOString(),
      },
    ];

    // 11. Initial Audit Logs
    this.auditLogs = [
      {
        logId: 'audit_01',
        actorUid: 'user_admin_chief',
        actorName: 'MajiWatch Administrator',
        actorRole: 'admin',
        action: 'APPROVE_ORGANISATION',
        entityType: 'organisation',
        entityId: 'org_ncwsc',
        relevantChangeSummary: 'Approved official credentials for Nairobi City Water & Sewerage Co.',
        timestamp: new Date(now - 60 * 86400000).toISOString(),
      },
      {
        logId: 'audit_02',
        actorUid: 'user_org_ncwsc',
        actorName: 'Eng. David Mwangi',
        actorRole: 'organisation',
        action: 'PUBLISH_NOTICE',
        entityType: 'notice',
        entityId: 'notice_ncwsc_01',
        relevantChangeSummary: 'Published planned outage: Sasumua Transmission Main Repair',
        timestamp: new Date(now - 20 * 3600000).toISOString(),
      },
      {
        logId: 'audit_03',
        actorUid: 'user_admin_chief',
        actorName: 'MajiWatch Administrator',
        actorRole: 'admin',
        action: 'VERIFY_VENDOR',
        entityType: 'vendor',
        entityId: 'vdr_01',
        relevantChangeSummary: 'Approved verification for Maji Safi Clean Bowsers Ltd',
        timestamp: new Date(now - 25 * 86400000).toISOString(),
      },
    ];
  }
}

export const db = new DatabaseStore();
