import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

let appVersion = '';

export const detectAppVersion = async () => {
  let version = '';
  if (Capacitor.isNativePlatform()) {
    const appInfo = await App.getInfo();
    version += appInfo.version;
  } else {
    version += process.env.REACT_APP_VERSION;
  }
  version += `-${Capacitor.getPlatform()}`;
  appVersion = version;
};
export const getAppVersion = () => appVersion;
