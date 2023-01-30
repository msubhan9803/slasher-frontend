import React, { useState } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import CustomInputGroup from '../../components/ui/CustomInputGroup';
import RoundButton from '../../components/ui/RoundButton';

interface UserResetPassword {
  newPassword: string;
  newPasswordConfirmation: string;
}

function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const passwordVisiblility = () => {
    setShowPassword(!showPassword);
  };
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const confirmPasswordVisiblility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const [resetPassword, setResetPassword] = useState<UserResetPassword>({
    newPassword: '',
    newPasswordConfirmation: '',
  });
  const handleResetPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    const passwordData = { ...resetPassword, [event.target.name]: event.target.value };
    setResetPassword(passwordData);
  };
  return (
    <Form>
      <h1 className="text-center">Reset Your Password</h1>
      <p className="text-center mt-3 mb-4">Enter your new password below to gain access to your account again.</p>
      <Row className="justify-content-center py-2">
        <Col sm={7} md={6} xl={5}>
          <CustomInputGroup
            size="lg"
            label="New password"
            inputType={showPassword ? 'text' : 'password'}
            password
            showPassword={showPassword}
            passwordVisiblility={passwordVisiblility}
            name="newPassword"
            value={resetPassword.newPassword}
            onChangeValue={handleResetPassword}
            autoComplete="new-password"
          />
          <p className="my-3">Your new password must be at least 8 characters and contain at least one (1) special character and at least one (1) capital letter.</p>
          <CustomInputGroup
            size="lg"
            label="Re-enter new password"
            inputType={showConfirmPassword ? 'text' : 'password'}
            password
            showPassword={showConfirmPassword}
            passwordVisiblility={confirmPasswordVisiblility}
            name="newPasswordConfirmation"
            value={resetPassword.newPasswordConfirmation}
            onChangeValue={handleResetPassword}
          />
          <RoundButton className="mt-3 w-100">Set password</RoundButton>
        </Col>
      </Row>
    </Form>
  );
}

export default ResetPassword;
