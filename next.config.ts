import type { NextConfig } from "next";

// Force restart
const nextConfig: NextConfig = {
  // Fix indexedDB error during SSR - externalize wallet libraries
  serverExternalPackages: ['wagmi', 'viem', '@walletconnect/ethereum-provider'],

  // Empty turbopack config to silence warning (we use webpack config below)
  turbopack: {},

  webpack: (config) => {
    // 1. Abaikan library 'tap' dkk yang bikin error di Turbopack sebelumnya
    config.externals.push("pino-pretty", "lokijs", "encoding", "tap");

    // 2. Abaikan konektor Wagmi yang TIDAK kita pakai (biar gak error Module not found)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@base-org/account": false,
      "@coinbase/wallet-sdk": false,
      "@gemini-wallet-core": false,
      "@metamask/sdk": false,
      "@safe-global/safe-apps-provider": false,
      "@safe-global/safe-apps-sdk": false,
      porto: false,
    };

    return config;
  },
};

export default nextConfig;
