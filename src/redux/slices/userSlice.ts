import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    friendRequestCount: 0,
    recentFriendRequests: [],
    unreadNotificationCount: 0,
    unreadMessageCount: 0,
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
      unreadMessageCount: action.payload.unreadMessageCount,
      recentMessages: action.payload.recentMessages,
      user: action.payload.user,
    }),
    /* eslint-disable no-param-reassign */
    incrementUnreadNotificationCount: (state) => {
      state.unreadNotificationCount += 1;
    },
    handleUpdatedUnreadMessageCount: (state, payload) => {
      state.unreadMessageCount = payload.payload;
    },
  },
});

export const {
  setUserInitialData,
  incrementUnreadNotificationCount,
  handleUpdatedUnreadMessageCount,
} = userSlice.actions;

export default userSlice.reducer;
