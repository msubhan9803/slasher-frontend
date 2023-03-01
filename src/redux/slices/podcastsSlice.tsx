import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { DateTime } from 'luxon';

const initialState = {
  podcasts: [],
  lastRetrievalTime: null as null | string,
};

export const podcastsSlice = createSlice({
  name: 'podcasts',
  initialState,
  reducers: {
    setPodcasts: (state, action: PayloadAction<typeof initialState['podcasts']>) => ({
      ...state,
      podcasts: action.payload,
      lastRetrievalTime: DateTime.now().toISO(),
    }),
  },
});

export const {
  setPodcasts,
} = podcastsSlice.actions;

export default podcastsSlice.reducer;
