import { createSlice } from '@reduxjs/toolkit';

export const sidebarContextSlice = createSlice({
  name: 'sidebarContext',
  initialState: {
    userName: '',
    userId: '',
  },
  reducers: {
    setSidebarUserData: (state, action) => ({
      ...state,
      userName: action.payload.userName,
      userId: action.payload.id,
    }),
  },
});

export const { setSidebarUserData } = sidebarContextSlice.actions;

export default sidebarContextSlice.reducer;
