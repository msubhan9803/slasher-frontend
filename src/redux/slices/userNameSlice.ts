import { createSlice } from '@reduxjs/toolkit';

export const userNameSlice = createSlice({
  name: 'userNameSlice',
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

export const { setOtherUserInitialData } = userNameSlice.actions;

export default userNameSlice.reducer;
