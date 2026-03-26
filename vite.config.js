import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const githubPagesBase = "/snapshot-evm/";

export default defineConfig(({ command }) => ({
  base: command === "build" ? githubPagesBase : "/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("react") ||
            id.includes("@tanstack/react-query") ||
            id.includes("react-hook-form") ||
            id.includes("@hookform/resolvers") ||
            id.includes("zod") ||
            id.includes("zustand")
          ) {
            return "react";
          }

          if (id.includes("ethers") || id.includes("axios")) {
            return "web3";
          }

          return undefined;
        },
      },
    },
  },
}));
