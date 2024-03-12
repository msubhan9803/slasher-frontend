import { createSlice } from '@reduxjs/toolkit';

export const mobileAd = createSlice({
  name: 'mobileAd',
  initialState: {
    infiniteScrollRef: null,
    bottomAdHeight: null,
  },
  reducers: {
    /* eslint-disable no-param-reassign */
    setMobileInfiniteScrollParent: (state, action) => {
      state.infiniteScrollRef = action.payload;
    },
  },
});

export const { setMobileInfiniteScrollParent } = mobileAd.actions;

export default mobileAd.reducer;
