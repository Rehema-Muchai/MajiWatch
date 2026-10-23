import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Droplets,
  Bell,
  User,
  Shield,
  Building,
  Truck,
  Home,
  Menu,
  X,
  LogOut,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '../../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenRegister: () => void;
  onOpenSMSTester: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenRegister,
  onOpenSMSTester,
}) => {
  const { user, switchRole, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'resident':
        return <span className="bg-sky-100 text-[#176B87] font-semibold px-2 py-0.5 rounded text-xs">Resident</span>;
      case 'organisation':
        return <span className="bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded text-xs">Water Utility</span>;
      case 'property_manager':
        return <span className="bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded text-xs">Property Manager</span>;
      case 'vendor':
        return <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded text-xs">Water Vendor</span>;
      case 'admin':
        return <span className="bg-purple-100 text-purple-900 font-semibold px-2 py-0.5 rounded text-xs">Platform Admin</span>;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#176B87] to-[#2A9D8F] flex items-center justify-center text-white shadow-md shadow-cyan-900/10">
              <Droplets className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-[#176B87]">MajiWatch</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                  Nairobi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">Stay Informed. Plan Ahead. Manage Water Better.</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'landing' ? 'bg-[#176B87]/10 text-[#176B87] font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('notices')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'notices' ? 'bg-[#176B87]/10 text-[#176B87] font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Water Notices
            </button>
            <button
              onClick={() => onNavigate('vendors')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'vendors' ? 'bg-[#176B87]/10 text-[#176B87] font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Find Vendors
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'dashboard' ? 'bg-[#176B87] text-white shadow-xs' : 'text-slate-700 font-semibold hover:bg-slate-100'
              }`}
            >
              Dashboard
            </button>
          </nav>

          {/* Right Side: User Profile & Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/80"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#176B87]/10 text-[#176B87] flex items-center justify-center font-bold text-sm">
                    {user.displayName.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1.5">
                      {user.displayName}
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{user.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email || user.phoneNumber}</p>
                      <div className="mt-1 flex items-center justify-between">
                        {getRoleBadge(user.role)}
                        {user.preferredAreaName && (
                          <span className="text-[11px] text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#2A9D8F]" />
                            {user.preferredAreaName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="px-2 py-1">
                      <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Switch Role (Demo)
                      </p>
                      <button
                        onClick={() => {
                          switchRole('resident');
                          setUserDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                      >
                        <Home className="w-3.5 h-3.5 text-[#176B87]" />
                        Resident (Jane Muthoni)
                      </button>
                      <button
                        onClick={() => {
                          switchRole('organisation');
                          setUserDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                      >
                        <Droplets className="w-3.5 h-3.5 text-indigo-600" />
                        Water Utility (NCWSC)
                      </button>
                      <button
                        onClick={() => {
                          switchRole('property_manager');
                          setUserDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                      >
                        <Building className="w-3.5 h-3.5 text-teal-600" />
                        Property Manager (Alice)
                      </button>
                      <button
                        onClick={() => {
                          switchRole('vendor');
                          setUserDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                      >
                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                        Water Vendor (Peter)
                      </button>
                      <button
                        onClick={() => {
                          switchRole('admin');
                          setUserDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-slate-100 text-slate-700 flex items-center gap-2"
                      >
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                        Administrator (Moderator)
                      </button>
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1 px-2">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenSMSTester();
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 rounded flex items-center gap-2 font-medium"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        SMS Gateway Simulator
                      </button>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          onNavigate('landing');
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenRegister}
                className="bg-[#176B87] hover:bg-[#125368] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-xs"
              >
                Sign In / Register
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-3 space-y-1">
            <button
              onClick={() => {
                onNavigate('landing');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 font-medium hover:bg-slate-100 rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('notices');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 font-medium hover:bg-slate-100 rounded-lg"
            >
              Water Notices
            </button>
            <button
              onClick={() => {
                onNavigate('vendors');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-slate-700 font-medium hover:bg-slate-100 rounded-lg"
            >
              Find Water Vendors
            </button>
            <button
              onClick={() => {
                onNavigate('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-[#176B87] hover:bg-cyan-50 rounded-lg"
            >
              Open Dashboard ({user?.role.replace('_', ' ') || 'Guest'})
            </button>
            <button
              onClick={() => {
                onOpenSMSTester();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg"
            >
              Test SMS Alerts Gateway
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
