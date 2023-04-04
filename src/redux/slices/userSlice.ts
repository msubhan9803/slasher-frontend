import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    forceFriendListReload: false,
    homeDataReload: false,
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
    updateUserProfilePic: (state, action: PayloadAction<string>) => {
      state.user.profilePic = action.payload;
    },
    /* eslint-disable no-param-reassign */
    incrementUnreadNotificationCount: (state) => {
      state.unreadNotificationCount += 1;
    },
    handleUpdatedUnreadMessageCount: (state, payload) => {
      state.unreadMessageCount = payload.payload;
    },
    setUserRecentFriendRequests: (state, payload) => {
      state.recentFriendRequests = payload.payload;
    },
    setFriendListReload: (state, payload) => {
      state.forceFriendListReload = payload.payload;
    },
    setHomeDataReload: (state, payload) => {
      state.homeDataReload = payload.payload;
    },
  },
});

export const {
  setUserInitialData,
  incrementUnreadNotificationCount,
  handleUpdatedUnreadMessageCount,
  updateUserProfilePic,
  setUserRecentFriendRequests,
  setFriendListReload,
  setHomeDataReload,
} = userSlice.actions;

export default userSlice.reducer;
