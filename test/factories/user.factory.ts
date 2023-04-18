import { Factory } from 'fishery';
import { ActiveStatus } from '../../src/schemas/user/user.enums';
import { User } from '../../src/schemas/user/user.schema';
import { addFactoryToRewindList } from '../helpers/factory-helpers.ts';

type UserTransientParams = {
  unhashedPassword: string;
};

export const userFactory = Factory.define<Partial<User>, UserTransientParams>(
  ({ sequence, transientParams, afterBuild }) => {
    afterBuild((user) => {
      user.setUnhashedPassword(transientParams.unhashedPassword || 'password');
    });

    return new User({
      betaTester: true, // This is temporary, but required during the beta release phase
      userName: `Username${sequence}`,
      firstName: `First name ${sequence}`,
      email: `User${sequence}@Example.com`,
      status: ActiveStatus.Active, // even though a new user is inactive, it's useful in this factory to default to active
      securityQuestion: 'What is your favorite restaurant?',
      securityAnswer: 'McD',
      profilePic: 'noUser.jpg',
      aboutMe: 'Hello. This is me.',
    });
  },
);

addFactoryToRewindList(userFactory);
