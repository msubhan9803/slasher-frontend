/** This method helps to check whether to show ad immediate after the current item we're rendering
 * in jsx.
 * @param breakpointName This can be one of bootstrap breakpoint name as we are using grid system
 * of bootstrap. So according to breakpoint name we're checking whether to show an ad immediate
 * after the current items or not (using item index).
 * @param index This is current item index of the item we're checking whether to show an ad after
 * it.
 * @param allItems This is the total of items in the list of items we're rendering.
*/
export default function checkAdsNewsIndex(
  breakpointName: string,
  index: number,
  allItems: Array<any>,
) {
  let show = false;

  const is4ColumnsView = breakpointName === 'md' || breakpointName === 'xl' || breakpointName === 'xxl';
  const is3ColumnsView = breakpointName === 'sm' || breakpointName === 'lg';
  const is2ColumnsView = breakpointName === 'xs';

  if (is4ColumnsView || is3ColumnsView || is2ColumnsView) {
    if (is4ColumnsView) {
      if ((index + 1) % 12 === 0) {
        show = true;
      }
      if (allItems.length < 12 && allItems.length !== 0 && index + 1 === allItems.length) {
        show = true;
      }
    }
    if (is3ColumnsView) {
      if ((index + 1) % 9 === 0) {
        show = true;
      }
      if (allItems.length < 9 && allItems.length !== 0 && index + 1 === allItems.length) {
        show = true;
      }
    }
    if (is2ColumnsView) {
      if ((index + 1) % 6 === 0) {
        show = true;
      }
      if (allItems.length < 6 && allItems.length !== 0 && index + 1 === allItems.length) {
        show = true;
      }
    }
  }

  return show;
}
