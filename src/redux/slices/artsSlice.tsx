import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { DateTime } from 'luxon';

const initialState = {
  arts: [],
  lastRetrievalTime: null as null | string,
};

export const artsSlice = createSlice({
  name: 'arts',
  initialState,
  reducers: {
    setArts: (state, action: PayloadAction<typeof initialState['arts']>) => ({
      ...state,
      arts: action.payload,
      lastRetrievalTime: DateTime.now().toISO(),
    }),
  },
});

export const {
  setArts,
} = artsSlice.actions;

export default artsSlice.reducer;
