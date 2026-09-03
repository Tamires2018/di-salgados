import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react()
  ],

  // Mantido para não quebrar o Capacitor/APK
  base: './'
});