import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tv.slasher.app',
  appName: 'Slasher',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    hostname: 'cap.android.slasher.tv',
    cleartext: true,
  }
};

export default config;
