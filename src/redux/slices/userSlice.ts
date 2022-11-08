import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    friendRequests: [],
    unreadNotificationCount: 0,
    recentMessages: [],
    userName: '',
    userId: '',
  },
  reducers: {
    setUserInitialData: (state, action) => ({
      ...state,
      friendRequests: action.payload.friendRequests,
      unreadNotificationCount: action.payload.unreadNotificationCount,
      recentMessages: action.payload.recentMessages,
      userName: action.payload.userName,
      userId: action.payload.userId,
    }),
  },
});

export const { setUserInitialData } = userSlice.actions;

export default userSlice.reducer;
