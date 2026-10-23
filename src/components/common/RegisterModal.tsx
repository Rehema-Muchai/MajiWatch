import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { NAIROBI_AREAS } from '../../data/nairobiAreas';
import { UserRole } from '../../types';
import { UserPlus, X, CheckCircle, Shield } from 'lucide-react';

export const RegisterModal: React.FC<{ isOpen: boolean; onClose: () => void; onSuccess?: () => void }> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>('resident');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+254 ');
  const [preferredAreaId, setPreferredAreaId] = useState('kilimani');
  const [organisationName, setOrganisationName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [vendorBusinessName, setVendorBusinessName] = useState('');
  const [smsConsent, setSmsConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!displayName.trim()) {
      setError('Please provide your name');
      return;
    }

    try {
      setLoading(true);
      await register({
        displayName,
        email: email.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        role,
        preferredAreaId,
        organisationName: role === 'organisation' ? organisationName : undefined,
        companyName: role === 'property_manager' ? companyName : undefined,
        vendorBusinessName: role === 'vendor' ? vendorBusinessName : undefined,
        smsConsent,
      });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        <div className="bg-[#176B87] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan-200" />
            <h3 className="text-base font-bold">Join MajiWatch Nairobi</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {error && <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

          {/* Role selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              I am registering as:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'resident', label: 'Resident / Tenant' },
                { id: 'organisation', label: 'Water Utility Org' },
                { id: 'property_manager', label: 'Property Manager' },
                { id: 'vendor', label: 'Water Vendor' },
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id as UserRole)}
                  className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                    role === r.id
                      ? 'border-[#176B87] bg-cyan-50/60 text-[#176B87] font-bold shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {role === 'organisation' && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg mt-2 border border-amber-200">
                Notice: Organisation accounts require administrative verification before notices are badged as official.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name / Representative Name *</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Jane Muthoni or Eng. David Mwangi"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#176B87] focus:outline-hidden"
            />
          </div>

          {role === 'organisation' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organisation / Utility Name *</label>
              <input
                type="text"
                required
                value={organisationName}
                onChange={(e) => setOrganisationName(e.target.value)}
                placeholder="e.g. Nairobi City Water & Sewerage Co. (NCWSC)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#176B87] focus:outline-hidden"
              />
            </div>
          )}

          {role === 'property_manager' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company or Estate Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Greenstone Property Management"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#176B87] focus:outline-hidden"
              />
            </div>
          )}

          {role === 'vendor' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Water Business / Brand Name *</label>
              <input
                type="text"
                required
                value={vendorBusinessName}
                onChange={(e) => setVendorBusinessName(e.target.value)}
                placeholder="e.g. Maji Safi Clean Bowsers Ltd"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#176B87] focus:outline-hidden"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kenyan Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-[#176B87] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#176B87] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Nairobi Neighbourhood / Estate</label>
            <select
              value={preferredAreaId}
              onChange={(e) => setPreferredAreaId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#176B87] focus:outline-hidden"
            >
              {NAIROBI_AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.subCounty} ({a.zone} Zone)
                </option>
              ))}
            </select>
          </div>

          {/* SMS Consent */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={smsConsent}
                onChange={(e) => setSmsConsent(e.target.checked)}
                className="mt-0.5 rounded text-[#176B87] focus:ring-[#176B87]"
              />
              <span className="text-slate-700 leading-relaxed">
                I consent to receive important Nairobi water interruption notices and emergency restoration alerts via SMS.
                You can pause or unsubscribe anytime.
              </span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#176B87] hover:bg-[#125368] disabled:opacity-50 text-white text-xs font-semibold px-5 py-2 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
