import { createSlice } from '@reduxjs/toolkit';

export const scrollPositionSlice = createSlice({
  name: 'scrollPosition',
  initialState: {
    scrollToTab: false,
  },
  reducers: {
    /* eslint-disable no-param-reassign */
    setScrollToTabsPosition: (state, payload) => {
      state.scrollToTab = payload.payload;
    },
  },
});

export const { setScrollToTabsPosition } = scrollPositionSlice.actions;

export default scrollPositionSlice.reducer;
