import { createSlice } from '@reduxjs/toolkit';

export const otherUserSlice = createSlice({
  name: 'otherUser',
  initialState: {
    userName: '',
    userId: '',
  },
  reducers: {
    setOtherUserInitialData: (state, action) => ({
      ...state,
      userName: action.payload.userName,
      userId: action.payload.id,
    }),
  },
});

export const { setOtherUserInitialData } = otherUserSlice.actions;

export default otherUserSlice.reducer;
