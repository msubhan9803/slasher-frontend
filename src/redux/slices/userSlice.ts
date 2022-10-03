import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    friendRequests: [],
    notificationCount: 0,
    recentMessages: [],
    userName: '',
  },
  reducers: {
    setUserInitialData: (state, action) => ({
      ...state,
      friendRequests: action.payload.friendRequests,
      notificationCount: action.payload.notificationCount,
      recentMessages: action.payload.recentMessages,
      userName: action.payload.userName,
    }),
  },
});

export const { setUserInitialData } = userSlice.actions;

export default userSlice.reducer;
