import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    recentFriendRequests: [],
    unreadNotificationCount: 0,
    recentMessages: [],
    userName: '',
    userId: '',
  },
  reducers: {
    setUserInitialData: (state, action) => ({
      ...state,
      recentFriendRequests: action.payload.recentFriendRequests,
      unreadNotificationCount: action.payload.unreadNotificationCount,
      recentMessages: action.payload.recentMessages,
      userName: action.payload.userName,
      userId: action.payload.userId,
    }),
  },
});

export const { setUserInitialData } = userSlice.actions;

export default userSlice.reducer;
