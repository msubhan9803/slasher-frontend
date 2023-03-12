import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { DateTime } from 'luxon';

const initialState = {
  music: [],
  lastRetrievalTime: null as null | string,
};

export const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    setMusic: (state, action: PayloadAction<typeof initialState['music']>) => ({
      ...state,
      music: action.payload,
      lastRetrievalTime: DateTime.now().toISO(),
    }),
  },
});

export const {
  setMusic,
} = musicSlice.actions;

export default musicSlice.reducer;
