import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  ShieldAlert,
  Wifi,
  XCircle,
} from "lucide-react";
import { displayValue, toBooleanFlag } from "../../utils/displayValue";

const statusStyles = {
  live: "border-red-300 bg-red-50 text-red-700",
  paper: "border-sky-300 bg-sky-50 text-sky-700",
  connected: "border-emerald-300 bg-emerald-50 text-emerald-700",
  verified: "border-emerald-300 bg-emerald-50 text-emerald-700",
  ready: "border-emerald-300 bg-emerald-50 text-emerald-700",
  active: "border-emerald-300 bg-emerald-50 text-emerald-700",
  success: "border-emerald-300 bg-emerald-50 text-emerald-700",
  rejected: "border-red-300 bg-red-50 text-red-700",
  error: "border-red-300 bg-red-50 text-red-700",
  failed: "border-red-300 bg-red-50 text-red-700",
  missing: "border-amber-300 bg-amber-50 text-amber-800",
  warning: "border-amber-300 bg-amber-50 text-amber-800",
  paused: "border-slate-300 bg-slate-50 text-slate-700",
  unknown: "border-slate-300 bg-slate-50 text-slate-700",
};

const normalizeStatus = (value) => String(value || "unknown").toLowerCase().replace(/\s+/g, "_");

export const StatusBadge = ({ value, label, tone, className = "" }) => {
  const key = tone || normalizeStatus(value);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-normal ${statusStyles[key] || statusStyles.unknown} ${className}`}
    >
      {key === "connected" || key === "verified" || key === "ready" ? <CheckCircle2 size={13} /> : null}
      {key === "error" || key === "failed" || key === "rejected" ? <XCircle size={13} /> : null}
      {key === "live" || key === "warning" || key === "missing" ? <AlertTriangle size={13} /> : null}
      {displayValue(label ?? value)}
    </span>
  );
};

export const InlineError = ({ message }) => {
  if (!message) return null;
  return <p className="mt-1 text-sm font-medium normal-case text-red-600">{message}</p>;
};

export const LoadingState = ({ label = "Loading..." }) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
    <Loader2 className="animate-spin text-[#FF5733]" size={28} />
    <p className="text-sm font-semibold normal-case">{label}</p>
  </div>
);

export const ErrorState = ({ title = "Unable to load data", message, onRetry }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 p-5 normal-case text-red-800">
    <div className="flex items-start gap-3">
      <XCircle className="mt-0.5 shrink-0" size={20} />
      <div>
        <p className="font-bold">{title}</p>
        {message ? <p className="mt-1 text-sm">{message}</p> : null}
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            Retry
          </button>
        ) : null}
      </div>
    </div>
  </div>
);

export const EmptyState = ({ title, description, actions }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center normal-case">
    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0EC] text-[#FF5733]">
      <ShieldAlert size={24} />
    </div>
    <h3 className="text-lg font-bold text-[#0A1438]">{title}</h3>
    {description ? <p className="mx-auto mt-2 max-w-xl text-sm text-[#4B5675]">{description}</p> : null}
    {actions ? <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{actions}</div> : null}
  </div>
);

export const RiskSummaryCard = ({ strategy = {}, user = {}, compact = false }) => {
  const isLive = toBooleanFlag(strategy.live);
  const dayLoss = user.day_loss_limit || user.max_loss || user.maxLoss || "";
  const tradeLimit = user.trade_limit || user.max_trades || user.maxTrades || "";
  const quantity = strategy.lot || strategy.quantity || strategy.qty || "";
  const missing = [
    !dayLoss ? "day loss limit" : "",
    !tradeLimit ? "trade limit" : "",
    !quantity ? "strategy quantity" : "",
  ].filter(Boolean);

  return (
    <div className={`rounded-lg border ${isLive ? "border-red-200 bg-red-50" : "border-sky-200 bg-sky-50"} p-4 normal-case`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#0A1438]">Risk summary</p>
          <p className="text-xs text-[#4B5675]">
            {isLive ? "Live orders can reach your broker account." : "Paper orders stay simulated."}
          </p>
        </div>
        <StatusBadge value={isLive ? "Live" : "Paper"} tone={isLive ? "live" : "paper"} />
      </div>
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}>
        <div>
          <p className="text-xs font-semibold uppercase text-[#79829E]">Max loss</p>
          <p className="font-bold text-[#252F4A]">{displayValue(dayLoss) || "Not set"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-[#79829E]">Max trades</p>
          <p className="font-bold text-[#252F4A]">{displayValue(tradeLimit) || "Not set"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-[#79829E]">Quantity / lots</p>
          <p className="font-bold text-[#252F4A]">{displayValue(quantity) || "Not set"}</p>
        </div>
      </div>
      {missing.length ? (
        <p className="mt-3 text-sm font-semibold text-red-700">
          Missing risk guardrails: {missing.join(", ")}.
        </p>
      ) : null}
    </div>
  );
};

export const ConfirmLiveActionModal = ({ open, strategy, user, onCancel, onConfirm, isSubmitting }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-xl rounded-lg bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-red-100 p-2 text-red-700">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0A1438]">Confirm live strategy start</h2>
            <p className="mt-1 text-sm normal-case text-[#4B5675]">
              This action can send real orders through the connected broker. Review risk settings before continuing.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <RiskSummaryCard strategy={strategy} user={user} />
        </div>
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold normal-case text-red-800">
          Start only if broker connection, websocket feed, and risk limits are ready.
        </div>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-[#252F4A] hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-md bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Starting..." : "Start Live Strategy"}
          </button>
        </div>
      </div>
    </div>
  );
};

export const MetricCard = ({ label, value, status, icon }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase text-[#79829E]">{label}</p>
        <p className="mt-2 text-2xl font-bold normal-case text-[#0A1438]">{displayValue(value)}</p>
      </div>
      <div className="rounded-md bg-[#FFF0EC] p-2 text-[#FF5733]">{icon || <Wifi size={18} />}</div>
    </div>
    {status ? <div className="mt-3"><StatusBadge value={status} /></div> : null}
  </div>
);

export const ExportButton = ({ onClick, disabled, label = "Export CSV" }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center justify-center gap-2 rounded-md border border-[#FF5733] px-4 py-2 text-sm font-bold text-[#FF5733] hover:bg-[#FFF0EC] disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Download size={16} />
    {label}
  </button>
);
