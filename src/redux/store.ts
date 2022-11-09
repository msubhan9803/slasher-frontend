import { configureStore } from '@reduxjs/toolkit';
import otherUserReducer from './slices/userNameSlice';
import registrationReducer from './slices/registrationSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    registration: registrationReducer,
    user: userReducer,
    otherUser: otherUserReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
