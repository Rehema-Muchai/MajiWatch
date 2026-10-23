# MajiWatch: Collaborative Water Information & Household Management Platform for Nairobi

**MajiWatch** connects Nairobi residents and participating water organisations through accessible supply updates, SMS alerts, household water-reserve planning tools, budgeting, and verified alternative water vendor directories.

> **Tagline:** Stay Informed. Plan Ahead. Manage Water Better.  
> **Scope:** Nairobi County, Kenya (24 Sub-Counties & Estates: Kilimani, Westlands, Kasarani, Lang'ata, Karen, Roysambu, Embakasi, Kibra, etc.)

---

## 1. System Architecture & Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Recharts for analytics.
- **Backend:** Node.js, Express, TypeScript (`server.ts` entry point with Vite middleware in development and static asset serving in production).
- **Database & Storage:** Structured document schemas (`users`, `notices`, `waterStorage`, `householdExpenses`, `householdBudgets`, `vendors`, `buildings`, `issueReports`, `subscriptions`, `notificationEvents`, `auditLogs`) with production `firestore.rules` provided.
- **SMS Integration:** Pluggable SMS Provider Adapter supporting:
  - **Africa's Talking SMS API**
  - **Twilio SMS API**
  - **Interactive Simulation & Delivery Tracker Mode** (built-in safe mode when API keys are not supplied, logging simulated deliveries without unwanted telco costs).

---

## 2. Supported Roles & Pre-Seeded Demo Accounts

You can instantly switch roles using the **Demonstration Mode Bar** at the top of the interface:

1. **Resident (`user_resident_jane` - Jane Muthoni, Kilimani):**
   - View notices affecting Kilimani & Dagoretti North.
   - Manage multiple water storage containers (2,500L poly rooftop tank, 1,500L underground sump, 210L drum).
   - Real-time consumption calculation: `Estimated Days Remaining = Total Litres / Daily Use`.
   - Water budget manager (KES 6,000 monthly target, expenses breakdown with Recharts pie chart).
   - Manage SMS alert subscription and submit community issue reports.

2. **Water Utility Representative (`user_org_ncwsc` - Eng. David Mwangi, NCWSC):**
   - Draft and publish official planned/unexpected water interruption notices.
   - Publishing triggers automatic SMS broadcast to registered residents in affected estates.
   - Review community leak and outage reports; dispatch maintenance crews and mark resolved.

3. **Property Manager (`user_pm_alice` - Alice Wanjiku, Greenstone PM):**
   - Oversee residential complexes (*Kilimani Heights Apartments* - 36 units, 35,000L communal tank; *Westlands Ridge Court*).
   - Issue building water rationing schedules (e.g. taps open 6am-9am & 6pm-9pm).
   - Record bulk water bowser refill deliveries.

4. **Water Vendor (`user_vendor_peter` - Peter Ochieng, Maji Safi Clean Bowsers Ltd):**
   - Manage tanker fleet listings, pricing per unit (KES 1.15/Litre, KES 50/20L container), and water source credentials.
   - Toggle real-time availability (Available Now / Limited Supply / Temporarily Closed).

5. **Platform Administrator (`user_admin_chief` - MajiWatch Administrator):**
   - High-level municipal metrics (notices, users, bowsers, reports, SMS events).
   - Vendor verification queue (grant or revoke verified badge).
   - SMS notification audit log inspector with delivery status, message payload, and recipient reference.
   - Security audit trail.

---

## 3. Quick Start & Execution Commands

### Development Mode
```bash
npm run dev
```
Starts the full-stack server running Express and Vite middleware on port 3000 (`http://localhost:3000`).

### Production Build
```bash
npm run build
npm start
```

### TypeScript Validation & Linting
```bash
npm run lint
```

---

## 4. SMS Gateway Setup

MajiWatch includes an SMS Provider Adapter (`server/smsAdapter.ts`).

### Option A: Simulation Mode (Default)
No credentials required. All outgoing SMS alerts for published notices or test dispatches are recorded as `delivered_simulated` with realistic delivery latency and deduplication hashes to prevent subscriber fatigue.

### Option B: Africa's Talking (Kenya)
Add the following to your `.env`:
```env
AFRICASTALKING_USERNAME=your_username
AFRICASTALKING_API_KEY=your_api_key
AFRICASTALKING_SENDER_ID=MAJIWATCH
```

### Option C: Twilio
Add the following to your `.env`:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

---

## 5. Firebase & Firestore Production Setup

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com).
2. Enable **Firestore Database** and **Firebase Authentication**.
3. Deploy the provided `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```
4. Copy the Firebase Web configuration keys into `.env` (prefixed with `VITE_FIREBASE_*`).

---

## 6. Verification and Core User Journeys

- **Journey A (Resident):** Create water storage container -> set daily household consumption -> see live calculated days remaining -> record water expenses -> view area notices -> submit an issue report.
- **Journey B (Utility Org):** Draft a water interruption notice -> select affected Nairobi estates -> click "Publish & SMS" -> view dispatched SMS logs in the inspector.
- **Journey C (Vendor):** Update bowser pricing and availability -> verify that updated pricing displays in the public vendor directory.
- **Journey D (Property Manager):** Log a 10,000L bowser refill to Kilimani Heights -> post a tenant water advisory -> check notice history.
- **Journey E (Administrator):** Inspect security audit logs -> verify pending vendors -> check system-wide SMS events.
- **Journey F (SMS Accessibility):** Open the built-in **SMS Gateway Tester** -> send a simulated SMS alert -> verify deduplication filter and formatted message templates.
