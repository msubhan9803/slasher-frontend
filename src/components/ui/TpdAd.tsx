/* eslint-disable object-curly-newline */
import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '../../redux/hooks';
import SlasherDisableAdblocker from '../../images/slasher-disable-adblocker.jpg';
import { enableADs } from '../../env';
import { sendAdUnitEventToGoogleAnalytics } from '../../utils/initFirebaseAnalytics';

declare global {
  interface Window {
    tpd: any;
  }
}
interface TpdAdProps {
  style?: React.CSSProperties;
  className?: string;
  id: string;
  slotId: string;
}
interface AdContainerProps {
  id?: string;
  slotId?: string;
  adUnitClassName?: string;
  adUnitStyle?: React.CSSProperties;
  adContainerClassName?: string;
  adContainerStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

function AdContainer({
  id,
  slotId,
  adUnitClassName,
  adUnitStyle,
  adContainerClassName,
  adContainerStyle,
  children,
}: AdContainerProps) {
  const isAdQueued = useRef(false);

  useEffect(() => {
    // Do not run the effect if `id` or `slotId` are falsy.
    if (!id || !slotId) { return; }

    if (isAdQueued.current) { return; }
    isAdQueued.current = true;

    // eslint-disable-next-line no-console
    console.log('myLogs: (id, slotId)?', id, ',', slotId);

    // Ad Loading
    // ============
    /* To ensure the TPD library has initialized, we can use TPD command queue object like that: */
    window.tpd = window.tpd || {};
    window.tpd.cmd = window.tpd.cmd || [];
    window.tpd.cmd.push(() => {
      const ele = document.getElementById(id) as any;
      ele.divId = id;
      window.tpd.helpers.createNewSPAAds([{ slotId, ele }]);
    });
  }, [id, slotId]);

  /**
 * Why give static heights to ad-unit and ad-uni-container?
 * To prevent content-jumping while content is loading.
 * 1. You must give static `width` and `height` to each element so they have predictable size.
 * 2. We're giving height more of 15px to container to accomodate height of `SponsoredElement` well
 */
  const AD_UNIT_STYLE: React.CSSProperties = {
    // width: 300,
    // height: 250,
    // margin: 'auto',
    // We're making the ad-unit div `flex` with direction `column` to vertically center ad content.
    // display: 'flex',
    // flexDirection: 'column',
    // justifyContent: 'center',
  };
  const AD_CONTAINER_STYLE: React.CSSProperties = {
    height: 250,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  return (
    <div>
      <div className={adContainerClassName} style={{ ...AD_CONTAINER_STYLE, ...adContainerStyle }}>
        <div style={{ ...AD_UNIT_STYLE, ...adUnitStyle }} className={adUnitClassName} id={id}>
          {children}
        </div>
      </div>
      <div className="text-center mt-2 fs-6 fw-normal w-100">Sponsored</div>
    </div>
  );
}

// This is a placeholder for: 1. when adblocker is detected
//                            2. when ads are disabled on development server
function PlaceHolderAd({ className, style, showDisableAdBlocker = false }: any) {
  const placeHolderAdUnitStyle = { display: 'flex', backgroundColor: '#272727' };
  return (
    <AdContainer
      adContainerClassName={className}
      adContainerStyle={style}
      adUnitStyle={placeHolderAdUnitStyle}
    >
      <div style={{ margin: 'auto' }}>
        {showDisableAdBlocker
          ? <img src={SlasherDisableAdblocker} alt="Please disable adblocker" />
          : 'Slasher Ad'}
      </div>
    </AdContainer>
  );
}

// Note: `style` and `className` are always passed to
// `adContainerStyle` and `adContainerClassName` respectively.
export default function TpdAd({ style, className, id, slotId }: TpdAdProps) {
  const { isSlotsDefined, isAdBlockerDetected } = useAppSelector((state) => state.tpd);
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;

      // Disable loading ad and show a placeholder ad instead for development server
      if (!enableADs) {
        return;
      }

      // Only send google analytics events when ads are enabled
      sendAdUnitEventToGoogleAnalytics(id);
    }
  }, [id]);

  if (isAdBlockerDetected) {
    return <PlaceHolderAd {...{ className, style, showDisableAdBlocker: true }} />;
  }
  if (!enableADs) {
    return <PlaceHolderAd {...{ className, style }} />;
  }
  if (!isSlotsDefined) {
    return <AdContainer adContainerClassName={className} adContainerStyle={style} />;
  }

  // This is our actual ad
  // eslint-disable-next-line max-len
  return <AdContainer adContainerClassName={className} adContainerStyle={style} id={id} slotId={slotId} />;
}

TpdAd.defaultProps = {
  style: {},
  className: '',
};

AdContainer.defaultProps = {
  id: '',
  slotId: '',
  adUnitClassName: '',
  adUnitStyle: {},
  adContainerClassName: '',
  adContainerStyle: {},
  children: '',
};
