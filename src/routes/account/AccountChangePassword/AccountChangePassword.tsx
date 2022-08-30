import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import AccountHeader from '../AccountHeader';

function AccountChangePassword() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <AccountHeader tabKey="change-password" />
      <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-4  my-3">
        <p className="fs-5 m-0">Enter your current password, then enter a new password below to change your password.</p>
        <p className="fs-5">
          If you do not remember your current password
          <Link to="/account/change-password" className="text-primary">
            &nbsp;click here
          </Link>
          .
        </p>
        <Row>
          <Col md={6} lg={12} xl={6} className="mt-2">
            <Form>
              <Form.Control type="text" placeholder="Current password" className="fs-5" />
              <Form.Control type="text" placeholder="New password" className="fs-5 my-3" />
              <p className="fs-4 text-light">
                Your new password must be at least 8 characters and contain at least one (1)
                special character and atleast one (1) capital letter.
              </p>
              <Form.Control type="text" placeholder="Re-enter new password" className="fs-5 my-4" />
              <RoundButton className="fw-bold h-3 w-100 mt-2">
                Change password
              </RoundButton>
            </Form>
          </Col>
        </Row>

      </div>
    </AuthenticatedPageWrapper>
  );
}

export default AccountChangePassword;
