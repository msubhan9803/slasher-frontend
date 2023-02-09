import { configureStore } from '@reduxjs/toolkit';
import registrationReducer from './slices/registrationSlice';
import suggestedFriendsReducer from './slices/suggestedFriendsSlice';
import userReducer from './slices/userSlice';
import pubWiseReducer from './slices/pubWiseSlice';
import scrollPositionReducer from './slices/scrollPositionSlice';

export const store = configureStore({
  reducer: {
    registration: registrationReducer,
    user: userReducer,
    suggestedFriendList: suggestedFriendsReducer,
    pubWise: pubWiseReducer,
    scrollPosition: scrollPositionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
