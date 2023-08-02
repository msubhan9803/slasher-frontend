import React from 'react';
import { Form, Modal } from 'react-bootstrap';
import { ProgressButtonComponentType } from './ProgressButton';

type Props = {
  rssfeedProviderId?: string | undefined, checked: boolean, setChecked: Function,
  closeModal: Function, handleBlockUser: Function,
  ProgressButton: ProgressButtonComponentType | any;
};
function ModalBodyForReportSuccess({
  rssfeedProviderId, checked, setChecked, closeModal, handleBlockUser, ProgressButton,
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
      <h1 className="h3 mb-0 text-primary pb-3">Report sent</h1>
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
      <ProgressButton id="block-close-button" type="submit" onClick={postReportCloseClick} className="mb-3 w-100 fs-3" label={checked ? 'Block and close' : 'Close'} />
    </Modal.Body>
  );
}

ModalBodyForReportSuccess.defaultProps = {
  rssfeedProviderId: undefined,
};

export default ModalBodyForReportSuccess;
