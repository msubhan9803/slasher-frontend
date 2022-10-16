import { Factory } from 'fishery';
import { ActiveStatus } from '../../src/schemas/user/user.enums';
import { User } from '../../src/schemas/user/user.schema';

type UserTransientParams = {
  unhashedPassword: string;
};

export const userFactory = Factory.define<Partial<User>, UserTransientParams>(
  ({ sequence, transientParams, afterBuild }) => {
    afterBuild((user) => {
      user.setUnhashedPassword(transientParams.unhashedPassword || 'password');
    });

    return new User({
      userName: `Username${sequence}`,
      firstName: `First name ${sequence}`,
      email: `User${sequence}@Example.com`,
      status: ActiveStatus.Active, // even though a new user is inactive, it's useful in this factory to default to active
      securityQuestion: 'Where does the general keep his armies?',
      securityAnswer: 'In his sleevies!',
      profilePic: 'noUser.jpg',
    });
  },
);
