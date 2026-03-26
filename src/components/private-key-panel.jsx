import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { getWallet, validatePrivateKey } from "../lib/wallet";
import { getVotingPower, hasVoted, voteOnProposal } from "../lib/snapshot";
import { AccountStatusGrid } from "./account-status-grid";

const privateKeysSchema = z.object({
  privateKeys: z
    .string()
    .min(1, "请至少输入一个私钥。")
    .transform((value) =>
      value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean)
    )
    .refine((keys) => keys.length > 0, "请至少输入一个私钥。")
    .refine((keys) => keys.every(validatePrivateKey), "存在无效私钥，请检查输入。"),
});

export function PrivateKeyPanel({ proposals, onProposalUpdate, onResetStatuses }) {
  const [accountStatuses, setAccountStatuses] = useState([]);

  const form = useForm({
    resolver: zodResolver(privateKeysSchema),
    defaultValues: {
      privateKeys: "",
    },
  });

  const parsedKeys = form.watch("privateKeys");

  const accounts = useMemo(() => {
    const lines = parsedKeys
      .split("\n")
      .map((item) => item.trim())
      .filter(validatePrivateKey);

    return lines.map((privateKey) => {
      const wallet = getWallet(privateKey);

      return {
        address: wallet.address,
        privateKey,
        proposals: proposals.map((proposal) => ({ ...proposal })),
      };
    });
  }, [parsedKeys, proposals]);

  useEffect(() => {
    setAccountStatuses(accounts);
  }, [accounts]);

  function updateAccountProposal(address, proposalId, updater) {
    setAccountStatuses((currentAccounts) =>
      currentAccounts.map((account) => {
        if (account.address !== address) {
          return account;
        }

        return {
          ...account,
          proposals: account.proposals.map((proposal) =>
            proposal.id === proposalId ? { ...proposal, ...updater } : proposal
          ),
        };
      })
    );
  }

  const handleVote = form.handleSubmit(async ({ privateKeys }) => {
    onResetStatuses();
    setAccountStatuses(accounts);

    for (const privateKey of privateKeys) {
      const wallet = getWallet(privateKey);
      const vpCache = new Map();

      for (const proposal of proposals) {
        if (!proposal.select) {
          continue;
        }

        const alreadyVoted = await hasVoted(wallet.address, proposal.id);

        if (alreadyVoted) {
          onProposalUpdate(proposal.id, {
            status_code: "voted",
            status_message: "This wallet has already voted on the proposal.",
          });
          updateAccountProposal(wallet.address, proposal.id, {
            status_code: "voted",
            status_message: "This wallet has already voted on the proposal.",
          });
          continue;
        }

        if (!vpCache.has(proposal.space)) {
          const votingPower = await getVotingPower(proposal.id, wallet.address);
          vpCache.set(proposal.space, votingPower);
        }

        if (!vpCache.get(proposal.space)) {
          onProposalUpdate(proposal.id, {
            status_code: "error",
            status_message: "This wallet does not have voting power in the space.",
          });
          updateAccountProposal(wallet.address, proposal.id, {
            status_code: "error",
            status_message: "This wallet does not have voting power in the space.",
          });
          continue;
        }

        onProposalUpdate(proposal.id, {
          status_code: "ready",
          status_message: "Ready to sign and submit.",
        });
        updateAccountProposal(wallet.address, proposal.id, {
          status_code: "ready",
          status_message: "Ready to sign and submit.",
        });

        const result = await voteOnProposal(
          { address: wallet.address, privateKey },
          proposal,
          false
        );

        onProposalUpdate(proposal.id, result);
        updateAccountProposal(wallet.address, proposal.id, result);
      }
    }
  });

  return (
    <section className="flex min-h-0 flex-col gap-4 lg:h-full">
      <div className="animate-enter-delay-2 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Private key signing</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">One private key per line.</p>
        </div>

        <form className="space-y-4" onSubmit={handleVote}>
          <textarea
            rows={8}
            {...form.register("privateKeys")}
            placeholder="One private key per line"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-inner transition focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-sky-950"
          />
          {form.formState.errors.privateKeys ? (
            <p className="text-sm text-rose-500">
              {form.formState.errors.privateKeys.message}
            </p>
          ) : null}
          {!form.formState.errors.privateKeys ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {accounts.length} wallets detected.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="animate-gentle-pulse inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-sky-950"
          >
            {form.formState.isSubmitting ? <LoaderCircle className="animate-spin" size={16} /> : null}
            Start voting
          </button>
        </form>
      </div>

      <div className="scrollbar-subtle min-h-0 pr-1 lg:flex-1 lg:overflow-auto">
        <AccountStatusGrid accounts={accountStatuses} />
      </div>
    </section>
  );
}
