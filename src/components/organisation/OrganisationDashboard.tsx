import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { WaterNotice, IssueReport, NotificationEvent, NoticeType } from '../../types';
import { NAIROBI_AREAS } from '../../data/nairobiAreas';
import {
  Building,
  Plus,
  Send,
  CheckCircle,
  AlertTriangle,
  History,
  Smartphone,
  Eye,
  Clock,
  MapPin,
  RefreshCw,
  XCircle,
  FileText,
} from 'lucide-react';

export const OrganisationDashboard: React.FC<{
  onSelectNotice: (notice: WaterNotice) => void;
  onOpenSMSTester: () => void;
}> = ({ onSelectNotice, onOpenSMSTester }) => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<WaterNotice[]>([]);
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Notice creation modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    description: '',
    noticeType: 'planned_interruption' as NoticeType,
    affectedAreaIds: ['kilimani', 'kileleshwa'],
    plannedStartAt: '',
    expectedRestorationAt: '',
    sourceReference: 'NCWSC/OPS/2026/',
    internalNotes: '',
    autoPublish: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [noticesRes, reportsRes, notifsRes] = await Promise.all([
        api.getNotices(),
        api.getReports(),
        api.getNotifications(),
      ]);

      if (noticesRes.notices) setNotices(noticesRes.notices);
      if (reportsRes.reports) setReports(reportsRes.reports);
      if (notifsRes.notifications) setNotifications(notifsRes.notifications);
    } catch (err) {
      console.error('Error loading org data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.description || newNotice.affectedAreaIds.length === 0) {
      alert('Please fill in title, description, and at least one affected estate');
      return;
    }

    try {
      setCreating(true);
      const res = await api.createNotice(newNotice);
      setShowCreateModal(false);
      setNewNotice({
        title: '',
        description: '',
        noticeType: 'planned_interruption',
        affectedAreaIds: ['kilimani', 'kileleshwa'],
        plannedStartAt: '',
        expectedRestorationAt: '',
        sourceReference: 'NCWSC/OPS/2026/',
        internalNotes: '',
        autoPublish: true,
      });
      await loadData();
      alert(`Notice created! ${newNotice.autoPublish ? 'SMS broadcast has been dispatched to subscribed residents in affected estates.' : 'Saved as draft.'}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create notice');
    } finally {
      setCreating(false);
    }
  };

  const handlePublishNotice = async (noticeId: string) => {
    try {
      const res = await api.publishNotice(noticeId);
      await loadData();
      alert(`Notice published! SMS notifications dispatched to ${res.dispatchResults?.length || 0} subscribed residents.`);
    } catch (err: any) {
      alert(err.message || 'Failed to publish notice');
    }
  };

  const handleResolveNotice = async (noticeId: string) => {
    const notify = confirm('Mark notice as resolved? Check OK to also dispatch a restoration update SMS to residents.');
    try {
      await api.resolveNotice(noticeId, {
        notes: 'Repairs completed by technical team. Pressure restored.',
        notifySubscribers: notify,
      });
      await loadData();
      alert('Notice resolved and archived.');
    } catch (err: any) {
      alert(err.message || 'Failed to resolve notice');
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: any) => {
    const resolutionNotes = prompt('Enter technician action or resolution notes:');
    try {
      await api.updateReport(reportId, {
        status,
        resolutionNotes: resolutionNotes || undefined,
        assignedOrganisationName: user?.organisationName || 'NCWSC Technical Crew',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update report');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {user?.organisationName || 'Water Utility Organisation Portal'}
            </h1>
            <span className="bg-indigo-100 text-indigo-800 font-bold text-xs px-2.5 py-0.5 rounded-full">
              Authorised Utility
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Representative: <span className="font-semibold text-slate-700">{user?.displayName}</span> • Role:{' '}
            <span className="font-semibold text-indigo-700">Official Notice Publisher & SMS Broadcast Authority</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#176B87] hover:bg-[#125368] text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> Publish New Notice
          </button>
          <button
            onClick={onOpenSMSTester}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Smartphone className="w-4 h-4" /> SMS Logs
          </button>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Published Notices</span>
          <p className="text-2xl font-black text-slate-900">
            {notices.filter((n) => n.publicationStatus === 'published').length}
          </p>
          <p className="text-[11px] text-slate-400">Currently active on board</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Resolved Notices</span>
          <p className="text-2xl font-black text-slate-900">
            {notices.filter((n) => n.publicationStatus === 'resolved').length}
          </p>
          <p className="text-[11px] text-slate-400">Archived maintenance jobs</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">SMS Broadcasts Dispatched</span>
          <p className="text-2xl font-black text-emerald-600">{notifications.length}</p>
          <p className="text-[11px] text-slate-400">Delivered to area subscribers</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Community Reports</span>
          <p className="text-2xl font-black text-amber-600">
            {reports.filter((r) => r.status !== 'resolved').length} Open
          </p>
          <p className="text-[11px] text-slate-400">Awaiting or under review</p>
        </div>
      </div>

      {/* Notices Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Notices Issued By Your Organisation</h2>
            <p className="text-xs text-slate-500">
              Manage live announcements, edit details, mark resolved, or trigger SMS broadcasts
            </p>
          </div>
          <button onClick={loadData} className="text-xs text-[#176B87] flex items-center gap-1 font-semibold hover:underline">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Title & Type</th>
                <th className="py-3 px-4">Affected Estates</th>
                <th className="py-3 px-4">Start Time</th>
                <th className="py-3 px-4">Expected Restoration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {notices.map((notice) => (
                <tr key={notice.noticeId} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900">{notice.title}</p>
                    <span className="text-[10px] text-slate-400 font-mono">Ref: {notice.sourceReference || 'N/A'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {notice.affectedAreaNames.map((a, i) => (
                        <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-700">
                          {a}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    {notice.plannedStartAt ? new Date(notice.plannedStartAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Immediate'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">
                    {notice.expectedRestorationAt ? new Date(notice.expectedRestorationAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'TBD'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        notice.publicationStatus === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : notice.publicationStatus === 'resolved'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {notice.publicationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => onSelectNotice(notice)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded font-semibold text-[11px]"
                    >
                      Details
                    </button>
                    {notice.publicationStatus === 'draft' && (
                      <button
                        onClick={() => handlePublishNotice(notice.noticeId)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[11px]"
                      >
                        Publish & SMS
                      </button>
                    )}
                    {notice.publicationStatus === 'published' && (
                      <button
                        onClick={() => handleResolveNotice(notice.noticeId)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-semibold text-[11px]"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Community Reports in Jurisdiction */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Community Incident Reports in Your Service Area</h2>
          <p className="text-xs text-slate-500">
            Resident-submitted leaks, burst pipes, and schedule discrepancies requiring utility action
          </p>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {reports.map((report) => (
            <div key={report.reportId} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 capitalize">{report.category.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                    {report.areaName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
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
                {report.landmarkLocation && (
                  <p className="text-[11px] text-slate-400">Landmark: {report.landmarkLocation}</p>
                )}
                {report.resolutionNotes && (
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-200 mt-1">
                    Crew Action: {report.resolutionNotes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleUpdateReportStatus(report.reportId, 'referred_to_utility')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded"
                >
                  Dispatch Crew
                </button>
                <button
                  onClick={() => handleUpdateReportStatus(report.reportId, 'resolved')}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded"
                >
                  Mark Fixed
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE NOTICE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Publish Water Supply Notice</h3>
            <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Planned Shutdown of Sasumua Transmission Line"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notice Type</label>
                  <select
                    value={newNotice.noticeType}
                    onChange={(e) => setNewNotice({ ...newNotice, noticeType: e.target.value as NoticeType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="planned_interruption">Planned Interruption</option>
                    <option value="unexpected_interruption">Unexpected Outage / Burst</option>
                    <option value="supply_schedule_update">Supply Schedule Update</option>
                    <option value="restoration_update">Restoration Notice</option>
                    <option value="maintenance_notice">Maintenance Advisory</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Reference / Job ID</label>
                  <input
                    type="text"
                    value={newNotice.sourceReference}
                    onChange={(e) => setNewNotice({ ...newNotice, sourceReference: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affected Nairobi Estates (Hold Ctrl/Cmd to select multiple) *</label>
                <select
                  multiple
                  required
                  value={newNotice.affectedAreaIds}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    setNewNotice({ ...newNotice, affectedAreaIds: selected });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 font-medium"
                >
                  {NAIROBI_AREAS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.subCounty})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Selected: {newNotice.affectedAreaIds.length} estates
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Planned Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newNotice.plannedStartAt}
                    onChange={(e) => setNewNotice({ ...newNotice, plannedStartAt: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Restoration Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newNotice.expectedRestorationAt}
                    onChange={(e) => setNewNotice({ ...newNotice, expectedRestorationAt: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Description & Public Instructions *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the technical cause, affected roads, expected duration, and advice for residents to store water..."
                  value={newNotice.description}
                  onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-cyan-900">
                  <input
                    type="checkbox"
                    checked={newNotice.autoPublish}
                    onChange={(e) => setNewNotice({ ...newNotice, autoPublish: e.target.checked })}
                    className="rounded text-[#176B87]"
                  />
                  <span>Publish immediately and trigger SMS broadcast to subscribed residents</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-[#176B87] hover:bg-[#125368] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {creating ? 'Broadcasting...' : 'Confirm & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
