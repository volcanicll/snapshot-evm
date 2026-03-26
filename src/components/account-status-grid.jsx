import { StatusBadge } from "./status-badge";
import { spaceMap } from "../lib/spaces";

export function AccountStatusGrid({ accounts }) {
  if (!accounts.length) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {accounts.map((account, index) => (
        <article
          key={`${account.address}-${index}`}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500">
                Wallet {index + 1}
              </p>
              <p className="mt-2 line-clamp-2 break-all text-xs text-slate-500 dark:text-slate-400">
                {account.address}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {account.proposals.length}
            </span>
          </div>
          <div className="space-y-2">
            {account.proposals.map((proposal) => (
              <div
                key={`${account.address}-${proposal.id}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {spaceMap.get(proposal.space)?.name ?? proposal.space}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {proposal.title}
                  </p>
                </div>
                <StatusBadge statusCode={proposal.status_code} statusMessage={proposal.status_message} />
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
