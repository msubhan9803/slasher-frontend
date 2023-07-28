import React from 'react';
import { useMediaQuery } from 'react-responsive';
import PubWiseAd from '../../../ui/PubWiseAd';
import { LG_MEDIA_BREAKPOINT } from '../../../../constants';
import { GLOBAL_RIGHT_NAV_DIV_ID } from '../../../../utils/pubwise-ad-units';

function AdvertisementBox() {
  const isRightSideBarVisible = useMediaQuery({ query: `(min-width: ${LG_MEDIA_BREAKPOINT})` });

  return (
    <div>
      { isRightSideBarVisible && <PubWiseAd id={GLOBAL_RIGHT_NAV_DIV_ID} /> }
    </div>
  );
}

export default AdvertisementBox;
