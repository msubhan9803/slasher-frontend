import { createSlice } from '@reduxjs/toolkit';

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
    setIsAdBlockerDetected: (state) => ({
      ...state,
      isAdBlockerDetected: true,
    }),
  },
});

export const { setPubWiseSlots, setIsAdBlockerDetected } = pubWiseSlice.actions;

export default pubWiseSlice.reducer;
