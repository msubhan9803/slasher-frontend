import { createSlice } from '@reduxjs/toolkit';

export const pubWiseSlice = createSlice({
  name: 'pubWise',
  initialState: {
    isSlotsDefined: false,
  },
  reducers: {
    setPubWiseSlots: (state) => ({
      ...state,
      isSlotsDefined: true,
    }),
  },
});

export const { setPubWiseSlots } = pubWiseSlice.actions;

export default pubWiseSlice.reducer;
