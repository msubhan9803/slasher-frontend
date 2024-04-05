/// <reference types="@capacitor/keyboard" />

import { CapacitorConfig } from '@capacitor/cli';
import dotenv from 'dotenv'
import { KeyboardResize, KeyboardStyle } from '@capacitor/keyboard';

dotenv.config({ path: '.env.capacitor.local-network-ip' });

const useLiveReloadConfig = process.env.LIVE_RELOAD === 'true';
if (useLiveReloadConfig && !process.env.LOCAL_MACHINE_IP) {
  console.error('ERROR: Please define your machine\'s ip address in .env.capacitor.local-network-ip file.')
  process.exit(1)
}

if (useLiveReloadConfig) {
  console.log('INFO: Using live reload for capacitor')
} else {
  console.log('INFO: Using static build for capacitor')
}
const config: CapacitorConfig = {
  appId: 'tv.slasher.app',
  appName: 'Slasher',
  webDir: useLiveReloadConfig ? undefined : 'build',
  bundledWebRuntime: false,
  backgroundColor: '000000',
  ios: {
    contentInset: 'automatic',
  },
  android: {
    backgroundColor: '000000'
  }, 
  server: {
    cleartext: useLiveReloadConfig,
    // We must give a hostname having domain `slasher.tv` so that ads properly.
    hostname: 'cap.slasher.tv',
    // Please defined your own machine's ip address in file `.env.capacitor.local-network-ip`
    url: useLiveReloadConfig ? process.env.LOCAL_MACHINE_IP : undefined,
  },
  plugins: {
    Keyboard: {
      resize: KeyboardResize.Native, // iOS only
      resizeOnFullScreen: true, // Android only
    },
    SplashScreen: {
      "launchShowDuration": 1000,
      "launchAutoHide": true,
      "launchFadeOutDuration": 1000,
    },
    CapacitorCookies: {
      "enabled": true
    },
    FirebaseAnalytics: {
      "providers": {
        "google": true
      }
    }
  },
};

export default config;
