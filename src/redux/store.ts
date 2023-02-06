import { configureStore } from '@reduxjs/toolkit';
import registrationReducer from './slices/registrationSlice';
import userReducer from './slices/userSlice';
import pubWiseReducer from './slices/pubWiseSlice';

export const store = configureStore({
  reducer: {
    registration: registrationReducer,
    user: userReducer,
    pubWise: pubWiseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
