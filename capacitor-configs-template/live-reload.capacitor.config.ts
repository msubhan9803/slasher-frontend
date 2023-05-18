import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tv.slasher.app',
  appName: 'Slasher',
  server: {
    // Please use your own machine's ip address here!
    url: "http://192.168.18.5:3000",
    cleartext: true
  },
};

export default config;
;