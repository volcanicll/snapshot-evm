import { StatusBadge } from "./status-badge";
import { spaceMap } from "../lib/spaces";

function formatTimestamp(timestamp) {
  return new Date(timestamp * 1000).toLocaleString();
}

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Ready", value: "ready" },
  { label: "Success", value: "success" },
  { label: "Failed", value: "error" },
  { label: "Already voted", value: "voted" },
];

export function ProposalsTable({
  proposals,
  totalCount,
  selectedCount,
  showSelectedOnly,
  statusFilter,
  useMetamask,
  onStatusFilterChange,
  onShowSelectedOnlyChange,
  onSelectAll,
  onInvertSelection,
  onToggleSelect,
  onVoteChange,
}) {
  return (
    <div className="flex min-h-[420px] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:h-full lg:min-h-0 lg:flex-1">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Proposal Queue
          </h3>
        </div>
        <div className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
          {proposals.length} / {totalCount}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onSelectAll}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-violet-700 dark:hover:text-violet-300"
        >
          Select all
        </button>
        <button
          type="button"
          onClick={onInvertSelection}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-violet-700 dark:hover:text-violet-300"
        >
          Invert result
        </button>
        <button
          type="button"
          onClick={onShowSelectedOnlyChange}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            showSelectedOnly
              ? "bg-violet-600 text-white"
              : "border border-slate-300 text-slate-700 hover:border-violet-300 hover:text-violet-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-violet-700 dark:hover:text-violet-300"
          }`}
        >
          Selected only
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.currentTarget.value)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-b border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        {selectedCount} selected, {proposals.length} in current result.
      </div>

      {proposals.length === 0 ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-10 text-center">
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              No proposals match the current filters
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Clear filters or disable selected-only mode to see more proposals.
            </p>
          </div>
        </div>
      ) : null}

      <div className="space-y-2 p-3 lg:hidden">
        {proposals.map((proposal) => (
          <article
            key={proposal.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition duration-300 hover:border-violet-200 dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-slate-900 dark:bg-white" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {spaceMap.get(proposal.space)?.name ?? proposal.space}
                  </p>
                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                    {proposal.status_code === "success" ? "success" : "active"}
                  </span>
                </div>
                <a
                  href={`https://snapshot.org/#/${proposal.space}/proposal/${proposal.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 block text-sm font-semibold leading-5 text-slate-900 transition hover:text-violet-600 dark:text-white"
                >
                  {proposal.title}
                </a>
              </div>
              <input
                type="checkbox"
                checked={proposal.select}
                onChange={(event) =>
                  onToggleSelect(proposal.id, event.currentTarget.checked)
                }
                className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <StatusBadge
                statusCode={proposal.status_code}
                statusMessage={proposal.status_message}
              />
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  Ends In
                </p>
                <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
                  {formatTimestamp(proposal.end)}
                </p>
              </div>
            </div>

            <div className="mt-3">
              <div className="min-w-[120px]">
                {proposal.type === "single-choice" || proposal.type === "basic" ? (
                  <select
                    value={proposal.vote}
                    onChange={(event) =>
                      onVoteChange(proposal.id, event.currentTarget.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm focus:border-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    {proposal.choices.map((choice, index) => (
                      <option key={`${proposal.id}-${choice}`} value={index + 1}>
                        {choice}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    All choices
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className={`scrollbar-subtle hidden min-h-0 flex-1 overflow-auto px-3 py-3 lg:block ${proposals.length === 0 ? "hidden" : ""}`}>
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <article
              key={proposal.id}
              className="rounded-[1.25rem] border border-slate-200 bg-slate-50/80 p-4 transition duration-300 hover:border-violet-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="grid gap-3 xl:grid-cols-[24px_minmax(0,1fr)_160px] xl:items-center">
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    checked={proposal.select}
                    onChange={(event) =>
                      onToggleSelect(proposal.id, event.currentTarget.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="h-4 w-4 rounded-full bg-slate-900 dark:bg-white" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {spaceMap.get(proposal.space)?.name ?? proposal.space}
                    </span>
                    <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                      {proposal.status_code === "success" ? "success" : "active"}
                    </span>
                  </div>
                  <a
                    href={`https://snapshot.org/#/${proposal.space}/proposal/${proposal.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-lg font-semibold leading-6 text-slate-900 transition hover:text-violet-600 dark:text-white dark:hover:text-violet-300"
                  >
                    {proposal.title}
                  </a>
                  <div className="mt-2.5 flex flex-wrap items-center gap-3">
                    <StatusBadge
                      statusCode={proposal.status_code}
                      statusMessage={proposal.status_message}
                    />
                    <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      Ends {formatTimestamp(proposal.end)}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-white px-3 py-3 dark:bg-slate-900">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Choice
                  </p>
                  <div className="mt-2">
                  {proposal.type === "single-choice" || proposal.type === "basic" ? (
                    <select
                      value={proposal.vote}
                      onChange={(event) =>
                        onVoteChange(proposal.id, event.currentTarget.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-violet-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    >
                      {proposal.choices.map((choice, index) => (
                        <option key={`${proposal.id}-${choice}`} value={index + 1}>
                          {choice}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      All choices
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      {useMetamask ? (
        <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          MetaMask signatures will open in sequence.
        </div>
      ) : null}
    </div>
  );
}
