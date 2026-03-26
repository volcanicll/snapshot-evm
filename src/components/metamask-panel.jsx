import { useEffect, useState } from "react";
import { LoaderCircle, Wallet } from "lucide-react";
import { getConnectedAddress } from "../lib/wallet";
import { getVotingPower, hasVoted, voteOnProposal } from "../lib/snapshot";

export function MetamaskPanel({ proposals, onProposalUpdate, onResetStatuses }) {
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function syncAddress() {
      const nextAddress = await getConnectedAddress(true, false);
      if (mounted) {
        setAddress(nextAddress);
      }
    }

    syncAddress();

    if (!window.ethereum) {
      return () => {
        mounted = false;
      };
    }

    const handleAccountsChanged = (accounts) => {
      setAddress(accounts[0] ?? "");
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      mounted = false;
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, []);

  async function handleVote() {
    if (!address) {
      setAddress(await getConnectedAddress(true));
      return;
    }

    setSubmitting(true);
    onResetStatuses();

    try {
      const vpCache = new Map();

      for (const proposal of proposals) {
        if (!proposal.select) {
          continue;
        }

        const alreadyVoted = await hasVoted(address, proposal.id);

        if (alreadyVoted) {
          onProposalUpdate(proposal.id, {
            status_code: "voted",
            status_message: "The connected wallet has already voted on the proposal.",
          });
          continue;
        }

        if (!vpCache.has(proposal.space)) {
          const votingPower = await getVotingPower(proposal.id, address);
          vpCache.set(proposal.space, votingPower);
        }

        if (!vpCache.get(proposal.space)) {
          onProposalUpdate(proposal.id, {
            status_code: "error",
            status_message: "The connected wallet does not have voting power in the space.",
          });
          continue;
        }

        onProposalUpdate(proposal.id, {
          status_code: "ready",
          status_message: "MetaMask signature requested.",
        });

        const result = await voteOnProposal({ address }, proposal, true);
        onProposalUpdate(proposal.id, result);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="animate-enter-delay-2 flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:h-full">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Wallet Signing</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Submit in the selected order.</p>
          <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Wallet size={16} />
            <span className="truncate">{address || "No wallet connected"}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleVote}
          disabled={submitting}
          className="animate-gentle-pulse inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-sky-950"
        >
          {submitting ? <LoaderCircle className="animate-spin" size={16} /> : null}
          {address ? "Start voting" : "Connect MetaMask"}
        </button>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Selected proposals
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {proposals.filter((proposal) => proposal.select).length}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Active spaces
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              {new Set(proposals.filter((proposal) => proposal.select).map((proposal) => proposal.space)).size}
            </p>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Next action
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
            Connect your wallet and start voting.
          </p>
        </div>
      </div>
    </section>
  );
}
