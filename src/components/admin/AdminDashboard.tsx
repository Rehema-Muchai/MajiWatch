import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { WaterNotice, WaterVendor, IssueReport, NotificationEvent, AuditLog } from '../../types';
import {
  Shield,
  Users,
  Building,
  Truck,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  Smartphone,
  Eye,
  RefreshCw,
  Search,
} from 'lucide-react';

export const AdminDashboard: React.FC<{
  onSelectNotice: (notice: WaterNotice) => void;
  onOpenSMSTester: () => void;
}> = ({ onSelectNotice, onOpenSMSTester }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [vendors, setVendors] = useState<WaterVendor[]>([]);
  const [notices, setNotices] = useState<WaterNotice[]>([]);
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'vendors' | 'notices' | 'sms' | 'audit'>('overview');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, vendorsRes, noticesRes, reportsRes, notifsRes, auditRes] = await Promise.all([
        api.getAdminStats(),
        api.getVendors(),
        api.getNotices(),
        api.getReports(),
        api.getNotifications(),
        api.getAuditLogs(),
      ]);

      if (statsRes.stats) setStats(statsRes.stats);
      if (vendorsRes.vendors) setVendors(vendorsRes.vendors);
      if (noticesRes.notices) setNotices(noticesRes.notices);
      if (reportsRes.reports) setReports(reportsRes.reports);
      if (notifsRes.notifications) setNotifications(notifsRes.notifications);
      if (auditRes.auditLogs) setAuditLogs(auditRes.auditLogs);
    } catch (err) {
      console.error('Error loading admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyVendor = async (vendorId: string, status: 'verified' | 'rejected') => {
    try {
      await api.verifyVendor(vendorId, status);
      await loadAdminData();
      alert(`Vendor status updated to ${status}.`);
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">MajiWatch Administrator Console</h1>
            <span className="bg-purple-100 text-purple-900 font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Platform Admin
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Security & Oversight • Audit Logging • Organisation Approvals • SMS Gateway Dispatch Inspection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSMSTester}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Smartphone className="w-4 h-4" /> Live SMS Simulator
          </button>
          <button
            onClick={loadAdminData}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Total Users</span>
            <p className="text-xl font-black text-slate-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Utilities</span>
            <p className="text-xl font-black text-indigo-700">{stats.orgUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Active Notices</span>
            <p className="text-xl font-black text-emerald-600">{stats.activeNotices}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Open Reports</span>
            <p className="text-xl font-black text-amber-600">{stats.openReports}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">Verified Vendors</span>
            <p className="text-xl font-black text-cyan-700">{stats.verifiedVendors}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <span className="text-[11px] text-slate-500 font-medium">SMS Broadcasts</span>
            <p className="text-xl font-black text-purple-700">{stats.totalNotifications}</p>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Overview & Approvals' },
          { id: 'vendors', label: 'Vendor Directory Review' },
          { id: 'notices', label: 'Notice Oversight' },
          { id: 'sms', label: 'SMS Notification Logs' },
          { id: 'audit', label: 'Audit Trail' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeAdminTab === tab.id
                ? 'bg-[#176B87] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB: OVERVIEW / APPROVALS */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'overview' && (
        <div className="space-y-6">
          {/* Vendor Verification Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Water Vendor Verification Queue</h2>
                <p className="text-xs text-slate-500">
                  Review submitted water bowsers, contact details, and source disclosures before granting verification badge
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {vendors.map((v) => (
                <div key={v.vendorId} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{v.businessName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          v.verificationStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {v.verificationStatus.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600">
                      Contact: <strong>{v.contactPerson}</strong> ({v.contactPhoneNumber}) • Source:{' '}
                      <strong>{v.waterSource || 'Unspecified'}</strong>
                    </p>
                    <p className="text-slate-500">
                      Price: KES {v.indicativePrice} {v.pricingUnit.replace(/_/g, ' ')} • Coverage:{' '}
                      {v.serviceAreaNames.join(', ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {v.verificationStatus !== 'verified' ? (
                      <button
                        onClick={() => handleVerifyVendor(v.vendorId, 'verified')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve & Verify
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerifyVendor(v.vendorId, 'rejected')}
                        className="bg-slate-200 hover:bg-red-50 hover:text-red-700 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg"
                      >
                        Revoke Verification
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB: VENDORS */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'vendors' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">All Registered Water Vendors ({vendors.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Business</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Indicative Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {vendors.map((v) => (
                  <tr key={v.vendorId} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{v.businessName}</td>
                    <td className="py-3 px-4 font-mono">{v.contactPhoneNumber}</td>
                    <td className="py-3 px-4 font-mono">
                      KES {v.indicativePrice} {v.pricingUnit.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 capitalize">{v.availabilityStatus.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          v.verificationStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {v.verificationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB: NOTICES OVERSIGHT */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'notices' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">All Notices Oversight</h2>
          <div className="divide-y divide-slate-100 text-xs">
            {notices.map((n) => (
              <div key={n.noticeId} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{n.title}</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                      {n.publicationStatus}
                    </span>
                  </div>
                  <p className="text-slate-500">
                    Author: {n.createdByName} • Source: {n.sourceOrganisationName}
                  </p>
                  <p className="text-slate-600 line-clamp-1">{n.description}</p>
                </div>
                <button
                  onClick={() => onSelectNotice(n)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-xs shrink-0"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB: SMS LOGS */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'sms' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">SMS Notification Event Audit Logs</h2>
              <p className="text-xs text-slate-500">
                Inspect every SMS alert dispatched by utilities, including recipient references, providers, and statuses
              </p>
            </div>
            <button
              onClick={onOpenSMSTester}
              className="bg-[#176B87] hover:bg-[#125368] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" /> Dispatch Simulator
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
            {notifications.map((log) => (
              <div key={log.notificationId} className="p-4 hover:bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.recipientArea}</span>
                    <span className="font-mono text-slate-500">{log.recipientReference}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      log.status.startsWith('delivered')
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'deduplicated'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {log.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="bg-slate-100 p-2.5 rounded font-mono text-[11px] text-slate-700 border border-slate-200/60">
                  {log.messageText}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Provider: {log.provider}</span>
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUBTAB: AUDIT LOGS */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">System Security Audit Logs</h2>
          <div className="divide-y divide-slate-100 text-xs font-mono">
            {auditLogs.map((log) => (
              <div key={log.logId} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-slate-500 text-[11px]">by {log.actorName} ({log.actorRole})</span>
                  </div>
                  <p className="text-slate-700 font-sans text-xs">{log.relevantChangeSummary}</p>
                </div>
                <span className="text-slate-400 text-[10px] shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
