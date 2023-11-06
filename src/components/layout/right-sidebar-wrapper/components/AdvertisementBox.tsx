import { useMediaQuery } from 'react-responsive';
import { LG_MEDIA_BREAKPOINT } from '../../../../constants';
import TpdAd from '../../../ui/TpdAd';

function AdvertisementBox() {
  const isRightSideBarVisible = useMediaQuery({ query: `(min-width: ${LG_MEDIA_BREAKPOINT})` });

  return (
    <div>
      {isRightSideBarVisible && <TpdAd id="dsk-box-ad-a-placeholder" />}

    </div>
  );
}

export default AdvertisementBox;
