import { configureStore } from '@reduxjs/toolkit';
import sidebarContextReducer from './slices/sidebarContextSlice';
import registrationReducer from './slices/registrationSlice';
import suggestedFriendsReducer from './slices/suggestedFriendsSlice';
import userReducer from './slices/userSlice';
import pubWiseReducer from './slices/pubWiseSlice';

export const store = configureStore({
  reducer: {
    registration: registrationReducer,
    user: userReducer,
    sidebarContext: sidebarContextReducer,
<<<<<<< HEAD
    suggestedFriendList: suggestedFriendsReducer,
=======
    pubWise: pubWiseReducer,
>>>>>>> main
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
