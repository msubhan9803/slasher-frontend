import { createSlice } from '@reduxjs/toolkit';

export const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    isConnected: false,
  },
  reducers: {
    setSocketConnected: () => ({
      isConnected: true,
    }),
  },
});

export const { setSocketConnected } = socketSlice.actions;

export default socketSlice.reducer;
