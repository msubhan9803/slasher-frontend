/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    tpd: any;
  }
}

type Props = {
  slotId: string;
  id: string;
};

function TpdAd({ id, slotId }: Props) {
  const isAdQueued = useRef(false);

  useEffect(() => {
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

  return (
    <div>
      <div id={id} />
      {[id, slotId].join(', ')}
    </div>
  );
}

export default TpdAd;
