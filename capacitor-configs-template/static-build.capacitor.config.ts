import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tv.slasher.app',
  appName: 'Slasher',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    // We must give a hostname having domain `slasher.tv` so that pubwise ads properly. 
    hostname: 'cap.android.slasher.tv',
    cleartext: true,
  }
};

export default config;
