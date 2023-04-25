import { configureStore, createImmutableStateInvariantMiddleware } from '@reduxjs/toolkit';
import registrationReducer from './slices/registrationSlice';
import suggestedFriendsReducer from './slices/suggestedFriendsSlice';
import userReducer from './slices/userSlice';
import remoteConstantsReducer from './slices/remoteConstantsSlice';
import pubWiseReducer from './slices/pubWiseSlice';
import booksReducer from './slices/booksSlice';
import artistsReducer from './slices/artistsSlice';
import musicReducer from './slices/musicSlice';
import podcastsReducer from './slices/podcastsSlice';
import scrollPositionReducer from './slices/scrollPositionSlice';
import socketReducer from './slices/socketSlice';

// Note: We want to ignore detecting for mutations for path `reduxState.socket` otherwise
// redux-toolkit (immerjs) throws error because checking for mutations on a
// object like `socketInstance` with circular dependencies is generally not intentional.
const immutableInvariantMiddleware = createImmutableStateInvariantMiddleware({
  ignoredPaths: ['socket.instance'],
});

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
    pubWise: pubWiseReducer,
    scrollPosition: scrollPositionReducer,
    socket: socketReducer,
  },
  middleware: [immutableInvariantMiddleware],
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
