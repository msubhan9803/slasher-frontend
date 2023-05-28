import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MessagesList } from '../../types';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    recentFriendRequests: [],
    unreadNotificationCount: 0,
    unreadMessageCount: 0,
    recentMessages: [] as Array<MessagesList>,
    newConversationIdsCount: 0,
    user: {
      userName: '',
      id: '',
      profilePic: '',
      newFriendRequestCount: 0,
      newNotificationCount: 0,
    },
    forceFriendListReload: false,
    pathnameHistory: [] as Array<string>,
  },
  reducers: {
    setUserInitialData: (state, action) => ({
      ...state,
      recentFriendRequests: action.payload.recentFriendRequests,
      unreadNotificationCount: action.payload.unreadNotificationCount,
      unreadMessageCount: action.payload.unreadMessageCount,
      recentMessages: action.payload.recentMessages,
      user: action.payload.user,
      newConversationIdsCount: action.payload.newConversationIdsCount,
    }),
    /* eslint-disable no-param-reassign */
    updateUserProfilePic: (state, action: PayloadAction<string>) => {
      state.user.profilePic = action.payload;
    },
    /* eslint-disable no-param-reassign */
    incrementUnreadNotificationCount: (state) => {
      state.user.newNotificationCount += 1;
    },
    incrementFriendRequestCount: (state) => {
      state.user.newFriendRequestCount += 1;
    },
    resetUnreadNotificationCount: (state) => {
      state.user.newNotificationCount = 0;
    },
    resetNewFriendRequestCountCount: (state) => {
      state.user.newFriendRequestCount = 0;
    },
    resetUnreadConversationCount: (state) => {
      state.newConversationIdsCount = 0;
    },
    handleUpdatedUnreadConversationCount: (state, payload) => {
      state.newConversationIdsCount = payload.payload;
    },
    setUserRecentFriendRequests: (state, payload) => {
      state.recentFriendRequests = payload.payload;
    },
    setFriendListReload: (state, payload) => {
      state.forceFriendListReload = payload.payload;
    },
    appendToPathnameHistory: (state, action: PayloadAction<string>) => {
      const lastPagePathname = state.pathnameHistory[state.pathnameHistory.length - 1];
      // We prevent appending duplicate pathname in a row
      if (lastPagePathname !== action.payload) {
        state.pathnameHistory.push(action.payload);
      }
    },
    // eslint-disable-next-line max-len
    removeBlockedUserFromRecentMessages: (state, action: PayloadAction<{ blockUserId: string }>) => {
      state.recentMessages = [...state.recentMessages.filter(
        (m) => {
          // eslint-disable-next-line max-len
          const isMessageFromBlockedUser = m.participants.find((u) => u._id === action.payload.blockUserId);
          return !isMessageFromBlockedUser;
        },
      ),
      ];
    },
  },
});

export const {
  setUserInitialData,
  incrementFriendRequestCount,
  incrementUnreadNotificationCount,
  resetUnreadConversationCount,
  resetUnreadNotificationCount,
  resetNewFriendRequestCountCount,
  handleUpdatedUnreadConversationCount,
  updateUserProfilePic,
  setUserRecentFriendRequests,
  setFriendListReload,
  appendToPathnameHistory,
  removeBlockedUserFromRecentMessages,
} = userSlice.actions;

export default userSlice.reducer;
