import { configureStore } from '@reduxjs/toolkit';
import registrationReducer from './slices/registrationSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    registration: registrationReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
