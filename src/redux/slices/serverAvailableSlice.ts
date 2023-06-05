/* eslint-disable no-param-reassign */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const serverAvailability = createSlice({
  name: 'serverAvailability',
  initialState: {
    isAvailable: true,
  },
  reducers: {
    setServerAvailable: (state, action: PayloadAction<boolean>) => {
      state.isAvailable = action.payload;
    },
  },
});

export const { setServerAvailable } = serverAvailability.actions;
export default serverAvailability.reducer;
