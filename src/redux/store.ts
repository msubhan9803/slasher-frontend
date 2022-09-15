/* eslint-disable import/no-named-as-default */
import { configureStore } from '@reduxjs/toolkit';
import registrationSlice from './slices/registrationSlice';

export const store = configureStore({
  reducer: {
    registration: registrationSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
