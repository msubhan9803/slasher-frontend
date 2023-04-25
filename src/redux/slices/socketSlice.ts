import { createSlice } from '@reduxjs/toolkit';
import { Socket } from 'socket.io-client';

export const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    instance: null as null | Socket,
    isConnected: false,
  },
  reducers: {
    setSocketInstance: (state, action) => ({
      ...state,
      isConnected: true,
      instance: action.payload,
    }),
  },
});

export const { setSocketInstance } = socketSlice.actions;

export default socketSlice.reducer;
