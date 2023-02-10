import { createSlice } from '@reduxjs/toolkit';

export const podcastsSlice = createSlice({
  name: 'podcasts',
  initialState: {
    podcasts: [],
  },
  reducers: {
    setpodcastsInitialData: (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.podcasts = action.payload;
    },
  },
});

export const {
  setpodcastsInitialData,
} = podcastsSlice.actions;

export default podcastsSlice.reducer;
