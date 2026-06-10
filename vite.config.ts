/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // The Symbol SDK relies on Node builtins/globals (Buffer, crypto, stream,
    // process) in the browser — the equivalent of the old config-override.js.
    nodePolyfills({
      globals: { Buffer: true, global: true, process: true },
      protocolImports: true,
    }),
  ],
  // Keep the REACT_APP_ prefix so the existing .env / .env.testnet / .env.mainnet
  // files work unchanged. Vars are exposed via import.meta.env.REACT_APP_*.
  envPrefix: 'REACT_APP_',
  build: {
    // Firebase Hosting serves ./build (see firebase.json hosting.public).
    outDir: 'build',
  },
  server: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
  },
});
