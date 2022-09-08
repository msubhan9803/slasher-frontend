import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import AccountHeader from '../AccountHeader';
import DeleteAccountDialog from './DeleteAccountDialog';

function AccountDelete() {
  const [show, setShow] = useState<boolean>(false);
  const deleteAccount = () => {
    setShow(!show);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <AccountHeader tabKey="delete-account" />
      <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-4  my-3">
        <Row>
          <Col md={7} lg={12} xl={7}>
            <p className="fs-4">
              Deleting your account is permanent and cannot be undone. If you would like
              to return to Slasher in the future, you will need to create a new account.
            </p>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col md={3} lg={5}>
            <RoundButton className="fw-bold h-3 w-100" onClick={deleteAccount}>
              Delete account
            </RoundButton>
          </Col>
        </Row>
      </div>
      <DeleteAccountDialog show={show} setShow={setShow} />
    </AuthenticatedPageWrapper>
  );
}

export default AccountDelete;
