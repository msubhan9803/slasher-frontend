/* eslint-disable */
import { configureStore } from '@reduxjs/toolkit';
import sidebarContextReducer from './slices/sidebarContextSlice';
import registrationReducer from './slices/registrationSlice';
import suggestedFriendsSlice from './slices/suggestedFriendsSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    registration: registrationReducer,
    user: userReducer,
    sidebarContext: sidebarContextReducer,
    suggestedFriendList: suggestedFriendsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
