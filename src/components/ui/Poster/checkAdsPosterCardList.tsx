export default function checkAdsPosterCardList(bp: string, i: number, arr: Array<any>) {
  let show = false;

  const is4ColumnsView = bp === 'md' || bp === 'xl' || bp === 'xxl';
  const is3ColumnsView = bp === 'xs' || bp === 'sm' || bp === 'lg';

  if (is4ColumnsView || is3ColumnsView) {
    if (is4ColumnsView) {
      if ((i + 1) % 12 === 0) {
        show = true;
      }
      if (arr.length < 12 && arr.length !== 0 && i + 1 === arr.length) {
        show = true;
      }
    }
    if (is3ColumnsView) {
      if ((i + 1) % 9 === 0) {
        show = true;
      }
      if (arr.length < 9 && arr.length !== 0 && i + 1 === arr.length) {
        show = true;
      }
    }
  }

  return show;
}
