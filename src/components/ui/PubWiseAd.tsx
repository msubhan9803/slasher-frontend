import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '../../redux/hooks';
import { enableADs } from '../../constants';

declare global {
  interface Window {
    pubwise: any;
    googletag: any;
    gptadslots: any;
    slasherAds: any
  }
}
interface PubWiseAdTypes {
  id: string;
  style?: Object;
  className?: string;
  // eslint-disable-next-line
  autoSequencer?: boolean
}

const SponsoredElement = <h2 className="text-center my-2 fs-6 fw-normal">Sponsored</h2>;

const AdContainerStyle = { width: 350, height: 250 };
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

  return (
    <div style={AdContainerStyle}>
      <div style={style} className={className} id={id} />
      {SponsoredElement}
    </div>
  );
}

const PlaceHolderAdUnit = styled.div`
  height: 250px;
  width: 300px;
  background-color: #272727;
`;

function PlaceHolderAd({ className, style }: any) {
  return (
    <div style={AdContainerStyle}>
      <PlaceHolderAdUnit className={`d-flex justify-content-center align-items-center mx-auto ${className}`} style={style}>
        Slasher Ad
      </PlaceHolderAdUnit>
      {SponsoredElement}
    </div>
  );
}

function PubWiseAd({
  id, style, className, autoSequencer,
}: PubWiseAdTypes) {
  const { isSlotsDefined } = useAppSelector((state) => state.pubWise);
  const [sequencedId, setSequencedId] = useState('');
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      // Disable loading ad and show a placeholder ad instead for development server
      if (!enableADs) {
        return;
      }
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
    style, className, autoSequencer, id: autoSequencer ? sequencedId : id,
  };

  if (!enableADs) { return <PlaceHolderAd {...({ className, style })} />; }
  if (!isSlotsDefined) { return <div style={AdContainerStyle} />; }

  if (!autoSequencer) {
    return (
      <PubWiseAdUnit {...props} />
    );
  }

  if (!sequencedId) { return <div style={AdContainerStyle} />; }
  return (
    <PubWiseAdUnit {...props} />
  );
}

PubWiseAd.defaultProps = {
  style: {},
  className: '',
};

PubWiseAdUnit.defaultProps = {
  style: {},
  className: '',
};

export default PubWiseAd;
