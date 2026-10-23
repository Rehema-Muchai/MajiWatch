import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { WaterNotice } from '../../types';
import { NAIROBI_AREAS } from '../../data/nairobiAreas';
import {
  Droplets,
  Bell,
  Smartphone,
  Gauge,
  Wallet,
  Truck,
  Building,
  ShieldCheck,
  Search,
  ChevronRight,
  Clock,
  MapPin,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreNotices: () => void;
  onSelectNotice: (notice: WaterNotice) => void;
  onOpenSMSTester: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreNotices,
  onSelectNotice,
  onOpenSMSTester,
}) => {
  const [notices, setNotices] = useState<WaterNotice[]>([]);
  const [searchArea, setSearchArea] = useState('all');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    api.getNotices().then((res) => {
      if (res.notices) setNotices(res.notices.slice(0, 4));
    });
  }, []);

  const filteredNotices =
    searchArea === 'all' ? notices : notices.filter((n) => n.affectedAreaIds.includes(searchArea));

  const faqs = [
    {
      q: 'Does MajiWatch replace Nairobi City Water & Sewerage Company (NCWSC)?',
      a: 'No. MajiWatch is an independent collaborative civic platform designed to complement water utilities, property managers, and community members. It consolidates verified public notices, enables SMS notifications for residents without internet, and provides household reserve management.',
    },
    {
      q: 'How do SMS alerts work for residents without smartphones or mobile internet?',
      a: "Residents can register their Kenyan phone number and select their residential estate or sub-county. When an authorised utility or property manager publishes a relevant notice, MajiWatch automatically dispatches a concise SMS with start time, affected areas, and expected restoration.",
    },
    {
      q: 'How does notice verification work on MajiWatch?',
      a: 'Every notice is transparently badged: "Official Utility" (verified water providers like NCWSC), "Organisation Verified" (approved community water boards or property managers), or "Community Reported" (resident incident reports currently under review).',
    },
    {
      q: 'How does the household water reserve and consumption calculator help me?',
      a: 'You can record your storage containers (e.g. 2,500L poly tank, underground sump, or drum) and daily family consumption. MajiWatch calculates exactly how many days of water you have remaining during rationing periods and alerts you when reserves drop low.',
    },
    {
      q: 'Can MajiWatch test my water quality or detect contamination?',
      a: 'No. MajiWatch does not perform laboratory chemical testing. If you observe cloudy water, unusual odors, or contamination concerns, our platform provides direct channels to report the issue to the public health authorities and NCWSC laboratory.',
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cyan-900 via-[#176B87] to-[#125368] text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 shadow-inner">
        {/* Background water pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-cyan-200 border border-white/15">
            <Droplets className="w-4 h-4 text-cyan-300" />
            <span>Nairobi County Water Information & Resilience System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Stay Informed. Plan Ahead. <br className="hidden sm:inline" />
            <span className="text-cyan-300">Manage Water Better.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-cyan-100 font-normal leading-relaxed">
            Connecting Nairobi residents and participating water organisations through accessible supply updates, SMS
            alerts for offline households, storage reserve planning, and verified vendor directories.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-7 py-3 rounded-xl transition-all shadow-lg shadow-amber-900/20 text-sm flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreNotices}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all border border-white/20 text-sm backdrop-blur-xs flex items-center justify-center gap-2"
            >
              <span>Explore Active Notices</span>
            </button>
            <button
              onClick={onOpenSMSTester}
              className="w-full sm:w-auto bg-emerald-600/80 hover:bg-emerald-600 text-white font-semibold px-5 py-3 rounded-xl transition-all border border-emerald-400/30 text-sm flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              <span>Preview SMS Alerts</span>
            </button>
          </div>

          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-white/10 max-w-4xl mx-auto">
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-black text-white">24 Estates</p>
              <p className="text-xs text-cyan-200">Covered Across Nairobi</p>
            </div>
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-black text-white">SMS First</p>
              <p className="text-xs text-cyan-200">Accessible Without Internet</p>
            </div>
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-black text-white">100% Verified</p>
              <p className="text-xs text-cyan-200">Distinguishing Official Notices</p>
            </div>
            <div className="p-2">
              <p className="text-xl sm:text-2xl font-black text-white">Household Tools</p>
              <p className="text-xs text-cyan-200">Tank Reserves & Budgeting</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Notice Board Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-lg font-bold text-slate-900">Current Nairobi Water Notices</h2>
              </div>
              <p className="text-xs text-slate-500">
                Live interruption schedules, maintenance alerts, and restoration updates from authorised providers
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={searchArea}
                onChange={(e) => setSearchArea(e.target.value)}
                className="w-full sm:w-60 text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#176B87]"
              >
                <option value="all">All Nairobi Neighbourhoods</option>
                {NAIROBI_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.subCounty})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
            {filteredNotices.map((n) => (
              <div
                key={n.noticeId}
                onClick={() => onSelectNotice(n)}
                className="p-4 rounded-xl border border-slate-200 hover:border-[#176B87] hover:shadow-md transition-all cursor-pointer bg-slate-50/50 hover:bg-white flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        n.noticeType === 'planned_interruption'
                          ? 'bg-amber-100 text-amber-800'
                          : n.noticeType === 'unexpected_interruption'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {n.noticeType.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{n.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{n.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-700 truncate max-w-[180px]">
                    {n.sourceOrganisationName}
                  </span>
                  <span className="text-[#176B87] font-semibold flex items-center gap-1 hover:underline">
                    View Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-6">
            <button
              onClick={onExploreNotices}
              className="text-xs font-bold text-[#176B87] hover:underline inline-flex items-center gap-1.5"
            >
              <span>View all active notices & rationing schedules</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* The Problem & The Solution */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">The Nairobi Water Challenge</h2>
          <p className="text-sm text-slate-600">
            Rapid urbanisation and supply-demand deficits create unpredictable rationing, fragmented communication, and
            costly coping mechanisms. MajiWatch bridges the gap.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Uncertain Rationing Schedules</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Taps run dry without advance warning, leaving households unable to fill overhead tanks or plan drinking water
              needs for days.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-[#176B87] flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Internet & Social Media Silos</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Utility tweets and Facebook posts miss the majority of tenants who do not browse social media during outages or
              have limited mobile data.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">High Emergency Bowser Costs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Households spend thousands of shillings on unvetted bowsers and 20L containers without transparent pricing or
              verifiable water sources.
            </p>
          </div>
        </div>
      </section>

      {/* Core Modules Grid */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#176B87]">Integrated Platform</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Built for Residents & Organisations</h2>
            <p className="text-sm text-slate-600">
              A comprehensive toolkit for household resilience and municipal communication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. SMS Channel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">SMS Outage Alerts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct SMS notifications for your specific estate with planned start time, expected restoration, and official
                source attribution.
              </p>
            </div>

            {/* 2. Water Reserve Tracker */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-[#176B87] flex items-center justify-center">
                <Gauge className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Tank Reserve & Consumption Gauge</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track rooftop poly tanks, underground sumps, and drums in litres. Automatic estimation of days remaining
                based on your daily household usage.
              </p>
            </div>

            {/* 3. Budget & Expenditure */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Household Water Budgeting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log utility bills, vendor refills, and bowser costs in Kenyan Shillings. Interactive charts reveal spending
                trends and budget limits.
              </p>
            </div>

            {/* 4. Alternative Vendor Directory */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Verified Vendor Directory</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Find licensed water bowsers and refill kiosks in your estate with transparent prices per litre/tanker and
                live availability statuses.
              </p>
            </div>

            {/* 5. Issue Reporting */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Community Issue Reporting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Report burst mains, unreturned supply, or schedule discrepancies. Issues are reviewed by moderators and
                referred to NCWSC crews.
              </p>
            </div>

            {/* 6. Property Manager Portal */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Property & Estate Coordination</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Landlords and property managers can manage communal tanks, announce pumping hours, and schedule bowser
                refills for their apartment units.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SMS Accessibility Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#176B87] to-[#2A9D8F] rounded-3xl text-white p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold text-cyan-100">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Offline Accessibility First</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              Reaching Nairobi Households Without Reliable Mobile Data
            </h2>
            <p className="text-sm text-cyan-100 leading-relaxed">
              MajiWatch was architected with Kenya's communications reality in mind. Essential water interruption and
              restoration alerts are formatted into concise SMS notifications that reach any basic handset across Nairobi.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onOpenSMSTester}
                className="bg-white text-[#176B87] hover:bg-cyan-50 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Test SMS Simulator Now
              </button>
            </div>
          </div>

          <div className="w-full lg:w-96 bg-slate-900/90 rounded-2xl p-5 border border-white/20 shadow-2xl font-mono text-xs text-emerald-400 space-y-3">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-700 pb-2">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Bell className="w-3.5 h-3.5 text-cyan-400" />
                MAJIWATCH SMS PREVIEW
              </span>
              <span className="text-[10px]">Just Now</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/80 text-white font-sans text-xs leading-relaxed">
              <p className="font-bold text-amber-300 mb-1">MAJIWATCH NOTICE:</p>
              <p>
                Planned interruption for Kilimani & Kileleshwa from 08:00 AM. Expected restoration: Oct 25, 06:00 PM.
                Source: NCWSC. Updates: majiwatch.ke
              </p>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Delivery Status: DELIVERED</span>
              <span className="text-emerald-400 font-bold">160 Chars</span>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-600">Common questions about MajiWatch data, utilities, and privacy</p>
        </div>

        <div className="space-y-3 pt-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-[#176B87] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Emergency Utility Hotlines Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-center md:justify-start gap-2">
              <PhoneCall className="w-4 h-4 text-[#176B87]" />
              Official Emergency Utility Contacts (Nairobi County)
            </h3>
            <p className="text-xs text-slate-500">
              For active major bursts, sewer emergencies, or direct meter queries, contact the authorized providers:
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">NCWSC Call Centre</span>
              <span className="font-bold text-slate-800 font-mono">0703 080 598 / 0717 356 578</span>
            </div>
            <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px]">WASREB Consumer Toll-Free</span>
              <span className="font-bold text-slate-800 font-mono">0800 720 021</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
