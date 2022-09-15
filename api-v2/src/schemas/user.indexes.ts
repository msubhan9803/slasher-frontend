import { UserSchema } from './user.schema';

// To support case-insensitive userName search
UserSchema.index(
  { userName: 1 },
  { name: 'caseInsensitiveUserName', collation: { locale: 'en', strength: 2 } },
);

// To support case-insensitive email search
UserSchema.index(
  { email: 1 },
  { name: 'caseInsensitiveEmail', collation: { locale: 'en', strength: 2 } },
);

// To support getSuggestedFriends, sorting by newest user
UserSchema.index(
  { createdAt: -1 },
);
