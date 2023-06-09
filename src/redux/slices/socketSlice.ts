/* eslint-disable no-param-reassign */
import { PayloadAction, createSlice } from '@reduxjs/toolkit';

export const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    isConnected: false,
  },
  reducers: {
    setIsSocketConnected: (state, action: PayloadAction<boolean>) => ({
      isConnected: action.payload,
    }),
  },
});

export const { setIsSocketConnected } = socketSlice.actions;

export default socketSlice.reducer;
