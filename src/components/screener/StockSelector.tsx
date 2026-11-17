import React from 'react';
import { Search, Hash, AlertCircle } from 'lucide-react';
import {
  SCREENER_COMPANY_PRESETS,
  normalizeAndValidateCompanyCode,
} from '../../services/screener.service';
import {
  ScreenerConnectionStatus,
  ScreenerPollingInterval,
} from '../../types/screener.types';
import { StreamControls } from './StreamControls';

interface StockSelectorProps {
  activeCompanyCode: string;
  inputCode: string;
  onInputCodeChange: (code: string) => void;
  onSelectCompanyCode: (code: string) => void;
  intervalSeconds: ScreenerPollingInterval;
  onIntervalChange: (interval: ScreenerPollingInterval) => void;
  connectionStatus: ScreenerConnectionStatus;
  onFetchSnapshot: () => void;
  onStartStream: () => void;
  onStopStream: () => void;
  isFetchingSnapshot: boolean;
  lastReceivedAt: string | null;
}

export const StockSelector: React.FC<StockSelectorProps> = ({
  activeCompanyCode,
  inputCode,
  onInputCodeChange,
  onSelectCompanyCode,
  intervalSeconds,
  onIntervalChange,
  connectionStatus,
  onFetchSnapshot,
  onStartStream,
  onStopStream,
  isFetchingSnapshot,
  lastReceivedAt,
}) => {
  const codeCheck = normalizeAndValidateCompanyCode(inputCode);
  const codeError = !codeCheck.valid ? codeCheck.error : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeCheck.valid || isFetchingSnapshot) return;
    onInputCodeChange(codeCheck.companyCode);
    onFetchSnapshot();
  };

  return (
    <section
      aria-labelledby="stock-selector-heading"
      className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="w-10 h-10 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--accent-primary)] flex items-center justify-center flex-shrink-0"
          >
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 id="stock-selector-heading" className="text-base font-bold text-[var(--text-primary)]">
              Company Selection &amp; Stream Controls
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Enter a Screener company code (e.g. TATAGOLD, RELIANCE, TCS) to fetch snapshots and stream price updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] text-xs self-start sm:self-auto">
          <span className="text-[var(--text-secondary)]">Selected:</span>
          <span className="font-mono font-bold text-[var(--accent-primary)]">
            {activeCompanyCode}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Company Code Input */}
          <div className="lg:col-span-5 space-y-1.5">
            <label
              htmlFor="screener-company-input"
              className="block text-xs font-medium text-[var(--text-secondary)]"
            >
              Company Code
            </label>
            <div className="relative">
              <Hash
                className="w-4 h-4 text-[var(--text-secondary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="screener-company-input"
                type="text"
                value={inputCode}
                onChange={(e) =>
                  onInputCodeChange(e.target.value.trim().toUpperCase())
                }
                onBlur={() => {
                  const trimmed = inputCode.trim().toUpperCase();
                  if (trimmed !== inputCode) {
                    onInputCodeChange(trimmed);
                  }
                }}
                placeholder="TATAGOLD"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                aria-invalid={Boolean(codeError)}
                aria-describedby={codeError ? 'screener-code-error' : 'screener-code-hint'}
                className={`w-full pl-10 pr-3.5 py-2.5 min-h-[42px] rounded-xl bg-[var(--bg-canvas)] border text-xs font-mono font-semibold uppercase tracking-wide text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] ${
                  codeError ? 'border-[var(--status-error)]' : 'border-[var(--border-default)]'
                }`}
              />
            </div>
            {codeError ? (
              <p
                id="screener-code-error"
                className="flex items-center gap-1.5 text-[11px] text-[var(--status-error)]"
              >
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                <span>{codeError}</span>
              </p>
            ) : (
              <p id="screener-code-hint" className="text-[11px] text-[var(--text-secondary)]">
                Uppercase company code only (/^[A-Z0-9_-]+$/). Changing companies stops any active stream.
              </p>
            )}
          </div>

          {/* Quick Company Code Presets */}
          <div className="lg:col-span-7 space-y-1.5">
            <span className="block text-xs font-medium text-[var(--text-secondary)]">
              Quick Company Codes
            </span>
            <div className="flex flex-wrap items-center gap-2 min-h-[42px]">
              {SCREENER_COMPANY_PRESETS.map((preset) => {
                const isSelected = activeCompanyCode === preset.code;
                return (
                  <button
                    key={preset.code}
                    type="button"
                    onClick={() => onSelectCompanyCode(preset.code)}
                    title={preset.label}
                    className={`px-3 py-2 min-h-[38px] rounded-xl border text-xs font-mono font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/50 text-[var(--accent-primary)]'
                        : 'bg-[var(--bg-canvas)] border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/40'
                    }`}
                  >
                    {preset.code}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <StreamControls
          connectionStatus={connectionStatus}
          intervalSeconds={intervalSeconds}
          onIntervalChange={onIntervalChange}
          onFetchSnapshot={onFetchSnapshot}
          onStartStream={onStartStream}
          onStopStream={onStopStream}
          isFetchingSnapshot={isFetchingSnapshot}
          lastReceivedAt={lastReceivedAt}
          hasCodeError={Boolean(codeError)}
        />
      </form>
    </section>
  );
};
