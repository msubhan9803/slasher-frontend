import React, { useEffect } from 'react';
import { AppUpdate } from '@capawesome/capacitor-app-update';
import { Outlet } from 'react-router-dom';

function CapacitorAppVersionListener() {
  const checkAppVersionStatus = async () => {
    const result = await AppUpdate.getAppUpdateInfo();
    const { currentVersion } = result;
    const { availableVersion } = result;
    if (currentVersion < availableVersion) {
      await AppUpdate.openAppStore();
    }
  };
  useEffect(() => {
    checkAppVersionStatus();
  }, []);

  return (
    <Outlet />
  );
}

export default CapacitorAppVersionListener;
