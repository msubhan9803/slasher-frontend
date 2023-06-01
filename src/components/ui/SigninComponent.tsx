import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Form, Link } from 'react-router-dom';
import CustomInputGroup from './CustomInputGroup';
import ErrorMessageList from './ErrorMessageList';
import RoundButtonLink from './RoundButtonLink';
import { ProgressButtonComponentType } from './ProgressButton';

interface UserCredentials {
  emailOrUsername: string;
  password: string;
}
interface SignInProps {
  credential: UserCredentials,
  setCredential: (val: any) => void,
  showPassword: boolean,
  setShowPassword: (val: boolean) => void,
  handleUserSignIn: (val: any) => void,
  errorMessage: string[] | undefined,
  ProgressButton: ProgressButtonComponentType,
  isPublicProfile?: boolean,
}
function SigninComponent({
  credential, setCredential, showPassword, setShowPassword, handleUserSignIn, errorMessage,
  isPublicProfile, ProgressButton,
}: SignInProps) {
  const handleSignIn = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCredential({ ...credential, [event.target.name]: event.target.value });
  };

  const passwordVisiblility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="form-inner-content justify-content-center">
      {!isPublicProfile && <h1 className="h2 text-center mb-4">Sign In</h1>}
      <Form>
        <CustomInputGroup
          size="lg"
          addonContent={solid('user')}
          label="Username or email"
          inputType="email"
          name="emailOrUsername"
          autoComplete="username"
          value={credential.emailOrUsername}
          onChangeValue={handleSignIn}
        />
        <CustomInputGroup
          size="lg"
          addonContent={solid('lock')}
          label="Password"
          inputType={showPassword ? 'text' : 'password'}
          password
          showPassword={showPassword}
          name="password"
          autoComplete="current-password"
          passwordVisiblility={passwordVisiblility}
          value={credential.password}
          onChangeValue={handleSignIn}
        />

        <p className="text-center fs-5 text-light">
          Forgot your password?&nbsp;
          <Link to="/app/forgot-password" className="text-primary">
            Click here
          </Link>
        </p>
        <ErrorMessageList errorMessages={errorMessage} className="m-0" />
        <ProgressButton id="sign-in-button" type="submit" onClick={handleUserSignIn} className="w-100 my-3" label="Sign in" />
        <p className="text-center">OR</p>
        <RoundButtonLink to="/app/registration" className="w-100" variant="primary">
          Create an account
        </RoundButtonLink>
        {!isPublicProfile
          && (
            <>
              <p className="mt-3 text-center text-light">
                NOTE: If you just created an account and you are not able to login,
                be sure you activated your account by clicking
                the button in the email we sent when you created your account.

                <em>
                  Your account will not be activated until you click the link in that email.
                </em>
              </p>
              <p className="text-center mb-0 text-light">
                Please check your spam folder for the email.
                If you have not received it, please&nbsp;
                <Link to="/app/verification-email-not-received" className="text-primary">click here.</Link>
              </p>
            </>
          )}
      </Form>
    </div>
  );
}
SigninComponent.defaultProps = {
  isPublicProfile: false,
};
export default SigninComponent;
