import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAppStore = create()(
  persist(
    (set) => ({
      theme: "light",
      useMetamask: true,
      selectedSpace: "none",
      proposals: [],
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      setUseMetamask: (useMetamask) => set({ useMetamask }),
      setSelectedSpace: (selectedSpace) => set({ selectedSpace }),
      setProposals: (proposals) => set({ proposals }),
      updateProposal: (proposalId, updater) =>
        set((state) => ({
          proposals: state.proposals.map((proposal) =>
            proposal.id === proposalId ? { ...proposal, ...updater } : proposal
          ),
        })),
      resetProposalStatuses: () =>
        set((state) => ({
          proposals: state.proposals.map((proposal) => ({
            ...proposal,
            status_code: "",
            status_message: "",
          })),
        })),
      resetWorkspace: () =>
        set({
          selectedSpace: "none",
          proposals: [],
        }),
    }),
    {
      name: "snapshot-react-app",
      partialize: (state) => ({
        theme: state.theme,
        useMetamask: state.useMetamask,
      }),
    }
  )
);
