import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MessagesList } from '../../types';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    recentFriendRequests: [],
    unreadNotificationCount: 0,
    friendRequestCount: 0,
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
    forceProfilePageUserDetailsReload: false,
    pathnameHistory: [] as Array<string>,
  },
  reducers: {
    setUserInitialData: (state, action) => ({
      ...state,
      recentFriendRequests: action.payload.recentFriendRequests,
      unreadNotificationCount: action.payload.unreadNotificationCount,
      friendRequestCount: action.payload.friendRequestCount,
      unreadMessageCount: action.payload.unreadMessageCount,
      recentMessages: action.payload.recentMessages,
      user: action.payload.user,
      newConversationIdsCount: action.payload.newConversationIdsCount,
    }),
    /* eslint-disable no-param-reassign */
    updateUserProfilePic: (state, action) => {
      state.user.profilePic = action.payload;
    },
    /* eslint-disable no-param-reassign */
    updateUserUserName: (state, action) => {
      state.user.userName = action.payload;
    },
    /* eslint-disable no-param-reassign */
    updateRecentMessage: (state, action: any) => {
      const newMessageObj = {
        _id: action.payload.message.matchId,
        unreadCount: action.payload.message.unreadMsgCount,
        latestMessage: action.payload.message.message,
        updatedAt: action.payload.message.createdAt,
        participants: [{
          _id: action.payload.message.fromId,
          userName: action.payload.message.fromUser.userName,
          profilePic: action.payload.message.fromUser.profilePic,
        }],
      };
      let existingRecentMessage = [...JSON.parse(JSON.stringify(state.recentMessages))];

      // eslint-disable-next-line max-len
      const matchedMessage = existingRecentMessage.find((m) => m._id === action.payload.message.matchId);

      if (matchedMessage) {
        const matchedIndex = existingRecentMessage.indexOf(matchedMessage);
        existingRecentMessage[matchedIndex] = {
          ...matchedMessage,
          updatedAt: action.payload.message.createdAt,
          latestMessage: action.payload.message.message,
          unreadCount: action.payload.message.unreadMsgCount,
        };
      } else {
        existingRecentMessage = [...JSON.parse(JSON.stringify(state.recentMessages)),
          newMessageObj,
        ];
      }

      const sortedMessage = existingRecentMessage.sort((a: MessagesList, b: MessagesList) => {
        const keyA = new Date(a.updatedAt);
        const keyB = new Date(b.updatedAt);
        // Compare the 2 dates
        if (keyA < keyB) { return 1; }
        if (keyA > keyB) { return -1; }
        return 0;
      });

      state.recentMessages = sortedMessage.length > 3
        && !matchedMessage ? sortedMessage.slice(0, -1) : sortedMessage;
    },

    /* eslint-disable no-param-reassign */
    removeRecentMessage: (state, action) => {
      state.recentMessages = [...state.recentMessages.filter(
        // eslint-disable-next-line max-len
        (m) => m._id !== action.payload,
      ),
      ];
    },
    /* eslint-disable no-param-reassign */
    incrementUnreadNotificationCount: (state) => {
      state.user.newNotificationCount += 1;
    },
    incrementFriendRequestCount: (state, payload) => {
      state.friendRequestCount = payload.payload.pendingFriendRequestCount;
      state.recentFriendRequests = payload.payload.recentFriendRequests;
    },
    resetUnreadNotificationCount: (state) => {
      state.user.newNotificationCount = 0;
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
    setProfilePageUserDetailsReload: (state, payload) => {
      state.forceProfilePageUserDetailsReload = payload.payload;
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
  handleUpdatedUnreadConversationCount,
  updateUserProfilePic,
  updateUserUserName,
  setUserRecentFriendRequests,
  setFriendListReload,
  setProfilePageUserDetailsReload,
  appendToPathnameHistory,
  removeBlockedUserFromRecentMessages,
  updateRecentMessage,
  removeRecentMessage,
} = userSlice.actions;

export default userSlice.reducer;
