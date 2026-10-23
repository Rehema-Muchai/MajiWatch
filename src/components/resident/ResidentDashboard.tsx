import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  WaterNotice,
  WaterStorageContainer,
  HouseholdExpense,
  HouseholdBudget,
  WaterVendor,
  IssueReport,
  SMSSubscription,
  IssueCategory,
  ExpenseCategory,
  StorageType,
} from '../../types';
import { NAIROBI_AREAS } from '../../data/nairobiAreas';
import {
  Home,
  Bell,
  Gauge,
  Wallet,
  Truck,
  AlertCircle,
  Smartphone,
  User,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  Droplets,
  Edit2,
  PhoneCall,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ResidentDashboard: React.FC<{
  initialTab?: string;
  onSelectNotice: (notice: WaterNotice) => void;
  onOpenSMSTester: () => void;
}> = ({ initialTab = 'overview', onSelectNotice, onOpenSMSTester }) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data states
  const [notices, setNotices] = useState<WaterNotice[]>([]);
  const [tanks, setTanks] = useState<WaterStorageContainer[]>([]);
  const [expenses, setExpenses] = useState<HouseholdExpense[]>([]);
  const [budget, setBudget] = useState<HouseholdBudget | null>(null);
  const [vendors, setVendors] = useState<WaterVendor[]>([]);
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [subscription, setSubscription] = useState<SMSSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals & form states
  const [showAddTankModal, setShowAddTankModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showReportIssueModal, setShowReportIssueModal] = useState(false);
  const [adjustTankModal, setAdjustTankModal] = useState<WaterStorageContainer | null>(null);

  // Search & filter states
  const [noticeSearch, setNoticeSearch] = useState('');
  const [noticeAreaFilter, setNoticeAreaFilter] = useState('all');
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorAreaFilter, setVendorAreaFilter] = useState('all');

  // Forms
  const [newTank, setNewTank] = useState({
    name: '',
    storageType: 'overhead_poly_tank' as StorageType,
    capacityLitres: 2500,
    currentAmountLitres: 2000,
    notes: '',
  });

  const [newExpense, setNewExpense] = useState({
    category: 'vendor_water_purchase' as ExpenseCategory,
    amountKes: 1200,
    date: new Date().toISOString().split('T')[0],
    quantityLitres: 1000,
    supplierName: '',
    notes: '',
  });

  const [newReport, setNewReport] = useState({
    category: 'unexpected_interruption' as IssueCategory,
    areaId: user?.preferredAreaId || 'kilimani',
    landmarkLocation: '',
    description: '',
  });

  // Load all user data
  const loadData = async () => {
    try {
      setLoading(true);
      const [
        noticesRes,
        tanksRes,
        expensesRes,
        budgetRes,
        vendorsRes,
        reportsRes,
        subscriptionRes,
      ] = await Promise.all([
        api.getNotices(),
        api.getWaterStorage(),
        api.getExpenses(),
        api.getBudget(),
        api.getVendors(),
        api.getReports(),
        api.getSubscription(),
      ]);

      if (noticesRes.notices) setNotices(noticesRes.notices);
      if (tanksRes.tanks) setTanks(tanksRes.tanks);
      if (expensesRes.expenses) setExpenses(expensesRes.expenses);
      if (budgetRes.budget) setBudget(budgetRes.budget);
      if (vendorsRes.vendors) setVendors(vendorsRes.vendors);
      if (reportsRes.reports) setReports(reportsRes.reports);
      if (subscriptionRes.subscription) setSubscription(subscriptionRes.subscription);
    } catch (err) {
      console.error('Error loading resident dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.uid]);

  // Calculations: Total Available Water & Days Remaining
  const totalCapacityLitres = tanks.reduce((acc, t) => acc + t.capacityLitres, 0);
  const totalCurrentWaterLitres = tanks.reduce((acc, t) => acc + t.currentAmountLitres, 0);
  const dailyUse = budget?.estimatedDailyConsumptionLitres || 200;
  const estimatedDaysRemaining = dailyUse > 0 ? (totalCurrentWaterLitres / dailyUse).toFixed(1) : 'N/A';

  // Budget calculations
  const totalSpentThisMonth = expenses.reduce((acc, e) => acc + e.amountKes, 0);
  const monthlyTarget = budget?.amountKes || 5000;
  const budgetRemaining = monthlyTarget - totalSpentThisMonth;

  // Chart data: expense categories
  const categoryLabels: Record<string, string> = {
    utility_water_bill: 'Utility Bill (NCWSC)',
    vendor_water_purchase: 'Vendor Containers',
    water_bowser_delivery: 'Bowser Delivery',
    tank_cleaning_maintenance: 'Maintenance',
    filtration_purification: 'Filtration',
    other: 'Other Costs',
  };

  const expensesByCategory = expenses.reduce((acc: Record<string, number>, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amountKes;
    return acc;
  }, {});

  const pieData = Object.entries(expensesByCategory).map(([cat, amount]) => ({
    name: categoryLabels[cat] || cat,
    value: amount,
  }));

  const COLORS = ['#176B87', '#2A9D8F', '#F4A261', '#E76F51', '#457B9D', '#9B5DE5'];

  // Tank handlers
  const handleCreateTank = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWaterStorage(newTank);
      setShowAddTankModal(false);
      setNewTank({
        name: '',
        storageType: 'overhead_poly_tank',
        capacityLitres: 2500,
        currentAmountLitres: 2000,
        notes: '',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add tank');
    }
  };

  const handleDeleteTank = async (id: string) => {
    if (confirm('Are you sure you want to delete this water storage record?')) {
      await api.deleteWaterStorage(id);
      await loadData();
    }
  };

  const handleAdjustTank = async (delta: number, action: 'consume' | 'refill') => {
    if (!adjustTankModal) return;
    try {
      await api.adjustWaterStorage(adjustTankModal.storageId, delta, action);
      setAdjustTankModal(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to adjust tank level');
    }
  };

  // Expense handlers
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExpense(newExpense);
      setShowAddExpenseModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Delete this expense record?')) {
      await api.deleteExpense(id);
      await loadData();
    }
  };

  // Report handler
  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createReport(newReport);
      setShowReportIssueModal(false);
      setNewReport({
        category: 'unexpected_interruption',
        areaId: user?.preferredAreaId || 'kilimani',
        landmarkLocation: '',
        description: '',
      });
      await loadData();
      alert('Your water issue report has been submitted to the community board and assigned for review.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    }
  };

  // SMS subscription update
  const handleToggleSMS = async () => {
    try {
      if (subscription?.consentStatus) {
        await api.unsubscribe();
      } else {
        await api.saveSubscription({
          rawPhoneNumber: user?.phoneNumber || '+254712345678',
          areaIds: [user?.preferredAreaId || 'kilimani'],
          consentStatus: true,
          isPaused: false,
        });
      }
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Welcome Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Welcome, {user?.displayName || 'Resident'}
            </h1>
            <span className="bg-sky-100 text-[#176B87] font-bold text-xs px-2.5 py-0.5 rounded-full">
              Resident Account
            </span>
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#2A9D8F]" />
            <span>Nairobi Area: </span>
            <span className="font-semibold text-slate-800">{user?.preferredAreaName || 'Kilimani'}</span>
            <span className="text-slate-300">•</span>
            <span>SMS Status: </span>
            <span className={subscription?.consentStatus ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
              {subscription?.consentStatus ? 'Subscribed' : 'Not Subscribed'}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAddTankModal(true)}
            className="bg-[#176B87] hover:bg-[#125368] text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Storage Tank
          </button>
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Record Expense
          </button>
          <button
            onClick={() => setShowReportIssueModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <AlertCircle className="w-3.5 h-3.5" /> Report Issue
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-200 pb-2 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: Home },
          { id: 'notices', label: 'Water Notices', icon: Bell },
          { id: 'reserve', label: 'My Water Reserve', icon: Gauge },
          { id: 'budget', label: 'My Water Budget', icon: Wallet },
          { id: 'vendors', label: 'Find Vendors', icon: Truck },
          { id: 'reports', label: 'Report Issue', icon: AlertCircle },
          { id: 'sms', label: 'SMS Alerts', icon: Smartphone },
          { id: 'profile', label: 'Profile Settings', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#176B87] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Water Remaining Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Stored Water</span>
                <Droplets className="w-4 h-4 text-[#176B87]" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {totalCurrentWaterLitres.toLocaleString()} L
                </span>
                <span className="text-xs text-slate-500">/ {totalCapacityLitres.toLocaleString()} L</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#176B87] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalCapacityLitres > 0 ? (totalCurrentWaterLitres / totalCapacityLitres) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-500">Across {tanks.length} active storage containers</p>
            </div>

            {/* Estimated Days Remaining */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Days Remaining</span>
                <Gauge className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">~{estimatedDaysRemaining}</span>
                <span className="text-xs font-semibold text-slate-600">days</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Based on daily household estimate of <span className="font-semibold">{dailyUse} L/day</span>
              </p>
            </div>

            {/* Monthly Budget Spent */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Water Expenses</span>
                <Wallet className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">
                  KES {totalSpentThisMonth.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Budget: KES {monthlyTarget.toLocaleString()} ({budgetRemaining >= 0 ? `KES ${budgetRemaining} left` : 'Exceeded'})
              </p>
            </div>

            {/* Active Notices In Area */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Notices in {user?.preferredAreaName}</span>
                <Bell className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-slate-900">
                  {notices.filter((n) => n.affectedAreaIds.includes(user?.preferredAreaId || 'kilimani')).length}
                </span>
                <span className="text-xs text-slate-500">active alerts</span>
              </div>
              <p className="text-[11px] text-slate-500">
                {notices.some((n) => n.affectedAreaIds.includes(user?.preferredAreaId || 'kilimani') && n.noticeType === 'planned_interruption')
                  ? 'Planned maintenance underway'
                  : 'Supply running per schedule'}
              </p>
            </div>
          </div>

          {/* Relevant Area Notices & Quick Tank Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notices List */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Water Supply Updates for Your Area</h3>
                  <p className="text-xs text-slate-500">
                    Official notices and community reports affecting {user?.preferredAreaName}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('notices')}
                  className="text-xs text-[#176B87] font-semibold hover:underline flex items-center gap-1"
                >
                  View All ({notices.length})
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {notices
                  .filter((n) => n.affectedAreaIds.includes(user?.preferredAreaId || 'kilimani') || n.publicationStatus === 'published')
                  .slice(0, 3)
                  .map((notice) => (
                    <div
                      key={notice.noticeId}
                      onClick={() => onSelectNotice(notice)}
                      className="py-3.5 hover:bg-slate-50 transition-colors cursor-pointer rounded-lg px-2 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              notice.noticeType === 'planned_interruption'
                                ? 'bg-amber-100 text-amber-800'
                                : notice.noticeType === 'unexpected_interruption'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {notice.noticeType.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(notice.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 hover:text-[#176B87]">{notice.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{notice.description}</p>
                      </div>

                      <div className="shrink-0 text-right text-xs">
                        <span className="text-[11px] font-semibold text-slate-700 block">
                          {notice.expectedRestorationAt
                            ? `Restore: ${new Date(notice.expectedRestorationAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
                            : 'In Progress'}
                        </span>
                        <span className="text-[10px] text-slate-400">{notice.sourceOrganisationName}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Tank Reserve Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Your Storage Tanks</h3>
                <button
                  onClick={() => setActiveTab('reserve')}
                  className="text-xs text-[#176B87] font-semibold hover:underline"
                >
                  Manage
                </button>
              </div>

              <div className="space-y-3">
                {tanks.map((tank) => {
                  const pct = tank.capacityLitres > 0 ? (tank.currentAmountLitres / tank.capacityLitres) * 100 : 0;
                  return (
                    <div key={tank.storageId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>{tank.name}</span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          {tank.currentAmountLitres} / {tank.capacityLitres} L
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct > 50 ? 'bg-emerald-500' : pct > 20 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{pct.toFixed(0)}% Full</span>
                        <button
                          onClick={() => setAdjustTankModal(tank)}
                          className="text-[#176B87] font-semibold hover:underline"
                        >
                          Quick Log Refill / Consume
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: WATER NOTICES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'notices' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Nairobi Water Notices & Schedules</h2>
              <p className="text-xs text-slate-500">
                Filter by neighbourhood, search announcements, or inspect full verification records
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search notices..."
                  value={noticeSearch}
                  onChange={(e) => setNoticeSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#176B87] focus:outline-hidden"
                />
              </div>

              <select
                value={noticeAreaFilter}
                onChange={(e) => setNoticeAreaFilter(e.target.value)}
                className="w-full sm:w-56 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#176B87] focus:outline-hidden"
              >
                <option value="all">All Nairobi Estates</option>
                {NAIROBI_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.subCounty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices
              .filter((n) => {
                const matchArea = noticeAreaFilter === 'all' || n.affectedAreaIds.includes(noticeAreaFilter);
                const matchSearch =
                  !noticeSearch ||
                  n.title.toLowerCase().includes(noticeSearch.toLowerCase()) ||
                  n.description.toLowerCase().includes(noticeSearch.toLowerCase()) ||
                  n.affectedAreaNames.some((a) => a.toLowerCase().includes(noticeSearch.toLowerCase()));
                return matchArea && matchSearch;
              })
              .map((notice) => (
                <div
                  key={notice.noticeId}
                  onClick={() => onSelectNotice(notice)}
                  className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-[#176B87] transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          notice.noticeType === 'planned_interruption'
                            ? 'bg-amber-100 text-amber-800'
                            : notice.noticeType === 'unexpected_interruption'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {notice.noticeType.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(notice.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{notice.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{notice.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {notice.affectedAreaNames.map((area, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">{notice.sourceOrganisationName}</span>
                    <span className="text-[#176B87] font-semibold flex items-center gap-1 hover:underline">
                      View Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: MY WATER RESERVE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'reserve' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Household Water Reserve Tracker</h2>
              <p className="text-xs text-slate-500">
                Track your active storage containers in Litres, log refills or consumption, and estimate days of supply
              </p>
            </div>
            <button
              onClick={() => setShowAddTankModal(true)}
              className="bg-[#176B87] hover:bg-[#125368] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Storage Container
            </button>
          </div>

          {/* Consumption & Days Calculation Box */}
          <div className="bg-gradient-to-r from-[#176B87] to-[#2A9D8F] text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-cyan-100">
                Consumption Formula
              </span>
              <h3 className="text-2xl font-black">
                Estimated ~{estimatedDaysRemaining} Days of Water Remaining
              </h3>
              <p className="text-xs text-cyan-100 max-w-xl leading-relaxed">
                Formula: Total Available Water ({totalCurrentWaterLitres.toLocaleString()} L) ÷ Daily Household Usage ({dailyUse} L/day).
                Note: This is an empirical estimate. Actual use varies based on laundry, cooking, and visitors.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 text-xs space-y-2 w-full md:w-64">
              <div className="flex justify-between">
                <span>Total Capacity:</span>
                <span className="font-bold">{totalCapacityLitres.toLocaleString()} L</span>
              </div>
              <div className="flex justify-between">
                <span>Current Reserve:</span>
                <span className="font-bold">{totalCurrentWaterLitres.toLocaleString()} L</span>
              </div>
              <div className="flex justify-between">
                <span>Reserve Level:</span>
                <span className="font-bold">
                  {totalCapacityLitres > 0
                    ? ((totalCurrentWaterLitres / totalCapacityLitres) * 100).toFixed(0)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Tank Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tanks.map((tank) => {
              const pct = tank.capacityLitres > 0 ? (tank.currentAmountLitres / tank.capacityLitres) * 100 : 0;
              return (
                <div key={tank.storageId} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {tank.storageType.replace(/_/g, ' ')}
                      </span>
                      <button
                        onClick={() => handleDeleteTank(tank.storageId)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{tank.name}</h3>
                    {tank.notes && <p className="text-xs text-slate-500 italic">{tank.notes}</p>}

                    {/* Visual Tank Gauge */}
                    <div className="relative bg-slate-100 rounded-xl h-24 border border-slate-200 overflow-hidden flex flex-col justify-end p-2">
                      <div
                        className={`absolute inset-x-0 bottom-0 transition-all duration-700 ${
                          pct > 50
                            ? 'bg-gradient-to-t from-[#176B87] to-cyan-400'
                            : pct > 20
                            ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                            : 'bg-gradient-to-t from-red-600 to-red-400'
                        }`}
                        style={{ height: `${pct}%` }}
                      />
                      <div className="relative z-10 flex items-center justify-between text-xs font-bold text-slate-800 drop-shadow-xs bg-white/70 backdrop-blur-xs px-2 py-1 rounded">
                        <span>{tank.currentAmountLitres.toLocaleString()} L</span>
                        <span>{pct.toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Max Capacity: {tank.capacityLitres.toLocaleString()} L</span>
                      <span>Updated {new Date(tank.lastUpdatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setAdjustTankModal(tank)}
                      className="w-full bg-slate-100 hover:bg-[#176B87] hover:text-white text-slate-700 font-semibold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Droplets className="w-3.5 h-3.5" />
                      Update Water Level
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: MY WATER BUDGET */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Household Water Expenditure & Budget</h2>
              <p className="text-xs text-slate-500">
                Track costs for municipal bills, vendor 20L containers, bowsers, and maintenance
              </p>
            </div>
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Record Water Expense
            </button>
          </div>

          {/* Budget Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Monthly Water Budget</span>
              <p className="text-2xl font-black text-slate-900">KES {monthlyTarget.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400">Target spending cap for current month</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Total Spent This Month</span>
              <p className="text-2xl font-black text-slate-900">KES {totalSpentThisMonth.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400">Across {expenses.length} logged expense items</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Budget Status</span>
              <p
                className={`text-2xl font-black ${
                  budgetRemaining >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {budgetRemaining >= 0 ? `KES ${budgetRemaining.toLocaleString()} Left` : `KES ${Math.abs(budgetRemaining).toLocaleString()} Exceeded`}
              </p>
              <p className="text-[11px] text-slate-400">
                {budgetRemaining >= 0 ? 'Within monthly budget limit' : 'Monthly budget exceeded'}
              </p>
            </div>
          </div>

          {/* Charts: Recharts Pie & Spending Breakdown */}
          {expenses.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Spending by Category (KES)
                </h3>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `KES ${Number(value).toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Expense Category Distribution
                </h3>
                <div className="space-y-3 pt-2">
                  {pieData.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-medium text-slate-700">{cat.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">KES {cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Water Expense Log</h3>
              <span className="text-xs text-slate-400">{expenses.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Supplier / Notes</th>
                    <th className="py-3 px-4">Quantity (L)</th>
                    <th className="py-3 px-4 text-right">Amount (KES)</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {expenses.map((exp) => (
                    <tr key={exp.expenseId} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono">{exp.date}</td>
                      <td className="py-3 px-4 font-medium capitalize">
                        {categoryLabels[exp.category] || exp.category}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {exp.supplierName || '—'} {exp.notes && <span className="text-slate-400">({exp.notes})</span>}
                      </td>
                      <td className="py-3 px-4 font-mono">{exp.quantityLitres ? exp.quantityLitres.toLocaleString() : '—'}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                        {exp.amountKes.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteExpense(exp.expenseId)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: FIND VENDORS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Alternative Water Vendor Directory</h2>
              <p className="text-xs text-slate-500">
                Verified water bowsers and clean water kiosks serving Nairobi estates during rationing
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <select
                value={vendorAreaFilter}
                onChange={(e) => setVendorAreaFilter(e.target.value)}
                className="w-full sm:w-56 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#176B87] focus:outline-hidden"
              >
                <option value="all">All Service Areas</option>
                {NAIROBI_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vendors
              .filter((v) => vendorAreaFilter === 'all' || v.serviceAreaIds.includes(vendorAreaFilter))
              .map((vendor) => (
                <div key={vendor.vendorId} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-slate-900">{vendor.businessName}</h3>
                        {vendor.verificationStatus === 'verified' && (
                          <span title="Verified by MajiWatch">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          vendor.availabilityStatus === 'available_now'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {vendor.availabilityStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{vendor.description}</p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Indicative Pricing:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          KES {vendor.indicativePrice} {vendor.pricingUnit.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {vendor.minimumOrder && (
                        <div className="flex justify-between text-slate-500">
                          <span>Minimum Order:</span>
                          <span className="font-medium text-slate-700">{vendor.minimumOrder}</span>
                        </div>
                      )}
                      {vendor.waterSource && (
                        <div className="flex justify-between text-slate-500">
                          <span>Source:</span>
                          <span className="font-medium text-slate-700">{vendor.waterSource}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs">
                      <span className="text-[11px] text-slate-400 font-medium block mb-1">Coverage Estates:</span>
                      <div className="flex flex-wrap gap-1">
                        {vendor.serviceAreaNames.map((area, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Updated: {new Date(vendor.lastAvailabilityUpdateAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <a
                      href={`tel:${vendor.contactPhoneNumber}`}
                      className="bg-[#176B87] hover:bg-[#125368] text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Call {vendor.contactPhoneNumber}
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: REPORT ISSUE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Community Water Issue Reporting</h2>
              <p className="text-xs text-slate-500">
                Report dry taps outside schedule, unexpected pipe bursts, or low pressure in your neighbourhood
              </p>
            </div>
            <button
              onClick={() => setShowReportIssueModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Submit New Issue Report
            </button>
          </div>

          {/* Water quality disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Water Quality & Contamination Guidance</p>
              <p className="leading-relaxed mt-0.5">
                MajiWatch is a community coordination platform and does not conduct laboratory water testing. If you observe
                discolored water, sewage odor, or suspect chemical contamination, do not drink or cook with it. Please immediately
                contact the NCWSC Quality Assurance Lab or Nairobi County Public Health Department.
              </p>
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">My Submitted Reports</h3>
              <span className="text-xs text-slate-400">{reports.length} reports</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {reports.map((report) => (
                <div key={report.reportId} className="p-4 hover:bg-slate-50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 capitalize">
                      {report.category.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        report.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : report.status === 'referred_to_utility'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {report.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-slate-600">{report.description}</p>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span>
                      Location: <strong className="text-slate-700">{report.areaName}</strong>{' '}
                      {report.landmarkLocation && `(${report.landmarkLocation})`}
                    </span>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  {report.resolutionNotes && (
                    <div className="mt-2 bg-emerald-50 text-emerald-900 p-2.5 rounded-lg border border-emerald-200 text-xs">
                      <strong className="block text-[10px] uppercase tracking-wide">Utility Action / Resolution Note:</strong>
                      {report.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: SMS ALERTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'sms' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">SMS Outage & Restoration Alerts</h2>
              <p className="text-xs text-slate-500">
                Receive instant notifications on your mobile phone without requiring internet access
              </p>
            </div>
            <button
              onClick={onOpenSMSTester}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Smartphone className="w-3.5 h-3.5" /> Open SMS Dispatch Tester
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Subscription Status</h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered Phone:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {subscription?.maskedPhoneNumber || user?.phoneNumber || '+254 712 *** 678'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Coverage:</span>
                  <span className="font-bold text-slate-800">{user?.preferredAreaName || 'Kilimani'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alert Status:</span>
                  <span
                    className={`font-bold ${
                      subscription?.consentStatus ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {subscription?.consentStatus ? 'Active & Subscribed' : 'Paused / Inactive'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleToggleSMS}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    subscription?.consentStatus
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                      : 'bg-[#176B87] hover:bg-[#125368] text-white'
                  }`}
                >
                  {subscription?.consentStatus ? 'Pause SMS Alerts' : 'Activate SMS Alerts for My Area'}
                </button>
              </div>
            </div>

            {/* Privacy & Protocol explainer */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs text-slate-600 leading-relaxed">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Privacy & Data Protection Notice
              </h3>
              <p>
                In compliance with the Kenya Data Protection Act (2019), your phone number is encrypted and never
                displayed publicly or sold to third-party vendors.
              </p>
              <p>
                Notifications are strictly restricted to urgent utility supply notices, planned rationing, and restoration
                updates. Deduplication logic ensures you will not receive repetitive alerts for unchanged notices.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 8: PROFILE SETTINGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Resident Profile Settings</h2>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={user?.displayName}
                onBlur={(e) => updateProfile({ displayName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kenyan Mobile Number</label>
              <input
                type="text"
                defaultValue={user?.phoneNumber}
                onBlur={(e) => updateProfile({ phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Nairobi Area</label>
              <select
                defaultValue={user?.preferredAreaId}
                onChange={(e) => updateProfile({ preferredAreaId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                {NAIROBI_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.subCounty})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD STORAGE TANK */}
      {/* ------------------------------------------------------------- */}
      {showAddTankModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Water Storage Container</h3>
            <form onSubmit={handleCreateTank} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Container Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rooftop Poly Tank or Ground Sump"
                  value={newTank.name}
                  onChange={(e) => setNewTank({ ...newTank, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Storage Type</label>
                <select
                  value={newTank.storageType}
                  onChange={(e) => setNewTank({ ...newTank, storageType: e.target.value as StorageType })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="overhead_poly_tank">Overhead Poly Tank (Roto / Top Tank)</option>
                  <option value="underground_sump">Underground Concrete Sump</option>
                  <option value="drum">Emergency Drum (200L)</option>
                  <option value="jerrycans">Jerrycans Batch (20L)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Capacity (Litres) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newTank.capacityLitres}
                    onChange={(e) => setNewTank({ ...newTank, capacityLitres: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Amount (Litres)</label>
                  <input
                    type="number"
                    min={0}
                    max={newTank.capacityLitres}
                    value={newTank.currentAmountLitres}
                    onChange={(e) => setNewTank({ ...newTank, currentAmountLitres: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Feeds kitchen and bathroom taps"
                  value={newTank.notes}
                  onChange={(e) => setNewTank({ ...newTank, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTankModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#176B87] hover:bg-[#125368] text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Save Tank Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: QUICK REFILL / CONSUME LOG */}
      {/* ------------------------------------------------------------- */}
      {adjustTankModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Update Water Level: {adjustTankModal.name}</h3>
            <p className="text-xs text-slate-500">
              Current amount: <strong className="font-mono text-slate-800">{adjustTankModal.currentAmountLitres} L</strong>{' '}
              / {adjustTankModal.capacityLitres} L
            </p>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-slate-700">Quick Adjust:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleAdjustTank(200, 'consume')}
                  className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold rounded-xl border border-rose-200 flex items-center justify-center gap-1"
                >
                  <TrendingDown className="w-3.5 h-3.5" /> -200 L Used
                </button>
                <button
                  onClick={() => handleAdjustTank(500, 'refill')}
                  className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl border border-emerald-200 flex items-center justify-center gap-1"
                >
                  <TrendingUp className="w-3.5 h-3.5" /> +500 L Refilled
                </button>
                <button
                  onClick={() => handleAdjustTank(adjustTankModal.capacityLitres, 'refill')}
                  className="p-2.5 bg-cyan-50 hover:bg-cyan-100 text-[#176B87] font-semibold rounded-xl border border-cyan-200 col-span-2 flex items-center justify-center gap-1"
                >
                  <Droplets className="w-3.5 h-3.5" /> Mark 100% Full (Tanker / Tap Refill)
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAdjustTankModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RECORD EXPENSE */}
      {/* ------------------------------------------------------------- */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Record Water Expense</h3>
            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Category *</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="utility_water_bill">Utility Piped Water Bill (NCWSC)</option>
                  <option value="vendor_water_purchase">Vendor Water Purchase (20L Containers)</option>
                  <option value="water_bowser_delivery">Water Bowser Delivery (5,000L / 10,000L)</option>
                  <option value="filtration_purification">Filtration & Purification (Filters, Tablets)</option>
                  <option value="tank_cleaning_maintenance">Tank Cleaning & Maintenance</option>
                  <option value="other">Other Water Cost</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount in KES *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newExpense.amountKes}
                    onChange={(e) => setNewExpense({ ...newExpense, amountKes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity in Litres (Optional)</label>
                  <input
                    type="number"
                    value={newExpense.quantityLitres || ''}
                    onChange={(e) => setNewExpense({ ...newExpense, quantityLitres: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier / Vendor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Maji Safi Bowsers"
                    value={newExpense.supplierName}
                    onChange={(e) => setNewExpense({ ...newExpense, supplierName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. September meter reading #418290"
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: REPORT WATER ISSUE */}
      {/* ------------------------------------------------------------- */}
      {showReportIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Report a Water Supply Issue</h3>
            <form onSubmit={handleCreateReport} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issue Category *</label>
                <select
                  value={newReport.category}
                  onChange={(e) => setNewReport({ ...newReport, category: e.target.value as IssueCategory })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="unexpected_interruption">Unexpected Water Interruption</option>
                  <option value="supply_has_not_returned">Supply Has Not Returned After Scheduled Outage</option>
                  <option value="schedule_differs">Actual Supply Differs From Published Schedule</option>
                  <option value="suspected_leak_wastage">Suspected Main Pipe Leak / Road Wastage</option>
                  <option value="water_quality_concern">Water Quality Concern (Brown / Turbid / Odor)</option>
                  <option value="low_pressure">Low Water Pressure (Unable to Reach Roof Tank)</option>
                  <option value="other">Other Water Issue</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affected Nairobi Area *</label>
                <select
                  value={newReport.areaId}
                  onChange={(e) => setNewReport({ ...newReport, areaId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {NAIROBI_AREAS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.subCounty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Landmark / Road Name</label>
                <input
                  type="text"
                  placeholder="e.g. Near Argwings Kodhek / Chaka Place"
                  value={newReport.landmarkLocation}
                  onChange={(e) => setNewReport({ ...newReport, landmarkLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what you observed (e.g. taps dry since 2pm, neighboring buildings also dry)..."
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportIssueModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Submit Issue Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
