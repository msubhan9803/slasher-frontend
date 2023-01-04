import React, { useEffect } from 'react';
import { useAppSelector } from '../../redux/hooks';

declare global {
  interface Window {
    pubwise: any;
    googletag: any;
    gptadslots: any;
  }
}
interface PubWiseAdTypes {
  id: string;
  style?: Object;
  className?: string;
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

function PubWiseAd(props: PubWiseAdTypes) {
  const { isSlotsDefined } = useAppSelector((state) => state.pubWise);

  if (!isSlotsDefined) return null;

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

export default PubWiseAd;
