/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

export const googleAnalytics = createSlice({
  name: 'googleAnalytics',
  initialState: {
    isReady: false,
  },
  reducers: {
    setIsGoogleAnalyticsReady: (state) => {
      state.isReady = true;
    },
  },
});

export const { setIsGoogleAnalyticsReady } = googleAnalytics.actions;
export default googleAnalytics.reducer;
