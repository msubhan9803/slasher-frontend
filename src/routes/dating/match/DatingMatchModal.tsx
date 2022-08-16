import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Image, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import ModalContainer from '../../../components/ui/CustomModal';
import RoundButton from '../../../components/ui/RoundButton';

interface ModalProps {
  show: boolean;
  setShow: (value: boolean) => void;
  isSubscriber: string
}
interface Props {
  user?: boolean
}
const ImageContainer = styled.div<Props>`
  aspect-ratio:1;
  border: 0.143rem solid #FFFFFF;
  margin-right:${(props) => (props.user && '-1.571rem')};
  z-index: ${(props) => (props.user && '1')};
  position: ${(props) => (props.user && 'relative')} ;
`;
function DatingMatchModal({ show, setShow, isSubscriber }: ModalProps) {
  const closeModal = () => {
    setShow(false);
  };
  return (
    <ModalContainer
      show={show}
      centered
      onHide={closeModal}
      size="md"
    >
      <Modal.Header className="border-0 shadow-none justify-content-end" closeButton />

      <Modal.Body className="d-flex flex-column text-center pt-0 p-5 mx-md-5 ">
        <h1 className="mb-0">It’s a match!</h1>
        <div className="d-flex mt-5">
          <ImageContainer className="rounded-circle" user>
            <Image src="https://i.pravatar.cc/300?img=12" className="rounded-circle w-100 h-100" />
          </ImageContainer>
          {isSubscriber === 'Subscriber'
            ? (
              <ImageContainer className="rounded-circle">
                <Image src="https://i.pravatar.cc/300?img=47" className="rounded-circle  w-100 h-100" />
              </ImageContainer>
            )
            : (
              <ImageContainer className=" d-flex align-items-center justify-content-center rounded-circle">
                <FontAwesomeIcon icon={solid('question')} className="me-1 h-100 w-100" />
              </ImageContainer>
            )}
        </div>
        {isSubscriber === 'Subscriber'
          && <p className="fs-3 mt-4 mb-0">You and Eliza have liked each other</p>}
        <RoundButton className={`mb-3 fs-2 w-100 ${isSubscriber === 'Subscriber' ? 'mt-4' : 'mt-5'}`}>
          {isSubscriber === 'Subscriber' ? 'Send a message' : 'Click here to see who likes you!'}
        </RoundButton>
      </Modal.Body>
    </ModalContainer>
  );
}

export default DatingMatchModal;
