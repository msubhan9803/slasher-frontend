import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CustomInputGroup from '../../components/ui/CustomInputGroup';
import useProgressButton from '../../components/ui/ProgressButton';
import { resetPassword } from '../../api/users';
import ErrorMessageList from '../../components/ui/ErrorMessageList';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const resetPasswordToken = searchParams.get('resetPasswordToken');

  const navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState<string[]>();
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState('');

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setProgressButtonStatus('loading');
    resetPassword(
      email!,
      resetPasswordToken!,
      newPassword,
      newPasswordConfirmation,
    ).then(() => {
      setProgressButtonStatus('default');
      navigate('/app/password-reset-success');
    }).catch((requestError: any) => {
      setProgressButtonStatus('failure');
      setErrorMessages(requestError.response.data.message);
    });
  };

  const renderContent = () => {
    if (!email || !resetPasswordToken) {
      return 'Invalid password reset URL.';
    }

    return (
      <>
        <p className="text-center mt-3 mb-4">Enter your new password below to gain access to your account again.</p>
        <Row className="justify-content-center">
          <Col sm={7} md={6}>
            <CustomInputGroup
              size="lg"
              label="New password"
              inputType={showPassword ? 'text' : 'password'}
              password
              showPassword={showPassword}
              passwordVisiblility={() => setShowPassword(!showPassword)}
              name="newPassword"
              value={newPassword}
              onChangeValue={
                (e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(
                  e.target.value,
                )
              }
              autoComplete="new-password"
            />
            <p className="my-3">Your new password must be at least 8 characters and contain at least one (1) special character and at least one (1) capital letter.</p>
            <CustomInputGroup
              size="lg"
              label="Re-enter new password"
              inputType={showConfirmPassword ? 'text' : 'password'}
              password
              showPassword={showConfirmPassword}
              passwordVisiblility={() => setShowConfirmPassword(!showConfirmPassword)}
              name="newPasswordConfirmation"
              value={newPasswordConfirmation}
              onChangeValue={
                (e: React.ChangeEvent<HTMLInputElement>) => setNewPasswordConfirmation(
                  e.target.value,
                )
              }
            />
            <ErrorMessageList errorMessages={errorMessages} divClass="mt-3 text-start" className="m-0" />
            <ProgressButton label="Reset password" onClick={handleSubmit} className="mt-3 w-100" />
          </Col>
        </Row>
      </>
    );
  };

  return (
    <div className="d-flex justify-content-center">
      <div className="text-center">
        <h1 className="mb-3">Reset Your Password</h1>
        {renderContent()}
      </div>
    </div>
  );
}

export default ResetPassword;
