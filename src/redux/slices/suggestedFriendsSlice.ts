import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  suggestedFriends: [] as any[],
  lastRetrievalTime: null as null | string,
  forceReload: false,
};

export const suggestedFriendsSlice = createSlice({
  name: 'suggestedFriends',
  initialState,
  reducers: {
    setSuggestedFriendsState: (
      state,
      action: PayloadAction<typeof initialState>,
    ) => (
      {
        ...state,
        suggestedFriends: action.payload.suggestedFriends,
        lastRetrievalTime: action.payload.lastRetrievalTime,
        forceReload: action.payload.forceReload,
      }
    ),

    forceReloadSuggestedFriends: (state) => (
      {
        ...state,
        forceReload: true,
      }
    ),
  },
});

export const {
  setSuggestedFriendsState, forceReloadSuggestedFriends,
} = suggestedFriendsSlice.actions;

export default suggestedFriendsSlice.reducer;
