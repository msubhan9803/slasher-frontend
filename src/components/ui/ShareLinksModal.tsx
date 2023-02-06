import React from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import styled from 'styled-components';
import copy from 'copy-to-clipboard';
import ModalContainer from './CustomModal';
import ShareAsApostIcon from '../../images/share-links-modal-share-as-a-post.png';
import ShareAsAmessageIcon from '../../images/share-links-modal-share-as-a-message.png';
import CopyLinkIcon from '../../images/share-links-modal-copy-links.png';
import FacebookIcon from '../../images/share-links-modal-facebook.png';
import InstagramIcon from '../../images/share-links-modal-instagram.png';
import TwitterIcon from '../../images/share-links-modal-twitter.png';
import { MD_MEDIA_BREAKPOINT } from '../../constants';
import { enableDevFeatures } from '../../utils/configEnvironment';

const StyledModalBody = styled(Modal.Body)`
  @media (min-width: ${MD_MEDIA_BREAKPOINT}){
    margin: 20px 0px 40px;
  }
`;

export const copyUrlToClipboard = () => {
  const { protocol, host, pathname } = window.location;
  copy(`${protocol}/${host}${pathname}`);
};

function ShareIconButton({ label, onClick, imgSrc }: any) {
  return (
    <button style={{ all: 'unset', cursor: 'pointer', width: 80 }} type="button" onClick={onClick}>
      <img className="d-block mx-auto" width={60} alt="copy link icon" src={imgSrc} />
      <div className="mt-2">{label}</div>
    </button>
  );
}

function ShareLinksModal({ show, setShow }: any) {
  const handleCloseModal = () => {
    setShow(false);
  };

  return (
    <ModalContainer
      show={show}
      centered
      onHide={handleCloseModal}
      size="lg"
    >
      <Modal.Header className="border-0 shadow-none justify-content-end" closeButton />
      <StyledModalBody className="d-flex flex-column align-items-center text-center pt-0">
        <h1 className="mb-0 text-primary text-center">Share</h1>
        <Row xs={3} lg="auto" className="mt-4">
          {
            enableDevFeatures && (
              <>
                <Col className="pb-5">
                  <ShareIconButton label="Share as a post" onClick={() => { }} imgSrc={ShareAsApostIcon} />
                </Col>
                <Col className="pb-5">
                  <ShareIconButton label="Share as a message" onClick={() => { }} imgSrc={ShareAsAmessageIcon} />
                </Col>
              </>
            )
          }
          <Col className="pb-5">
            <ShareIconButton label="Copy link" onClick={() => { handleCloseModal(); copyUrlToClipboard(); }} imgSrc={CopyLinkIcon} />
          </Col>
          {
            enableDevFeatures && (
              <>
                <Col className="pb-5">
                  <ShareIconButton label="Facebook" onClick={() => { }} imgSrc={FacebookIcon} />
                </Col>
                <Col className="pb-5">
                  <ShareIconButton label="Instagram" onClick={() => { }} imgSrc={InstagramIcon} />
                </Col>
                <Col className="pb-5">
                  <ShareIconButton label="Twitter" onClick={() => { }} imgSrc={TwitterIcon} />
                </Col>
              </>
            )
          }
        </Row>
      </StyledModalBody>
    </ModalContainer>
  );
}

export default ShareLinksModal;
