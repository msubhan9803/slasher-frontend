import { useMediaQuery } from 'react-responsive';
import { LG_MEDIA_BREAKPOINT } from '../../../../constants';
import TpdAd from '../../../ui/TpdAd';
import { tpdAdSlotIdA } from '../../../../utils/tpd-ad-slot-ids';

function AdvertisementBox() {
  const isRightSideBarVisible = useMediaQuery({ query: `(min-width: ${LG_MEDIA_BREAKPOINT})` });

  return (
    <div>
      {isRightSideBarVisible && <TpdAd slotId={tpdAdSlotIdA} id="advertisement-box-ad" />}

    </div>
  );
}

export default AdvertisementBox;
