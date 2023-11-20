/* eslint-disable no-param-reassign */
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export const tpdSlice = createSlice({
  name: 'tpd',
  initialState: {
    isSlotsDefined: false,
    isAdBlockerDetected: false,
  },
  reducers: {
    setTpdSlots: (state) => ({
      ...state,
      isSlotsDefined: true,
    }),
    setAdBlockerDetected: (state, action: PayloadAction<boolean>) => {
      state.isAdBlockerDetected = action.payload;
    },
  },
});

export const { setTpdSlots, setAdBlockerDetected } = tpdSlice.actions;

export default tpdSlice.reducer;
