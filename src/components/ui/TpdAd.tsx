/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';

type Props = {
  id: string;
};
declare global {
  interface Window {
    tpd: any;
  }
}
function TpdAd({ id }: Props) {
  const isAdQueued = useRef(false);
  useEffect(() => {
    if (isAdQueued.current) { return; }
    isAdQueued.current = true;

    // eslint-disable-next-line no-console
    const divId = id.split('-placeholder')[0];

    /* To ensure the TPD library has initialized, we can use TPD command queue object like that: */
    window.tpd = window.tpd || {};
    window.tpd.cmd = window.tpd.cmd || [];
    window.tpd.cmd.push(() => {
      // ! TODO: Remove this log after testing.
      // eslint-disable-next-line no-console
      console.log('id?', id);
      // eslint-disable-next-line no-console
      console.log('[TPD] ad injection', divId);
      const el = document.getElementById(id) as any;
      el.divId = divId;

      window.tpd.helpers.createNewSPAAds([
        { slotId: divId, ele: el },
      ]);
    });
  }, [id]);

  return (
    <div>
      <div id={id} />
      {id}
    </div>
  );
}

export const tempTpdDivIdMap: Record<any, string> = {
  0: 'dsk-box-ad-b-placeholder',
  1: 'dsk-box-ad-c-placeholder',
  2: 'dsk-box-ad-d-placeholder',
  3: 'dsk-box-ad-e-placeholder',
  4: 'dsk-box-ad-z-placeholder',
};

export const testFun = (b: any) => {
  // eslint-disable-next-line no-console
  console.log('babu?', b);
  return null;
};

export default TpdAd;
