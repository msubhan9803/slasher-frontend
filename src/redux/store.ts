import { configureStore } from '@reduxjs/toolkit';
import registrationReducer from './slices/registrationSlice';
import suggestedFriendsReducer from './slices/suggestedFriendsSlice';
import userReducer from './slices/userSlice';
import remoteConstantsReducer from './slices/remoteConstantsSlice';
import pubWiseReducer from './slices/pubWiseSlice';
import booksReducer from './slices/booksSlice';
import artsReducer from './slices/artsSlice';
import musicReducer from './slices/musicSlice';
import podcastsReducer from './slices/podcasts';
import scrollPositionReducer from './slices/scrollPositionSlice';

export const store = configureStore({
  reducer: {
    registration: registrationReducer,
    remoteConstants: remoteConstantsReducer,
    user: userReducer,
    books: booksReducer,
    arts: artsReducer,
    music: musicReducer,
    podcasts: podcastsReducer,
    suggestedFriendList: suggestedFriendsReducer,
    pubWise: pubWiseReducer,
    scrollPosition: scrollPositionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
