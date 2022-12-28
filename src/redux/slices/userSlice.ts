import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    friendRequestCount: 0,
    recentFriendRequests: [],
    unreadNotificationCount: 0,
    recentMessages: [],
    user: {
      userName: '',
      id: '',
      profilePic: '',
    },
  },
  reducers: {
    setUserInitialData: (state, action) => ({
      ...state,
      friendRequestCount: action.payload.friendRequestCount,
      recentFriendRequests: action.payload.recentFriendRequests,
      unreadNotificationCount: action.payload.unreadNotificationCount,
      recentMessages: action.payload.recentMessages,
      user: action.payload.user,
    }),
    /* eslint-disable no-param-reassign */
    incrementUnreadNotificationCount: (state) => {
      state.unreadNotificationCount += 1;
    },
  },
});

export const { setUserInitialData, incrementUnreadNotificationCount } = userSlice.actions;

export default userSlice.reducer;
