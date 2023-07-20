import React from 'react';
import PubWiseAd from '../../../ui/PubWiseAd';
import { GLOBAL_RIGHT_NAV_DIV_ID } from '../../../../utils/pubwise-ad-units';
import { isNativePlatform } from '../../../../constants';

function AdvertisementBox() {
  return (
    <div>
      { !isNativePlatform && <PubWiseAd id={GLOBAL_RIGHT_NAV_DIV_ID} /> }
    </div>
  );
}

export default AdvertisementBox;
