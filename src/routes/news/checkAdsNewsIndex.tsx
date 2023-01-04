export default function checkAdsNewsIndex(bp: string, i: number, arr: Array<any>) {
  let show = false;
  let adIndex = 0;

  const is4ColumnsView = bp === 'md' || bp === 'xl' || bp === 'xxl';
  const is3ColumnsView = bp === 'sm' || bp === 'lg';
  const is2ColumnsView = bp === 'xs';

  if (is4ColumnsView || is3ColumnsView || is2ColumnsView) {
    if (is4ColumnsView) {
      if ((i + 1) % 12 === 0) {
        show = true;
        adIndex = (i + 1) / 12;
      }
      if (arr.length < 12 && arr.length !== 0 && i + 1 === arr.length) {
        show = true;
        adIndex = 0;
      }
    }
    if (is3ColumnsView) {
      if ((i + 1) % 9 === 0) {
        show = true;
        adIndex = (i + 1) / 9;
      }
      if (arr.length < 9 && arr.length !== 0 && i + 1 === arr.length) {
        show = true;
        adIndex = 0;
      }
    }
    if (is2ColumnsView) {
      if ((i + 1) % 6 === 0) {
        show = true;
        adIndex = (i + 1) / 6;
      }
      if (arr.length < 6 && arr.length !== 0 && i + 1 === arr.length) {
        show = true;
        adIndex = 0;
      }
    }
  }

  return [show, adIndex];
}
