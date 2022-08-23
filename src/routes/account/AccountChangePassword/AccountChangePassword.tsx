import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import AccountHeader from '../AccountHeader';

function AccountChangePassword() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <AccountHeader tabKey="change-password" />
      <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-4  my-3">
        <Row>
          <p className="fs-5">Enter a new password below to change your password.</p>
          <Col md={6} lg={12} xl={6} className="mt-3">
            <Form.Control type="text" placeholder="Password" className="fs-4" />
          </Col>
        </Row>
        <Row className="mt-3">
          <Col md={6} lg={12} xl={6}>
            <p className="fs-4 text-light">
              Your password must be at least 8 characters and contain at least one (1)
              special character and at least one (1) capital letter.
            </p>
          </Col>
        </Row>
        <Row>
          <Col md={6} lg={12} xl={6} className="mt-3">
            <Form.Control type="text" placeholder="New password" className="fs-4" />
          </Col>
        </Row>
        <Row>
          <Col md={6} lg={12} xl={6} className="mt-3">
            <Form.Control type="text" placeholder="Re-enter new password" className="fs-4" />
          </Col>
        </Row>
        <Row className="mt-4">
          <Col md={3} lg={5}>
            <RoundButton className="fw-bold h-3 w-100">
              Change password
            </RoundButton>
          </Col>
        </Row>

      </div>
    </AuthenticatedPageWrapper>
  );
}

export default AccountChangePassword;
