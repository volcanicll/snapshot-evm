import { AlertCircle, CheckCircle2, Clock3, XCircle } from "lucide-react";

const statusConfig = {
  ready: {
    icon: Clock3,
    className: "text-amber-500",
    label: "Ready",
  },
  success: {
    icon: CheckCircle2,
    className: "text-emerald-500",
    label: "Success",
  },
  error: {
    icon: XCircle,
    className: "text-rose-500",
    label: "Failed",
  },
  voted: {
    icon: AlertCircle,
    className: "text-orange-500",
    label: "Voted",
  },
};

export function StatusBadge({ statusCode, statusMessage }) {
  if (!statusCode || !statusConfig[statusCode]) {
    return <span className="text-sm text-slate-400">Pending</span>;
  }

  const { icon: Icon, className, label } = statusConfig[statusCode];

  return (
    <div className="group relative inline-flex items-center justify-center">
      <div
        className={`inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold transition-transform duration-300 group-hover:scale-[1.03] dark:bg-slate-800 ${className}`}
      >
        <Icon size={16} />
        <span>{label}</span>
      </div>
      {statusMessage ? (
        <div className="pointer-events-none absolute left-full top-1/2 z-10 ml-3 hidden w-56 -translate-y-1/2 rounded-xl bg-slate-900 px-3 py-2 text-xs text-white shadow-xl group-hover:block">
          {statusMessage}
        </div>
      ) : null}
    </div>
  );
}
