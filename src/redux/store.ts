import { configureStore } from '@reduxjs/toolkit';
import registrationReducer from './slices/registrationSlice';
import suggestedFriendsReducer from './slices/suggestedFriendsSlice';
import userReducer from './slices/userSlice';
import remoteConstantsReducer from './slices/remoteConstantsSlice';
import tpdReducer from './slices/tpdSlice';
import booksReducer from './slices/booksSlice';
import artistsReducer from './slices/artistsSlice';
import musicReducer from './slices/musicSlice';
import podcastsReducer from './slices/podcastsSlice';
import scrollPositionReducer from './slices/scrollPositionSlice';
import socketReducer from './slices/socketSlice';
import serverAvailabilityReducer from './slices/serverAvailableSlice';
import googleAnalyticsReducer from './slices/googleAnalyticsSlice';

export const store = configureStore({
  reducer: {
    registration: registrationReducer,
    remoteConstants: remoteConstantsReducer,
    user: userReducer,
    books: booksReducer,
    artists: artistsReducer,
    music: musicReducer,
    podcasts: podcastsReducer,
    suggestedFriendList: suggestedFriendsReducer,
    tpd: tpdReducer,
    scrollPosition: scrollPositionReducer,
    socket: socketReducer,
    serverAvailability: serverAvailabilityReducer,
    googleAnalytics: googleAnalyticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
