import React, { useState, useEffect, useCallback } from 'react';
import { Server, Activity, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { portfolioService } from '../services/portfolio.service';
import { useToast } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';
import { PortfolioSnapshot } from '../types/portfolio.types';

interface OutletContextType {
  snapshots: PortfolioSnapshot[];
  refetch: () => Promise<void>;
}

type ServerStatus = 'checking' | 'up' | 'down';

export const Settings: React.FC = () => {
  const { snapshots, refetch } = useOutletContext<OutletContextType>();
  const { success, error: toastError } = useToast();

  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const checkServerStatus = useCallback(
    async (notify = false) => {
      try {
        setServerStatus('checking');
        const res = await portfolioService.healthCheck();
        // Consider server up if response succeeded (JSON success/status or valid response payload)
        const isUp =
          res === undefined || res === null
            ? false
            : typeof res === 'string'
            ? true
            : res.success !== false;

        if (isUp) {
          setServerStatus('up');
          setLastChecked(new Date().toLocaleTimeString());
          if (notify) {
            success('Server Online', 'Portfolio backend server is up and responding.');
          }
        } else {
          setServerStatus('down');
          setLastChecked(new Date().toLocaleTimeString());
          if (notify) {
            toastError('Server Offline', 'Backend server returned an unhealthy status.');
          }
        }
      } catch (err: any) {
        setServerStatus('down');
        setLastChecked(new Date().toLocaleTimeString());
        if (notify) {
          toastError('Server Unreachable', err.message || 'Unable to reach the server.');
        }
      }
    },
    [success, toastError]
  );

  useEffect(() => {
    checkServerStatus(false);
  }, [checkServerStatus]);

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
        <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">System Settings</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          Check live server availability and manage stored portfolio snapshots.
        </p>
      </div>

      {/* Server Status Card */}
      <section
        aria-labelledby="server-status-heading"
        className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0"
            >
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 id="server-status-heading" className="text-base font-bold text-[var(--text-primary)]">
                Server Status
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Live availability of the portfolio API service
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => checkServerStatus(true)}
            disabled={serverStatus === 'checking'}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-[var(--bg-elevated)]/70 hover:bg-[var(--bg-elevated)] text-[var(--accent-primary)] text-xs font-semibold transition-colors border border-[var(--border-default)] cursor-pointer disabled:opacity-50 self-start sm:self-auto"
          >
            <Activity
              aria-hidden="true"
              className={`w-3.5 h-3.5 ${serverStatus === 'checking' ? 'animate-spin' : ''}`}
            />
            <span>{serverStatus === 'checking' ? 'Checking...' : 'Check Status'}</span>
          </button>
        </div>

        {/* Simple Up / Down Status Indicator */}
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            serverStatus === 'up'
              ? 'bg-[var(--status-success)]/10 border-[var(--status-success)]/30 text-[var(--status-success)]'
              : serverStatus === 'down'
              ? 'bg-[var(--status-error)]/10 border-[var(--status-error)]/30 text-[var(--status-error)]'
              : 'bg-[var(--bg-canvas)] border-[var(--border-default)] text-[var(--status-info)]'
          }`}
        >
          <div className="flex items-center gap-3">
            {serverStatus === 'up' && (
              <CheckCircle2 className="w-5 h-5 text-[var(--status-success)] flex-shrink-0" aria-hidden="true" />
            )}
            {serverStatus === 'down' && (
              <AlertCircle className="w-5 h-5 text-[var(--status-error)] flex-shrink-0" aria-hidden="true" />
            )}
            {serverStatus === 'checking' && (
              <Activity
                className="w-5 h-5 text-[var(--status-info)] animate-spin flex-shrink-0"
                aria-hidden="true"
              />
            )}
            <div>
              <p className="text-sm font-bold">
                {serverStatus === 'up'
                  ? 'Server is Up'
                  : serverStatus === 'down'
                  ? 'Server is Down'
                  : 'Checking Server Status...'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {serverStatus === 'up'
                  ? 'The portfolio API is online and responding normally.'
                  : serverStatus === 'down'
                  ? 'The portfolio API is currently unreachable.'
                  : 'Verifying connection to the backend service...'}
              </p>
            </div>
          </div>

          {lastChecked && serverStatus !== 'checking' && (
            <span className="text-xs font-mono font-medium text-[var(--text-secondary)] whitespace-nowrap">
              Last checked: {lastChecked}
            </span>
          )}
        </div>
      </section>

      {/* Database & Storage Management */}
      <section
        aria-labelledby="storage-heading"
        className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="w-10 h-10 rounded-xl bg-[var(--status-error)]/10 border border-[var(--status-error)]/30 text-[var(--status-error)] flex items-center justify-center flex-shrink-0"
            >
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="storage-heading" className="text-base font-bold text-[var(--text-primary)]">
                Database &amp; Snapshot Management
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Currently holding{' '}
                <span className="font-bold font-mono text-[var(--text-primary)]">{snapshots.length}</span> recorded
                snapshot{snapshots.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmClear(true)}
            disabled={snapshots.length === 0}
            className="px-4 py-2 min-h-[40px] bg-[var(--status-error)]/10 border border-[var(--status-error)]/30 text-[var(--status-error)] hover:bg-[var(--status-error)]/20 text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed self-start sm:self-auto"
          >
            Reset All Snapshots
          </button>
        </div>
      </section>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmClear}
        onClose={() => !isClearing && setShowConfirmClear(false)}
        title="Confirm Snapshot Reset"
        titleId="confirm-reset-title"
        maxWidthClass="max-w-md"
        icon={<Trash2 className="w-5 h-5 text-[var(--status-error)]" aria-hidden="true" />}
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowConfirmClear(false)}
              disabled={isClearing}
              className="px-4 py-2 min-h-[40px] bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-xl text-xs font-semibold hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleClearData}
              disabled={isClearing}
              className="px-4 py-2 min-h-[40px] bg-[var(--status-error)] text-[var(--accent-contrast)] rounded-xl text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
            >
              {isClearing ? 'Deleting...' : 'Yes, Delete All Data'}
            </button>
          </>
        }
      >
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Are you sure you want to delete all{' '}
          <span className="font-semibold font-mono text-[var(--text-primary)]">{snapshots.length}</span> stored
          portfolio snapshot{snapshots.length !== 1 ? 's' : ''}? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};
