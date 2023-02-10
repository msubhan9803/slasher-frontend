import React from 'react';
import PubWiseAd from '../../../ui/PubWiseAd';
import { GLOBAL_RIGHT_NAV_DIV_ID } from '../../../../utils/pubwise-ad-units';

function SponsorBox() {
  return (
    <div>
      <h2 className="mb-3">Sponsor</h2>
      <PubWiseAd className="text-center my-3" id={GLOBAL_RIGHT_NAV_DIV_ID} />
    </div>
  );
}

export default SponsorBox;
