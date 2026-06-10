import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
  ];

  // Verify required environment variables are present
  for (const key of requiredEnvVars) {
    if (!env[key]) {
      throw new Error(`CRITICAL: Environment variable ${key} is missing. Deployment aborted.`);
    }
  }

  return {
    plugins: [react()],
  }
})
