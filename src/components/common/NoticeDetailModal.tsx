import React from 'react';
import { WaterNotice, UserRole } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  ShieldCheck,
  AlertTriangle,
  History,
  X,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

export const NoticeDetailModal: React.FC<{
  notice: WaterNotice | null;
  onClose: () => void;
  userRole?: UserRole;
  onResolve?: (noticeId: string) => void;
}> = ({ notice, onClose, userRole, onResolve }) => {
  if (!notice) return null;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'planned_interruption':
        return <span className="bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full text-xs">Planned Interruption</span>;
      case 'unexpected_interruption':
        return <span className="bg-red-100 text-red-800 font-semibold px-2.5 py-1 rounded-full text-xs">Unexpected Outage</span>;
      case 'restoration_update':
        return <span className="bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full text-xs">Supply Restored</span>;
      case 'maintenance_notice':
        return <span className="bg-blue-100 text-blue-800 font-semibold px-2.5 py-1 rounded-full text-xs">Maintenance Advisory</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-full text-xs">Water Notice</span>;
    }
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'official_source':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Official Utility Notice
          </span>
        );
      case 'organisation_verified':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Organisation Verified
          </span>
        );
      case 'resolved':
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Resolved
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" /> Community Reported
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {getTypeBadge(notice.noticeType)}
              {getVerificationBadge(notice.verificationStatus)}
            </div>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">{notice.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7FAFC] p-4 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <p className="text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#176B87]" /> Source Authority
              </p>
              <p className="font-bold text-slate-800 text-sm">{notice.sourceOrganisationName}</p>
              {notice.sourceReference && (
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">Ref: {notice.sourceReference}</p>
              )}
            </div>

            <div>
              <p className="text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2A9D8F]" /> Affected Nairobi Estates
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {notice.affectedAreaNames.map((area, idx) => (
                  <span key={idx} className="bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-700">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Planned Interruption Start
              </p>
              <p className="font-semibold text-slate-800">
                {notice.plannedStartAt ? new Date(notice.plannedStartAt).toLocaleString() : 'Immediate / In Effect'}
              </p>
            </div>

            <div>
              <p className="text-slate-500 font-medium mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Expected Supply Restoration
              </p>
              <p className="font-semibold text-slate-800">
                {notice.expectedRestorationAt
                  ? new Date(notice.expectedRestorationAt).toLocaleString()
                  : 'Under Ongoing Assessment'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Notice Description & Details</h4>
            <div className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 whitespace-pre-line">
              {notice.description}
            </div>
          </div>

          {/* History audit */}
          {notice.history && notice.history.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" /> Revision & Publication History
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {notice.history.map((h, i) => (
                  <div key={i} className="p-3 bg-slate-50/50 flex items-start justify-between">
                    <div>
                      <span className="font-semibold capitalize text-slate-800">{h.action}</span>
                      <span className="text-slate-500"> by {h.actorName}</span>
                      {h.notes && <p className="text-slate-600 text-[11px] mt-0.5">{h.notes}</p>}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">ID: {notice.noticeId}</span>
          <div className="flex items-center gap-2">
            {['organisation', 'admin'].includes(userRole || '') && notice.publicationStatus === 'published' && onResolve && (
              <button
                onClick={() => onResolve(notice.noticeId)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark Resolved
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs px-4 py-1.5 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
