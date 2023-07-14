import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { userAccountDelete } from '../../../api/users';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import RoundButton from '../../../components/ui/RoundButton';
import { clearUserSession } from '../../../utils/session-utils';
import AccountHeader from '../AccountHeader';
import DeleteAccountDialog from './DeleteAccountDialog';

function AccountDelete() {
  const [show, setShow] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();

  const deleteAccount = () => {
    setShow(!show);
  };
  const handleDeleteAccount = () => {
    userAccountDelete()
      .then(() => clearUserSession())
      .catch((error) => setErrorMessage(error.response.data.message));
  };
  return (
    <div>
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
        <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
        <Row className="mt-3">
          <Col md={3} lg={5}>
            <RoundButton className="fw-bold h-3 w-100" onClick={deleteAccount}>
              Delete account
            </RoundButton>
          </Col>
        </Row>
      </div>
      <DeleteAccountDialog show={show} setShow={setShow} onDeleteClick={handleDeleteAccount} />
    </div>
  );
}

export default AccountDelete;
