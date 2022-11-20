import { FriendSchema } from './friend.schema';

// Ensure unqiueness for from/two combination
FriendSchema.index(
  { from: 1, to: 1 },
  {
    unique: true,
  },
);
