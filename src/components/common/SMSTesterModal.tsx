import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { NotificationEvent } from '../../types';
import { Smartphone, Send, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, X, Radio } from 'lucide-react';
import { NAIROBI_AREAS } from '../../data/nairobiAreas';

export const SMSTesterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState('+254 712 345 678');
  const [selectedArea, setSelectedArea] = useState('Kilimani');
  const [customMessage, setCustomMessage] = useState(
    'MAJIWATCH: Planned interruption reported for Kilimani on Oct 24, from 08:00 AM. Expected restoration: Oct 25, 06:00 PM. Source: NCWSC. Updates: majiwatch.ke'
  );
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const [logs, setLogs] = useState<NotificationEvent[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await api.getNotifications();
      if (res.notifications) {
        setLogs(res.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendTest = async () => {
    try {
      setSending(true);
      const res = await api.sendTestSMS({
        rawPhoneNumber: phoneNumber,
        messageText: customMessage,
        targetArea: selectedArea,
      });
      setLastResult(res.dispatch);
      await fetchLogs();
    } catch (err: any) {
      alert('Failed to send SMS test: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#176B87] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Smartphone className="w-5 h-5 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">SMS Notification Gateway & Delivery Inspector</h3>
              <p className="text-xs text-cyan-100">
                Core accessibility channel for Nairobi residents without mobile internet
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Explanation Banner */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex items-start gap-3 text-xs text-cyan-900">
            <Radio className="w-5 h-5 text-[#176B87] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">Standardized MajiWatch SMS Format</p>
              <p className="leading-relaxed">
                Messages are concise, identifying the responsible source (utility vs property manager vs community report),
                start time, and expected restoration when provided. The adapter deduplicates broadcasts so identical alerts
                aren't resent.
              </p>
            </div>
          </div>

          {/* Test Dispatch Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Dispatch Test Alert</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Kenyan Phone Number</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#176B87] bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Nairobi Area</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#176B87] bg-white"
                >
                  {NAIROBI_AREAS.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({a.subCounty})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Message Content (Max 160 chars recommended)</label>
                <span className="text-[11px] text-slate-500">{customMessage.length} characters</span>
              </div>
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#176B87] bg-white font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Adapter: Simulation Mode (Active Safe Mode)</span>
              </div>
              <button
                onClick={handleSendTest}
                disabled={sending}
                className="bg-[#176B87] hover:bg-[#125368] disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? 'Dispatching...' : 'Dispatch Simulated SMS'}
              </button>
            </div>

            {lastResult && (
              <div
                className={`p-3 rounded-lg text-xs border ${
                  lastResult.status === 'deduplicated'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>Dispatch Result:</span>
                  <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-white font-mono border">
                    {lastResult.status}
                  </span>
                </div>
                <p>
                  Recipient: <span className="font-mono">{lastResult.recipientReference}</span> | Provider:{' '}
                  <span className="font-semibold">{lastResult.provider}</span>
                </p>
                {lastResult.providerMessageId && (
                  <p className="font-mono text-[11px] text-slate-600 mt-0.5">ID: {lastResult.providerMessageId}</p>
                )}
                {lastResult.error && <p className="text-amber-800 font-semibold mt-1">{lastResult.error}</p>}
              </div>
            )}
          </div>

          {/* Recent Notification Events */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>Recent SMS Broadcast Records</span>
                <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full text-[10px]">
                  {logs.length}
                </span>
              </h4>
              <button
                onClick={fetchLogs}
                disabled={loadingLogs}
                className="text-xs text-[#176B87] hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                Refresh Logs
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No SMS notifications recorded yet.</div>
              ) : (
                logs.map((log) => (
                  <div key={log.notificationId} className="p-3 text-xs hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{log.recipientArea}</span>
                        <span className="font-mono text-slate-500 text-[11px]">{log.recipientReference}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          log.status === 'delivered_simulated' || log.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'deduplicated'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-600 font-mono text-[11px] bg-slate-100/70 p-2 rounded my-1 border border-slate-200/50">
                      {log.messageText}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Provider: {log.provider}</span>
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
