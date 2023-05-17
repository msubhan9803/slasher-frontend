import React from 'react';
import { Form, Modal } from 'react-bootstrap';
import RoundButton from './RoundButton';

type Props = {
  rssfeedProviderId?: string | undefined, checked: boolean, setChecked: Function,
  closeModal: Function, handleBlockUser: Function,
};
function ModalBodyForReportSuccess({
  rssfeedProviderId, checked, setChecked, closeModal, handleBlockUser,
}: Props) {
  const postReportCloseClick = () => {
    if (checked) {
      handleBlockUser();
    } else {
      closeModal();
    }
  };

  return (
    <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
      <h1 className="h3 mb-0 text-primary pb-3">Block</h1>
      <p className="px-3">Thank you for your report. We will review it as soon as possible</p>

      {/* Ask to block user as well (when post is not a rssFeedPost) */}
      {!rssfeedProviderId
        && (
          <div className="d-flex pb-5">
            <div className="pe-3">
              Would you like to block this user?
            </div>
            <Form.Check
              type="checkbox"
              onChange={() => setChecked(!checked)}
              checked={checked}
            />

          </div>
        )}
      <RoundButton className="mb-3 w-100 fs-3" onClick={postReportCloseClick}>{checked ? 'Block and close' : 'Close'}</RoundButton>
    </Modal.Body>
  );
}

ModalBodyForReportSuccess.defaultProps = {
  rssfeedProviderId: undefined,
};

export default ModalBodyForReportSuccess;
