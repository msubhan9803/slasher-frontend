import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { userAccountDelete } from '../../../api/users';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import RoundButton from '../../../components/ui/RoundButton';
import { clearSignInCookies } from '../../../utils/session-utils';
import AccountHeader from '../AccountHeader';
import DeleteAccountDialog from './DeleteAccountDialog';

function AccountDelete() {
  const [show, setShow] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const navigate = useNavigate();

  const deleteAccount = () => {
    setShow(!show);
  };
  const handleDeleteAccount = () => {
    userAccountDelete()
      .then(() => clearSignInCookies())
      .then(() => navigate('/sign-in'))
      .catch((error) => setErrorMessage(error.response.data.message));
  };
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper className="container">
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
          {errorMessage && errorMessage.length > 0 && (
            <div className="mt-3 text-start">
              <ErrorMessageList errorMessages={errorMessage} className="m-0" />
            </div>
          )}
          <Row className="mt-3">
            <Col md={3} lg={5}>
              <RoundButton className="fw-bold h-3 w-100" onClick={deleteAccount}>
                Delete account
              </RoundButton>
            </Col>
          </Row>
        </div>
        <DeleteAccountDialog show={show} setShow={setShow} onDeleteClick={handleDeleteAccount} />
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default AccountDelete;
