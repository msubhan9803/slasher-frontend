export default function checkAdsFavourites(bp: string, i: number, arr: Array<any>) {
  let show = false;
  let adIndex = 0;

  const is1ColumnView = bp === 'xs' || bp === 'sm';
  const is2ColumnsView = bp === 'md' || bp === 'lg' || bp === 'xl' || bp === 'xxl';

  if (is2ColumnsView || is1ColumnView) {
    if (is1ColumnView) {
      if ((i + 1) % 3 === 0) {
        show = true;
        adIndex = (i + 1) / 3;
      }
      if (arr.length < 3 && arr.length > 0 && i + 1 === arr.length) {
        show = true;
        adIndex = 0;
      }
    }
    if (is2ColumnsView) {
      if ((i + 1) % 6 === 0) {
        show = true;
        adIndex = (i + 1) / 6;
      }
      if (arr.length < 6 && arr.length > 0 && i + 1 === arr.length) {
        show = true;
        adIndex = 0;
      }
    }
  }
  return [show, adIndex];
}
