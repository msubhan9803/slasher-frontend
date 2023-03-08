import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { DateTime } from 'luxon';

const initialState = {
  artists: [],
  lastRetrievalTime: null as null | string,
};

export const artistsSlice = createSlice({
  name: 'artists',
  initialState,
  reducers: {
    setArtists: (state, action: PayloadAction<typeof initialState['artists']>) => ({
      ...state,
      artists: action.payload,
      lastRetrievalTime: DateTime.now().toISO(),
    }),
  },
});

export const {
  setArtists,
} = artistsSlice.actions;

export default artistsSlice.reducer;
