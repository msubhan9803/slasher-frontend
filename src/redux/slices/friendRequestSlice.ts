import { createSlice } from '@reduxjs/toolkit';

export const friendRequestSlice = createSlice({
  name: 'friendRequest',
  initialState: {
    friendRequestsList: [],
  },
  reducers: {
    setUserFriendDetail: (state, action) => (
      {
        ...state,
        friendRequestsList: action.payload,
      }
    ),
  },
});

export const { setUserFriendDetail } = friendRequestSlice.actions;

export default friendRequestSlice.reducer;
