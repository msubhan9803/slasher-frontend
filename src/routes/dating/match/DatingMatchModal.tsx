import React from 'react';
import { Image, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import ModalContainer from '../../../components/ui/CustomModal';
import RoundButton from '../../../components/ui/RoundButton';
import questionMark from '../../../images/question-mark.png';
import userProfile from '../../../images/dating-match.png';

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
            <Image src={userProfile} className="rounded-circle w-100 h-100" />
          </ImageContainer>
          {isSubscriber === 'Subscriber'
            ? (
              <ImageContainer className="rounded-circle">
                <Image src={userProfile} className="rounded-circle  w-100 h-100" />
              </ImageContainer>
            )
            : (
              <ImageContainer className="rounded-circle">
                <Image src={questionMark} className="w-100 h-100 rounded-circle" />
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
