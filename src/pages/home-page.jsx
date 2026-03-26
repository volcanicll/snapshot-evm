import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  LoaderCircle,
  Search,
  Vote,
} from "lucide-react";
import { fetchActiveProposalsForSelection } from "../lib/snapshot";
import { spacesList } from "../lib/spaces";
import { useAppStore } from "../store/app-store";
import { ProposalsTable } from "../components/proposals-table";
import { PrivateKeyPanel } from "../components/private-key-panel";
import { MetamaskPanel } from "../components/metamask-panel";
import { getConnectedAddress } from "../lib/wallet";

export function HomePage() {
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [spaceSearch, setSpaceSearch] = useState("");
  const signerPanelRef = useRef(null);
  const selectedSpace = useAppStore((state) => state.selectedSpace);
  const useMetamask = useAppStore((state) => state.useMetamask);
  const proposals = useAppStore((state) => state.proposals);
  const setSelectedSpace = useAppStore((state) => state.setSelectedSpace);
  const setUseMetamask = useAppStore((state) => state.setUseMetamask);
  const setProposals = useAppStore((state) => state.setProposals);
  const updateProposal = useAppStore((state) => state.updateProposal);
  const resetProposalStatuses = useAppStore((state) => state.resetProposalStatuses);
  const resetWorkspace = useAppStore((state) => state.resetWorkspace);

  const query = useQuery({
    queryKey: ["active-proposals", selectedSpace],
    enabled: selectedSpace !== "none",
    queryFn: () => fetchActiveProposalsForSelection(selectedSpace, spacesList),
  });

  useEffect(() => {
    if (query.data) {
      setProposals(query.data);
    } else if (selectedSpace === "none") {
      setProposals([]);
    }
  }, [query.data, selectedSpace, setProposals]);

  useEffect(() => {
    if (!window.ethereum) {
      return undefined;
    }

    const handleAccountsChanged = async () => {
      resetWorkspace();
      await getConnectedAddress(useMetamask);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, [resetWorkspace, useMetamask]);

  const selectedCount = useMemo(
    () => proposals.filter((proposal) => proposal.select).length,
    [proposals]
  );
  const activeSpaces = useMemo(() => new Set(proposals.map((proposal) => proposal.space)).size, [proposals]);
  const visibleProposals = useMemo(() => {
    return proposals.filter((proposal) => {
      if (showSelectedOnly && !proposal.select) {
        return false;
      }

      if (statusFilter === "all") {
        return true;
      }

      if (statusFilter === "pending") {
        return !proposal.status_code;
      }

      return proposal.status_code === statusFilter;
    });
  }, [proposals, showSelectedOnly, statusFilter]);

  const filteredSpaces = useMemo(() => {
    const keyword = spaceSearch.trim().toLowerCase();

    return spacesList
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name))
      .filter((space) => {
        if (!keyword) {
          return true;
        }

        return (
          space.name.toLowerCase().includes(keyword) ||
          space.id.toLowerCase().includes(keyword)
        );
      });
  }, [spaceSearch]);

  function applySelectionToVisible(mode) {
    for (const proposal of visibleProposals) {
      if (mode === "all") {
        updateProposal(proposal.id, { select: true });
      }

      if (mode === "invert") {
        updateProposal(proposal.id, { select: !proposal.select });
      }
    }
  }

  function focusSignerPanel() {
    signerPanelRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }

  return (
    <main className="mx-auto flex h-full max-w-[1440px] flex-col gap-3 px-4 pb-20 sm:px-6 lg:h-[calc(100vh-88px)] lg:min-h-0 lg:overflow-hidden lg:pb-6">
      <section className="animate-enter flex min-h-0 flex-1 flex-col gap-3 lg:min-h-0 lg:overflow-hidden xl:grid xl:grid-cols-[220px_minmax(0,1fr)_340px] xl:items-stretch">
        <aside className="hidden rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:flex xl:min-h-0 xl:flex-col">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Spaces</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Quick Select
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              <Search size={14} />
              <input
                value={spaceSearch}
                onChange={(event) => setSpaceSearch(event.currentTarget.value)}
                placeholder="Search spaces"
                className="w-full bg-transparent outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setSelectedSpace("all")}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition ${
                selectedSpace === "all"
                  ? "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              All Spaces
            </button>
          </div>

          <div className="scrollbar-subtle mt-4 min-h-0 flex-1 space-y-1 overflow-auto pr-1">
            {filteredSpaces.map((space) => (
                <button
                  key={space.id}
                  type="button"
                  onClick={() => setSelectedSpace(space.id)}
                  className={`w-full rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                    selectedSpace === space.id
                      ? "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  {space.name}
                </button>
              ))}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col gap-3 lg:min-h-0 lg:overflow-hidden">
          <section className="animate-enter-delay-1 shrink-0 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
                  Snapshot Voting
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  Vote Center
                </h2>
              </div>

              <div className="grid gap-3 lg:w-[520px] lg:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_auto]">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 xl:hidden">
                  <Search size={14} />
                  <input
                    value={spaceSearch}
                    onChange={(event) => setSpaceSearch(event.currentTarget.value)}
                    placeholder="Search spaces"
                    className="w-full bg-transparent outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="flex rounded-2xl border border-slate-300 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
                  <button
                    type="button"
                    onClick={() => setUseMetamask(true)}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      useMetamask
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    }`}
                  >
                    MetaMask
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseMetamask(false)}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      !useMetamask
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    }`}
                  >
                    Private Key
                  </button>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-950">
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {selectedCount} selected
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {activeSpaces} spaces
                  </span>
                </div>
              </div>
            </div>
          </section>

          {query.isLoading ? (
            <div className="flex items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-10 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <LoaderCircle className="animate-spin" size={18} />
              Loading active proposals...
            </div>
          ) : null}

          {query.isError ? (
            <div className="flex items-center gap-3 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
              <AlertTriangle size={18} />
              {query.error.message}
            </div>
          ) : null}

          {!query.isLoading && selectedSpace !== "none" && proposals.length === 0 ? (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 px-6 py-4 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
              No active proposals found, or all proposals may already be closed.
            </div>
          ) : null}

          <div className="flex min-h-0 flex-col gap-3 lg:min-h-0 lg:overflow-hidden">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="rounded-full bg-violet-50 px-3 py-1 font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                Active
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {proposals.length} proposals
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {selectedCount} selected
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{activeSpaces} spaces</span>
            </div>

            {proposals.length > 0 ? (
              <ProposalsTable
                proposals={visibleProposals}
                totalCount={proposals.length}
                selectedCount={selectedCount}
                showSelectedOnly={showSelectedOnly}
                statusFilter={statusFilter}
                useMetamask={useMetamask}
                onStatusFilterChange={setStatusFilter}
                onShowSelectedOnlyChange={() => setShowSelectedOnly((current) => !current)}
                onSelectAll={() => applySelectionToVisible("all")}
                onInvertSelection={() => applySelectionToVisible("invert")}
                onToggleSelect={(proposalId, checked) =>
                  updateProposal(proposalId, { select: checked })
                }
                onVoteChange={(proposalId, vote) => updateProposal(proposalId, { vote })}
              />
            ) : (
              <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/80 px-8 py-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/80 lg:min-h-0 lg:flex-1">
              <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    Select a space first
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Active proposals will appear here after you choose a space.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside ref={signerPanelRef} className="flex min-h-0 flex-col gap-3 lg:min-h-0 lg:overflow-hidden">
          {proposals.length > 0 ? (
            useMetamask ? (
              <MetamaskPanel
                proposals={proposals}
                onProposalUpdate={updateProposal}
                onResetStatuses={resetProposalStatuses}
              />
            ) : (
              <PrivateKeyPanel
                proposals={proposals}
                onProposalUpdate={updateProposal}
                onResetStatuses={resetProposalStatuses}
              />
            )
          ) : (
            <div className="animate-enter-delay-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Signing panel
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Wallet actions and voting status will appear here.
              </p>
            </div>
          )}
        </aside>
      </section>

      {selectedCount > 0 ? (
        <div className="animate-enter-delay-2 fixed inset-x-4 bottom-4 z-20 mx-auto max-w-5xl rounded-[1.25rem] bg-slate-950/90 px-4 py-4 text-white shadow-2xl shadow-slate-900/20 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-violet-600 px-2 text-xs font-semibold">
                  {selectedCount}
                </span>
                <div>
                  <p className="text-sm font-semibold">Proposals Selected</p>
                  <p className="text-xs text-slate-300">
                    {visibleProposals.length} proposals in the current result.
                  </p>
                </div>
              </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => applySelectionToVisible("invert")}
                className="rounded-full px-4 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Discard Selection
              </button>
              <button
                type="button"
                onClick={focusSignerPanel}
                className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                <Vote size={16} />
                Vote All ({selectedCount})
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
