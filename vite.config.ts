import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { config } from 'dotenv';
import { MochaEnv, mochaPlugins } from "@getmocha/vite-plugins";

const env = config() as MochaEnv

export default defineConfig({
  plugins: [
    ...mochaPlugins(env),
    react(),
    {
      name: 'api-server',
      configureServer(server) {
        // Start the API server in development mode
        import('./src/server/index');
      }
    }
  ],
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
        cookieDomainRewrite: {
          "*": ""
        }
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 5000,
  },
});
