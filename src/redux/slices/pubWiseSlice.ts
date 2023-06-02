/* eslint-disable no-param-reassign */
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export const pubWiseSlice = createSlice({
  name: 'pubWise',
  initialState: {
    isSlotsDefined: false,
    isAdBlockerDetected: false,
  },
  reducers: {
    setPubWiseSlots: (state) => ({
      ...state,
      isSlotsDefined: true,
    }),
    setAdBlockerDetected: (state, action: PayloadAction<boolean>) => {
      state.isAdBlockerDetected = action.payload;
    },
  },
});

export const { setPubWiseSlots, setAdBlockerDetected } = pubWiseSlice.actions;

export default pubWiseSlice.reducer;
