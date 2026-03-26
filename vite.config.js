import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
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

          if (
            id.includes("ethers") ||
            id.includes("@ethersproject/wallet") ||
            id.includes("axios")
          ) {
            return "web3";
          }

          return undefined;
        },
      },
    },
  },
});
