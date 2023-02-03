import { configureStore } from '@reduxjs/toolkit';
import sidebarContextReducer from './slices/sidebarContextSlice';
import registrationReducer from './slices/registrationSlice';
import userReducer from './slices/userSlice';
import pubWiseReducer from './slices/pubWiseSlice';

export const store = configureStore({
  reducer: {
    registration: registrationReducer,
    user: userReducer,
    sidebarContext: sidebarContextReducer,
    pubWise: pubWiseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
