import { createSlice } from '@reduxjs/toolkit';

export const suggestedFriendsSlice = createSlice({
  name: 'suggestedFriends',
  initialState: {
    suggestedFriends: [],
    lastRetrievalTime: null,
    forceReload: false,
  },
  reducers: {
    setSuggestedFriendsList: (state, action) => (
      {
        ...state,
        suggestedFriends: action.payload.suggestedFriends,
        lastRetrievalTime: action.payload.lastRetrievalTime,
        forceReload: action.payload.forceReload,
      }
    ),

    setForceReload: (state, action) => (
      {
        ...state,
        forceReload: action.payload.forceReload,
      }
    ),
  },
});

export const { setSuggestedFriendsList, setForceReload } = suggestedFriendsSlice.actions;

export default suggestedFriendsSlice.reducer;
