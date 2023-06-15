/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const serverAvailability = createSlice({
  name: 'serverAvailability',
  initialState: {
    isAvailable: true,
  },
  reducers: {
    setIsServerAvailable: (state, action: PayloadAction<boolean>) => {
      state.isAvailable = action.payload;
    },
  },
});

export const { setIsServerAvailable } = serverAvailability.actions;
export default serverAvailability.reducer;
