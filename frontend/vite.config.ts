import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { defineConfig, loadEnv } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => {
  const env = {
    CHAT_APP_BACKEND_SERVER_URI: "http://localhost:3030"
  };

  Object.assign(env, loadEnv(mode, process.cwd(), "CHAT_APP_"));

  const config = {
    plugins: [
      vue(),
      nodePolyfills({
        include: ["crypto", "stream", "util", "vm"]
      }),
      tailwindcss()
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            const base = id.match(/node_modules\/((?:@[^/.]+\/)?[^/.]+[^/]*)/)?.[1];

            if (base && !base.match(/^@rp-pedraza\//)) {
              // TODO: Maybe divide to smaller chunks
              return "dependencies";
            }
          }
        }
      }
    }
  };

  if (mode !== "production") {
    Object.assign(config, {
      server: {
        proxy: {
          "/oauth": {
            target: env.CHAT_APP_BACKEND_SERVER_URI,
            changeOrigin: true
          }
        }
      }
    });
  }

  Object.assign(config, {
    define: {
      __BACKEND_SERVER_URI__: JSON.stringify(env.CHAT_APP_BACKEND_SERVER_URI)
    }
  });

  return config;
});
