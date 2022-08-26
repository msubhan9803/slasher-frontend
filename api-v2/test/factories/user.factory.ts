import { Factory } from 'fishery';
import { ActiveStatus, User } from '../../src/schemas/user.schema';

type UserTransientParams = {
  unhashedPassword: string;
};

export const userFactory = Factory.define<Partial<User>, UserTransientParams>(
  ({ sequence, transientParams, afterBuild }) => {
    afterBuild((user) => {
      user.setUnhashedPassword(transientParams.unhashedPassword);
    });

    return new User({
      userName: `Username${sequence}`,
      firstName: `First name ${sequence}`,
      email: `user${sequence}@example.com`,
      status: ActiveStatus.Active, // even though a new user is inactive, it's useful in this factory to default to active
    });
  },
);
