import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dooit.app',
  appName: 'dooit',
  webDir: 'out',
  server: {
    url: 'http://192.168.1.37:3000', // For local dev testing. Change to your Vercel URL in production
    cleartext: true
  }
};

export default config;
