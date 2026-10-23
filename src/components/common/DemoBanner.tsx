import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, RefreshCw, Smartphone, UserCheck } from 'lucide-react';
import { UserRole } from '../../types';

export const DemoBanner: React.FC<{ onOpenSMSTester?: () => void }> = ({ onOpenSMSTester }) => {
  const { user, switchRole } = useAuth();

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'resident', label: 'Resident', desc: 'Jane (Kilimani)' },
    { id: 'organisation', label: 'Utility Org', desc: 'NCWSC Engineer' },
    { id: 'property_manager', label: 'Property Mgr', desc: 'Alice (Kilimani Hts)' },
    { id: 'vendor', label: 'Water Vendor', desc: 'Peter (Maji Safi)' },
    { id: 'admin', label: 'Admin', desc: 'MajiWatch Moderator' },
  ];

  return (
    <div className="bg-[#176B87] text-white border-b border-[#2A9D8F]/30 text-xs py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
            Demonstration Mode
          </span>
          <span className="hidden md:inline text-cyan-100">
            Nairobi County Water Information System. Real SMS adapter simulation active (no unsolicited charges).
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1 sm:py-0">
          <span className="text-cyan-200 text-[11px] whitespace-nowrap flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            Active Role:
          </span>
          <div className="flex items-center gap-1 bg-[#0f4b5f] p-0.5 rounded-lg border border-cyan-700/50">
            {roles.map((r) => {
              const isActive = user?.role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => switchRole(r.id)}
                  title={`Switch to ${r.label} view: ${r.desc}`}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-400 text-slate-900 font-semibold shadow-xs'
                      : 'text-cyan-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {onOpenSMSTester && (
            <button
              onClick={onOpenSMSTester}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded text-[11px] flex items-center gap-1 transition-colors whitespace-nowrap border border-emerald-400/40"
            >
              <Smartphone className="w-3 h-3" />
              Test SMS Gateway
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
