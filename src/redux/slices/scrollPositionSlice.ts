import { createSlice } from '@reduxjs/toolkit';

export const scrollPositionSlice = createSlice({
  name: 'scrollPosition',
  initialState: {
    pathname: '',
    position: 0,
    data: [],
    positionElementId: '',
    sortValue: '',
    searchValue: '',
    keyValue: '',
    page: 0,
    scrollToTab: false,
  },
  reducers: {
    setScrollPosition: (state, action) => ({
      ...state,
      pathname: action.payload.pathname,
      position: action.payload.position,
      data: action.payload.data,
      positionElementId: action.payload.positionElementId,
      sortValue: action.payload.sortValue ? action.payload.sortValue : '',
      searchValue: action.payload.searchValue ? action.payload.searchValue : '',
      keyValue: action.payload.keyValue ? action.payload.keyValue : '',
      page: action.payload.page ? action.payload.page : '',
    }),
    /* eslint-disable no-param-reassign */
    setScrollToTabsPosition: (state, payload) => {
      state.scrollToTab = payload.payload;
    },
  },
});

export const { setScrollPosition, setScrollToTabsPosition } = scrollPositionSlice.actions;

export default scrollPositionSlice.reducer;
