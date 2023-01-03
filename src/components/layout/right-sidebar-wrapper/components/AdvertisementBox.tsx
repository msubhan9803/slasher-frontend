import React from 'react';
import { useAppSelector } from '../../../../redux/hooks';
import PubWiseAd from '../../../ui/PubWiseAd';

function AdvertisementBox() {
  const { isSlotsDefined } = useAppSelector((state) => state.pubWise);
  return (
    <div>
      <h2 className="mb-3">Advertisement</h2>
      {isSlotsDefined && <PubWiseAd className="text-center my-3" id="Event-detail_web-1-0" />}
    </div>
  );
}

export default AdvertisementBox;
