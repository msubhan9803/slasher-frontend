import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Form, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import ModalContainer from '../../../components/ui/CustomModal';
import RoundButton from '../../../components/ui/RoundButton';

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  values: string
}

function DatingLikesModal({ show, setShow, values }: Props) {
  const closeModal = () => {
    setShow(false);
  };
  const blockOptions = ['Inappropriate profile', 'Fake photo', 'Spam', 'Other'];
  const [interests, setInterests] = useState<Set<string>>(new Set<string>());

  const interestsChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, value } = e.target;
    const newSet = new Set<string>(interests);
    if (checked) { newSet.add(value); } else { newSet.delete(value); }
    setInterests(newSet);
  };
  return (
    <ModalContainer
      show={show}
      centered
      onHide={closeModal}
    >
      {values === '' && (
        <>
          <Modal.Header className="border-0 shadow-none" closeButton />
          <Modal.Body className="d-flex flex-column align-items-center text-center pb-5">
            <FontAwesomeIcon icon={solid('user-plus')} size="2x" className="border border-primary mb-4 rounded-5 text-primary" style={{ padding: '15px 12px' }} />
            <h3> Want to see who likes you?</h3>
            <Link to="/dating/likes" className="text-decoration-none text-primary">
              Click here
            </Link>
          </Modal.Body>
        </>
      )}
      {values === 'unmatch' && (
        <>
          <Modal.Header className="border-0 shadow-none" closeButton />
          <Modal.Body className="d-flex flex-column align-items-center text-center p-5 pt-4">
            <h3 className="text-primary mb-3"> Are you sure you want to unmatch? </h3>
            <RoundButton className="mb-3 w-100">Yes</RoundButton>
            <RoundButton className="mb-3 w-100 bg-dark border-dark">No</RoundButton>
          </Modal.Body>
        </>
      )}
      {values === 'report' && (
        <>
          <Modal.Header className="border-0 shadow-none" closeButton />
          <Modal.Body className="d-flex flex-column align-items-center text-center p-5 pt-4">
            <h3 className="text-primary mb-3"> Block &#38; Report </h3>
            {blockOptions.map((interest: string, index: number) => (
              <Form.Check
                type="checkbox"
                id={`interest-${index}`}
                checked={interests.has(interest)}
                className="mb-2"
                label={interest}
                value={interest}
                onChange={interestsChangeHandler}
              />
            ))}
            <RoundButton className="mb-3 w-100">Yes</RoundButton>
            <RoundButton className="mb-3 w-100 bg-dark border-dark">No</RoundButton>
          </Modal.Body>
        </>
      )}
    </ModalContainer>
  );
}

export default DatingLikesModal;
