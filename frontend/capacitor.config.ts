import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.german.abdullah',
  appName: 'SmartLanguage',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    url: 'https://germanbyabdullah.pages.dev', // Use the live URL for mobile too
    cleartext: true
  }
};

export default config;
