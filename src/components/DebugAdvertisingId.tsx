/* eslint-disable no-alert */
import React from 'react';
import { AdvertisingId } from '@capacitor-community/advertising-id';

const handleCheckTrackingStatus = async () => {
  const { status } = await AdvertisingId.getAdvertisingStatus();
  alert(`Advertising Status: ${status}`);
};
const handleGetAdvertisingId = async () => {
  const advertisingId = await AdvertisingId.getAdvertisingId();
  alert(`Advertising Id: ${advertisingId.id}, Advertising Status: ${advertisingId.status}`);
};
const handleRequestTracing = async () => {
  const { value } = await AdvertisingId.requestTracking();
  alert(`Request for tracking successful: ${value}`);
};

function DebugAdvertisingId() {
  return (
    <div>
      <h1>Debug AdvertisingId</h1>
      <button className="mb-4 d-block" type="button" onClick={handleCheckTrackingStatus}>Check status advertisingId tracking status</button>
      <button className="mb-4 d-block" type="button" onClick={handleGetAdvertisingId}>Get advertisingId</button>
      <button className="mb-4 d-block" type="button" onClick={handleRequestTracing}>Request AdvertisingId tracking</button>
    </div>
  );
}

export default DebugAdvertisingId;
