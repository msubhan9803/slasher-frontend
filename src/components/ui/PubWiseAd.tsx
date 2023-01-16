import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../redux/hooks';

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

function PubWiseAdUnit({ id, style, className }: PubWiseAdTypes) {
  useEffect(() => {
    if (!window.gptadslots[id]) {
      // eslint-disable-next-line no-console
      console.error(
        '\n\n------Slasher LOG------\n\n: Please define an ad-slot in `usePubWiseAdSlots` hook to use this ad:, ',
        id,
        '\n\n\n\n\n',
      );
    }

    if (typeof window.pubwise !== 'undefined' && window.pubwise.enabled === true) {
      window.pubwise.que.push(() => {
        window.pubwise.renderAd(id);
      });
    } else {
      window.googletag.cmd.push(() => {
        window.googletag.display(id);
        window.googletag.pubads().refresh([window.gptadslots[id]]);
      });
    }
  }, []);

  return <div style={style} className={className} id={id} />;
}

function PubWiseAd({
  id, style, className, autoSequencer,
}: PubWiseAdTypes) {
  const { isSlotsDefined } = useAppSelector((state) => state.pubWise);
  const [sequencedId, setSequencedId] = useState('');
  const isFirstLoadRef = useRef(true);

  useEffect(() => {
    if (autoSequencer) {
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;

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
  }, []);

  const props = {
    style, className, autoSequencer, id: autoSequencer ? sequencedId : id,
  };

  if (!isSlotsDefined) return null;
  if (!autoSequencer) {
    return (
      <PubWiseAdUnit {...props} />
    );
  }

  if (!sequencedId) return null;
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
