/* eslint-disable object-curly-newline */
import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../redux/hooks';
import { enableADs } from '../../constants';
import SlasherDisableAdblocker from '../../images/slasher-disable-adblocker.jpg';
import { sendAdUnitEventToGoogleAnalytics } from '../../utils/google-analytics-utils';

declare global {
  interface Window {
    pubwise: any;
    googletag: any;
    gptadslots: any;
    slasherAds: any;
    gtag: any;
  }
}
interface PubWiseAdTypes {
  id: string;
  style?: React.CSSProperties;
  className?: string;
  // eslint-disable-next-line
  autoSequencer?: boolean;
}
interface AdContainerProps {
  id?: string;
  adUnitClassName?: string;
  adUnitStyle?: React.CSSProperties;
  adContainerClassName?: string;
  adContainerStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

const SponsoredElement = <div className="text-center mt-2 fs-6 fw-normal">Sponsored</div>;

/**
 * Why give static heights to ad-unit and ad-uni-container?
 * To prevent content-jumping while content is loading.
 * 1. You must give static `width` and `height` to each element so they have predictable size.
 * 2. We're giving height more of 15px to container to accomodate height of `SponsoredElement` well
 */
const AD_UNIT_STYLE = { width: 300, height: 250, margin: 'auto' };
const AD_CONTAINER_STYLE = { margin: 'auto' };

function AdContainer({
  id,
  adUnitClassName,
  adUnitStyle,
  adContainerClassName,
  adContainerStyle,
  children,
}: AdContainerProps) {
  return (
    <div className={adContainerClassName} style={{ ...AD_CONTAINER_STYLE, ...adContainerStyle }}>
      <div style={{ ...AD_UNIT_STYLE, ...adUnitStyle }} className={adUnitClassName} id={id}>
        {children}
      </div>
      {SponsoredElement}
    </div>
  );
}

function PubWiseAdUnit({ id, style, className }: PubWiseAdTypes) {
  useEffect(() => {
    if (!window.gptadslots[id]) {
      // eslint-disable-next-line no-console
      console.error(`Ad slot not defined: ${id}`); // Please define an ad-slot in `usePubWiseAdSlots` hook to use this ad
    }

    if (window?.pubwise?.enabled === true) {
      window.pubwise.que.push(() => {
        window.pubwise.renderAd(id);
      });
    } else {
      window.googletag.cmd.push(() => {
        window.googletag.display(id);
        window.googletag.pubads().refresh([window.gptadslots[id]]);
      });
    }
  }, [id]);

  return <AdContainer adContainerClassName={className} adContainerStyle={style} id={id} />;
}

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
export default function PubWiseAd({ id, style, className, autoSequencer }: PubWiseAdTypes) {
  const { isSlotsDefined, isAdBlockerDetected } = useAppSelector((state) => state.pubWise);
  const [sequencedId, setSequencedId] = useState('');
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

      if (autoSequencer) {
        if (!window.slasherAds) {
          window.slasherAds = {};
        }
        if (!window.slasherAds[id]) {
          window.slasherAds[id] = 0;
        }

        const requiredSequenceId = [id, window.slasherAds[id] + 1].join('-');
        setSequencedId(requiredSequenceId);
        window.slasherAds[id] += 1;
      }
    }
  }, [autoSequencer, id]);

  const props = {
    style,
    className,
    autoSequencer,
    id: autoSequencer ? sequencedId : id,
  };

  if (isAdBlockerDetected) {
    return <PlaceHolderAd {...{ className, style, showDisableAdBlocker: true }} />;
  }
  if (!enableADs) {
    return <PlaceHolderAd {...{ className, style }} />;
  }
  if (!isSlotsDefined) {
    return <AdContainer adContainerStyle={style} adContainerClassName={className} />;
  }

  if (!autoSequencer) {
    return <PubWiseAdUnit {...props} />;
  }

  if (!sequencedId) {
    return <AdContainer adContainerStyle={style} adContainerClassName={className} />;
  }
  return <PubWiseAdUnit {...props} />;
}

PubWiseAd.defaultProps = {
  style: {},
  className: '',
};

PubWiseAdUnit.defaultProps = {
  style: {},
  className: '',
};

AdContainer.defaultProps = {
  id: '',
  adUnitClassName: '',
  adUnitStyle: {},
  adContainerClassName: '',
  adContainerStyle: {},
  children: '',
};
