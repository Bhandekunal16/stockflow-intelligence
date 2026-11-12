import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Server,
  Activity,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  FileCode,
} from 'lucide-react';
import { portfolioService } from '../services/portfolio.service';
import { useToast } from '../components/common/Toast';
import { PortfolioSnapshot } from '../types/portfolio.types';

interface OutletContextType {
  snapshots: PortfolioSnapshot[];
  refetch: () => Promise<void>;
}

export const Settings: React.FC = () => {
  const { snapshots, refetch } = useOutletContext<OutletContextType>();
  const { success, error: toastError } = useToast();

  const [checkingHealth, setCheckingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState<any>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;

  const handleTestHealth = async () => {
    try {
      setCheckingHealth(true);
      const res = await portfolioService.healthCheck();
      setHealthResult(res);
      success('API Online', 'Successfully connected to backend extraction engine.');
    } catch (err: any) {
      setHealthResult({ error: err.message || 'Failed to ping health check' });
      toastError('API Unreachable', err.message);
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleClearData = async () => {
    try {
      setIsClearing(true);
      await portfolioService.clearAllSnapshots();
      await refetch();
      setShowConfirmClear(false);
      success('Database Reset', 'All historical portfolio snapshots have been wiped.');
    } catch (err: any) {
      toastError('Reset Failed', err.message);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & API</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review backend endpoints, check live service health, and configure portfolio parameters.
        </p>
      </div>

      {/* Backend API Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Backend API Configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized Axios communication layer
              </p>
            </div>
          </div>
          <button
            onClick={handleTestHealth}
            disabled={checkingHealth}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-all border border-indigo-200 cursor-pointer disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
            {checkingHealth ? 'Pinging...' : 'Test Health (GET /)'}
          </button>
        </div>

        {/* Configuration details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 font-medium">Base URL</span>
            <p className="font-mono font-bold text-slate-800 mt-1 truncate">{apiBaseUrl}</p>
            <p className="text-[11px] text-slate-400 mt-1">Configured via VITE_API_BASE_URL</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 font-medium">Snapshot Indexing Timezone</span>
            <p className="font-mono font-bold text-slate-800 mt-1">Asia/Kolkata (IST)</p>
            <p className="text-[11px] text-slate-400 mt-1">One snapshot maintained per date</p>
          </div>
        </div>

        {/* Health Check Result */}
        {healthResult && (
          <div
            className={`p-4 rounded-xl border text-xs font-mono ${
              healthResult.success
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                : 'bg-rose-50/70 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2 font-bold mb-1">
              {healthResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>Health Check Status</span>
            </div>
            <pre className="text-[11px] mt-2 whitespace-pre-wrap">
              {JSON.stringify(healthResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Endpoints Table */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Registered API Endpoints
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-sans">
                <tr>
                  <th className="py-2.5 px-4">Method</th>
                  <th className="py-2.5 px-4">Endpoint</th>
                  <th className="py-2.5 px-4 font-sans">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-2.5 px-4 font-bold text-blue-600">GET</td>
                  <td className="py-2.5 px-4 text-slate-800">/</td>
                  <td className="py-2.5 px-4 font-sans text-slate-600">Health check & Service status</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-emerald-600">POST</td>
                  <td className="py-2.5 px-4 text-slate-800">/api/portfolio/extract</td>
                  <td className="py-2.5 px-4 font-sans text-slate-600">Extract portfolio from image (multipart/form-data)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-blue-600">GET</td>
                  <td className="py-2.5 px-4 text-slate-800">/api/portfolio</td>
                  <td className="py-2.5 px-4 font-sans text-slate-600">Retrieve all historical snapshots</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-bold text-blue-600">GET</td>
                  <td className="py-2.5 px-4 text-slate-800">/api/portfolio/:date</td>
                  <td className="py-2.5 px-4 font-sans text-slate-600">Retrieve date-specific snapshot (YYYY-MM-DD)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Database & Storage Management */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Database & Snapshot Management</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Currently holding{' '}
              <span className="font-bold text-slate-800">{snapshots.length}</span> recorded snapshot
              {snapshots.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="pt-2">
          {!showConfirmClear ? (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Reset All Snapshots
            </button>
          ) : (
            <div className="p-4 rounded-xl bg-rose-50/80 border border-rose-200 space-y-3">
              <p className="text-xs font-medium text-rose-900">
                Are you sure? This will permanently delete all stored snapshot records from disk.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearData}
                  disabled={isClearing}
                  className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  {isClearing ? 'Deleting...' : 'Yes, Delete All Data'}
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
