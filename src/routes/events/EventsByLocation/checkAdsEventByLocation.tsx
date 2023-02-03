/** This method helps to check whether to show ad immediate after the current item we're rendering
 * in jsx.
 * @param breakpointName This can be one of bootstrap breakpoint name as we are using grid system
 * of bootstrap. So according to breakpoint name we're checking whether to show an ad immediate
 * after the current items or not (using item index).
 * @param index This is current item index of the item we're checking whether to show an ad after
 * it.
 * @param allItems This is the total of items in the list of items we're rendering.
*/
export default function checkAdsEventByLocation(
  breakpointName: string,
  index: number,
  allItems: Array<any>,
) {
  let show = false;

  const is1ColumnView = breakpointName === 'xs' || breakpointName === 'sm';
  const is2ColumnsView = breakpointName === 'md' || breakpointName === 'lg' || breakpointName === 'xl' || breakpointName === 'xxl';

  if (is2ColumnsView || is1ColumnView) {
    if (is1ColumnView) {
      if ((index + 1) % 3 === 0) {
        show = true;
      }
      if (allItems.length < 3 && allItems.length > 0 && index + 1 === allItems.length) {
        show = true;
      }
    }
    if (is2ColumnsView) {
      if ((index + 1) % 6 === 0) {
        show = true;
      }
      if (allItems.length < 6 && allItems.length > 0 && index + 1 === allItems.length) {
        show = true;
      }
    }
  }
  return show;
}
