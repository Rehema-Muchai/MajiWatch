import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { WaterVendor } from '../../types';
import { NAIROBI_AREAS } from '../../data/nairobiAreas';
import { Truck, ShieldCheck, Clock, CheckCircle2, AlertTriangle, PhoneCall, Save, MapPin } from 'lucide-react';

export const VendorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<WaterVendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [businessName, setBusinessName] = useState('');
  const [contactPhoneNumber, setContactPhoneNumber] = useState('');
  const [indicativePrice, setIndicativePrice] = useState(1.15);
  const [pricingUnit, setPricingUnit] = useState<'per_litre' | 'per_20l_container' | 'per_5000l_tanker' | 'per_10000l_tanker'>('per_litre');
  const [availabilityStatus, setAvailabilityStatus] = useState<'available_now' | 'limited_supply' | 'temporarily_closed'>('available_now');
  const [serviceAreaIds, setServiceAreaIds] = useState<string[]>(['kilimani', 'kileleshwa', 'westlands']);
  const [description, setDescription] = useState('');
  const [waterSource, setWaterSource] = useState('');
  const [operatingHours, setOperatingHours] = useState('6:00 AM - 9:00 PM Daily');

  const loadVendor = async () => {
    try {
      setLoading(true);
      const res = await api.getVendors();
      if (res.vendors && res.vendors.length > 0) {
        // Find vendor created by this user or default to first
        const found = res.vendors.find((v) => v.createdBy === user?.uid) || res.vendors[0];
        setVendor(found);
        setBusinessName(found.businessName);
        setContactPhoneNumber(found.contactPhoneNumber);
        setIndicativePrice(found.indicativePrice);
        setPricingUnit(found.pricingUnit);
        setAvailabilityStatus(found.availabilityStatus);
        setServiceAreaIds(found.serviceAreaIds);
        setDescription(found.description);
        setWaterSource(found.waterSource || '');
        setOperatingHours(found.operatingHours || '6:00 AM - 9:00 PM Daily');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendor();
  }, [user?.uid]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;

    try {
      setSaving(true);
      const res = await api.updateVendor(vendor.vendorId, {
        businessName,
        contactPhoneNumber,
        indicativePrice,
        pricingUnit,
        availabilityStatus,
        serviceAreaIds,
        description,
        waterSource,
        operatingHours,
      });
      setVendor(res.vendor);
      alert('Vendor listing updated and visible to Nairobi residents.');
    } catch (err: any) {
      alert(err.message || 'Failed to update vendor listing');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickAvailability = async (status: 'available_now' | 'limited_supply' | 'temporarily_closed') => {
    if (!vendor) return;
    try {
      setAvailabilityStatus(status);
      const res = await api.updateVendor(vendor.vendorId, { availabilityStatus: status });
      setVendor(res.vendor);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {businessName || 'Water Vendor Operations Portal'}
            </h1>
            <span className="bg-amber-100 text-amber-900 font-bold text-xs px-2.5 py-0.5 rounded-full">
              Water Supplier
            </span>
            {vendor?.verificationStatus === 'verified' && (
              <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Listing
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Manager: <span className="font-semibold text-slate-700">{user?.displayName}</span> • Keep your pricing,
            service areas, and availability updated for Nairobi residents
          </p>
        </div>

        {/* Quick status switch */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => handleQuickAvailability('available_now')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              availabilityStatus === 'available_now'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Available Now
          </button>
          <button
            onClick={() => handleQuickAvailability('limited_supply')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              availabilityStatus === 'limited_supply'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Limited Supply
          </button>
          <button
            onClick={() => handleQuickAvailability('temporarily_closed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              availabilityStatus === 'temporarily_closed'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Closed Today
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Manage Your Vendor Profile & Pricing</h2>
            <p className="text-xs text-slate-500">
              Provide accurate pricing and delivery options to assist households in planning water budgets
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business / Fleet Name *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Direct Contact Phone Number *</label>
                <input
                  type="text"
                  required
                  value={contactPhoneNumber}
                  onChange={(e) => setContactPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Indicative Price (KES) *</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={indicativePrice}
                  onChange={(e) => setIndicativePrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pricing Unit *</label>
                <select
                  value={pricingUnit}
                  onChange={(e) => setPricingUnit(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="per_litre">Per Litre (e.g. 1.15 KES/L)</option>
                  <option value="per_20l_container">Per 20L Refill Container (e.g. 50 KES)</option>
                  <option value="per_5000l_tanker">Per 5,000L Bowsers (e.g. 3,500 KES)</option>
                  <option value="per_10000l_tanker">Per 10,000L Bowsers (e.g. 6,500 KES)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Covered Nairobi Service Areas (Hold Ctrl/Cmd to select multiple) *
              </label>
              <select
                multiple
                required
                value={serviceAreaIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  setServiceAreaIds(selected);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 font-medium"
              >
                {NAIROBI_AREAS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.subCounty})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Water Source / Purification</label>
                <input
                  type="text"
                  placeholder="e.g. Certified Spring / Borehole with Chlorination"
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Description & Equipment Details</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#176B87] hover:bg-[#125368] disabled:opacity-50 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? 'Saving Changes...' : 'Save & Publish Listing Updates'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card (How residents see it) */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Resident Directory Preview</h2>
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-6 space-y-4 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-slate-900">{businessName || 'Your Business Name'}</h3>
                  {vendor?.verificationStatus === 'verified' && (
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    availabilityStatus === 'available_now'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {availabilityStatus.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{description || 'No description provided.'}</p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Price:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    KES {indicativePrice} {pricingUnit.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Source:</span>
                  <span className="font-medium text-slate-700">{waterSource || 'Certified Source'}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Hours:</span>
                  <span className="font-medium text-slate-700">{operatingHours}</span>
                </div>
              </div>

              <div className="text-xs">
                <span className="text-[11px] text-slate-400 font-medium block mb-1">Serving:</span>
                <div className="flex flex-wrap gap-1">
                  {serviceAreaIds.map((aid) => (
                    <span key={aid} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-medium">
                      {aid}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Preview Mode</span>
              <div className="bg-[#176B87] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 opacity-90">
                <PhoneCall className="w-3.5 h-3.5" />
                Call {contactPhoneNumber}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
