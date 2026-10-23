import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Building, BuildingWaterUpdate } from '../../types';
import { NAIROBI_AREAS } from '../../data/nairobiAreas';
import {
  Building as BuildingIcon,
  Plus,
  Bell,
  Gauge,
  Truck,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-react';

export const PropertyManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [updates, setUpdates] = useState<BuildingWaterUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [showPostUpdateModal, setShowPostUpdateModal] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  const [newBuilding, setNewBuilding] = useState({
    name: '',
    generalLocation: '',
    serviceAreaId: 'kilimani',
    residentialUnitsCount: 24,
    tankCapacityLitres: 30000,
    currentTankLevelLitres: 20000,
    notes: '',
  });

  const [newUpdate, setNewUpdate] = useState({
    buildingId: '',
    title: '',
    description: '',
    updateType: 'rationing_schedule' as const,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [bldRes, updRes] = await Promise.all([api.getBuildings(), api.getBuildingUpdates()]);
      if (bldRes.buildings) setBuildings(bldRes.buildings);
      if (updRes.updates) setUpdates(updRes.updates);
    } catch (err) {
      console.error('Error loading property manager data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBuilding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBuilding(newBuilding);
      setShowAddBuildingModal(false);
      setNewBuilding({
        name: '',
        generalLocation: '',
        serviceAreaId: 'kilimani',
        residentialUnitsCount: 24,
        tankCapacityLitres: 30000,
        currentTankLevelLitres: 20000,
        notes: '',
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add building');
    }
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.buildingId) {
      alert('Please select a building');
      return;
    }
    try {
      await api.createBuildingUpdate(newUpdate.buildingId, newUpdate);
      setShowPostUpdateModal(false);
      setNewUpdate({
        buildingId: '',
        title: '',
        description: '',
        updateType: 'rationing_schedule',
      });
      await loadData();
      alert('Tenant water advisory published successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to post update');
    }
  };

  const handleQuickRefill = async (building: Building) => {
    const litres = prompt('Enter litres delivered by water bowser (e.g. 10000):', '10000');
    if (!litres) return;
    const added = Number(litres);
    const newLevel = Math.min(building.tankCapacityLitres, building.currentTankLevelLitres + added);
    try {
      // In real code update building
      building.currentTankLevelLitres = newLevel;
      await api.createBuildingUpdate(building.buildingId, {
        title: `Bowser Refill Received: +${added.toLocaleString()} Litres`,
        description: `Communal reservoir refilled by tanker bowser. Current tank level is at ${((newLevel / building.tankCapacityLitres) * 100).toFixed(0)}%.`,
        updateType: 'bowser_refill',
      });
      await loadData();
      alert('Tank level updated and tenant notice logged.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {user?.companyName || 'Property & Estate Water Management'}
            </h1>
            <span className="bg-teal-100 text-teal-800 font-bold text-xs px-2.5 py-0.5 rounded-full">
              Property Manager
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Manager: <span className="font-semibold text-slate-700">{user?.displayName}</span> • Managing communal
            reservoirs, tenant pumping schedules, and bowser deliveries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddBuildingModal(true)}
            className="bg-[#176B87] hover:bg-[#125368] text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Managed Property
          </button>
          <button
            onClick={() => setShowPostUpdateModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <Bell className="w-4 h-4" /> Issue Tenant Water Alert
          </button>
        </div>
      </div>

      {/* Buildings list */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Managed Residential Properties & Reservoirs</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {buildings.map((b) => {
            const pct = b.tankCapacityLitres > 0 ? (b.currentTankLevelLitres / b.tankCapacityLitres) * 100 : 0;
            return (
              <div key={b.buildingId} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                        <BuildingIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                        <p className="text-xs text-slate-500">{b.generalLocation} ({b.serviceAreaName})</p>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {b.residentialUnitsCount} Units
                    </span>
                  </div>

                  {b.notes && <p className="text-xs text-slate-500 italic">{b.notes}</p>}

                  {/* Communal tank status */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Communal Tank Storage</span>
                      <span className="font-mono font-bold text-slate-900">
                        {b.currentTankLevelLitres.toLocaleString()} / {b.tankCapacityLitres.toLocaleString()} L ({pct.toFixed(0)}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct > 50 ? 'bg-teal-500' : pct > 25 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">ID: {b.buildingId}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickRefill(b)}
                      className="px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-[#176B87] font-semibold text-xs rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" /> Log Bowser Refill
                    </button>
                    <button
                      onClick={() => {
                        setNewUpdate({ ...newUpdate, buildingId: b.buildingId });
                        setShowPostUpdateModal(true);
                      }}
                      className="px-3 py-1.5 bg-[#176B87] hover:bg-[#125368] text-white font-semibold text-xs rounded-lg transition-colors"
                    >
                      Alert Tenants
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Building water updates feed */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Recent Building Water Communications</h2>
          <p className="text-xs text-slate-500">
            Advisories broadcast to residents of your managed properties
          </p>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {updates.map((upd) => (
            <div key={upd.updateId} className="py-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{upd.title}</span>
                  <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                    {upd.buildingName}
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  {new Date(upd.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
              <p className="text-slate-600">{upd.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ADD BUILDING MODAL */}
      {showAddBuildingModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Register Managed Building</h3>
            <form onSubmit={handleCreateBuilding} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Building / Court Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kilimani Heights Apartments"
                  value={newBuilding.name}
                  onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nairobi Neighbourhood *</label>
                <select
                  value={newBuilding.serviceAreaId}
                  onChange={(e) => setNewBuilding({ ...newBuilding, serviceAreaId: e.target.value })}
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
                <label className="block font-semibold text-slate-700 mb-1">Road / General Location</label>
                <input
                  type="text"
                  placeholder="e.g. Dennis Pritt Road, Block B"
                  value={newBuilding.generalLocation}
                  onChange={(e) => setNewBuilding({ ...newBuilding, generalLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Residential Units Count</label>
                  <input
                    type="number"
                    min={1}
                    value={newBuilding.residentialUnitsCount}
                    onChange={(e) => setNewBuilding({ ...newBuilding, residentialUnitsCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Communal Tank Litres</label>
                  <input
                    type="number"
                    min={100}
                    value={newBuilding.tankCapacityLitres}
                    onChange={(e) => setNewBuilding({ ...newBuilding, tankCapacityLitres: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBuildingModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#176B87] hover:bg-[#125368] text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Register Building
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST UPDATE MODAL */}
      {showPostUpdateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Issue Tenant Water Alert</h3>
            <form onSubmit={handleCreateUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Building *</label>
                <select
                  required
                  value={newUpdate.buildingId}
                  onChange={(e) => setNewUpdate({ ...newUpdate, buildingId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">-- Select Managed Building --</option>
                  {buildings.map((b) => (
                    <option key={b.buildingId} value={b.buildingId}>
                      {b.name} ({b.generalLocation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alert Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Water Rationing Schedule: 6am-9am & 6pm-9pm"
                  value={newUpdate.title}
                  onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Update Type</label>
                <select
                  value={newUpdate.updateType}
                  onChange={(e) => setNewUpdate({ ...newUpdate, updateType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="rationing_schedule">Pumping / Rationing Schedule</option>
                  <option value="bowser_refill">Bulk Water Bowser Delivery</option>
                  <option value="pump_maintenance">Booster Pump Maintenance</option>
                  <option value="low_reserve_warning">Low Reserve Warning</option>
                  <option value="normal_supply">Normal Supply Resumed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tenant Advisory Details *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Inform tenants about pumping times, drinking water conservation, or expected tap pressure..."
                  value={newUpdate.description}
                  onChange={(e) => setNewUpdate({ ...newUpdate, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostUpdateModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Post Tenant Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
