import React from 'react';
import { Droplets, Phone, ShieldCheck, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC<{
  onNavigate: (view: string) => void;
  onOpenSMSTester: () => void;
}> = ({ onNavigate, onOpenSMSTester }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('landing')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#176B87] to-[#2A9D8F] flex items-center justify-center text-white">
                <Droplets className="w-5 h-5 text-cyan-200" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">MajiWatch</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              A collaborative water information and household water-management platform for Nairobi County, Kenya.
              Bridging digital divides through real-time notices and SMS notifications.
            </p>
            <p className="text-[10px] text-slate-500">
              MajiWatch complements existing water utilities and does not claim to replace official emergency services.
            </p>
          </div>

          {/* Col 2: Fast Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Platform Links</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors">
                  Home & Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('notices')} className="hover:text-white transition-colors">
                  Water Notices Board
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('vendors')} className="hover:text-white transition-colors">
                  Alternative Water Vendors
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="hover:text-white transition-colors">
                  Household Dashboard
                </button>
              </li>
              <li>
                <button onClick={onOpenSMSTester} className="hover:text-white transition-colors text-emerald-400">
                  SMS Gateway Simulator
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Nairobi Emergency Hotlines */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Utility Hotlines (Nairobi)</h4>
            <div className="space-y-2 text-slate-400 text-[11px]">
              <div>
                <p className="font-semibold text-slate-200">NCWSC Call Centre:</p>
                <p className="font-mono text-cyan-300">0703 080 598 / 0717 356 578</p>
              </div>
              <div>
                <p className="font-semibold text-slate-200">WASREB Consumer Toll-Free:</p>
                <p className="font-mono text-cyan-300">0800 720 021</p>
              </div>
              <div>
                <p className="font-semibold text-slate-200">Nairobi City County:</p>
                <p className="font-mono text-slate-300">020 217 6655</p>
              </div>
            </div>
          </div>

          {/* Col 4: Privacy & Standards */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Data Protection & Privacy</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Designed in compliance with the Kenya Data Protection Act (2019). Resident contact details and household
              storage levels are strictly private and never published.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Consent-driven SMS alert dispatch</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 MajiWatch Nairobi. Built for public interest and household resilience.</p>
          <div className="flex items-center gap-4">
            <span>Kenya Public Interest Technology</span>
            <span>•</span>
            <span>Nairobi County</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
