/* eslint-disable max-len */
import React from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import copy from 'copy-to-clipboard';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ModalContainer from './CustomModal';
import ShareAsApostIcon from '../../images/share-links-modal-share-as-a-post.png';
import ShareAsAmessageIcon from '../../images/share-links-modal-share-as-a-message.png';
import CopyLinkIcon from '../../images/share-links-modal-copy-links.png';
import FacebookIcon from '../../images/share-links-modal-facebook.png';
import InstagramIcon from '../../images/share-links-modal-instagram.png';
import TwitterIcon from '../../images/share-links-modal-twitter.png';
import { enableDevFeatures } from '../../constants';
import { isMovieDetailsPageSubRoutes } from '../../utils/url-utils';

const FRONTEND_URL = `${window.location.protocol}//${window.location.host}`;

export const copyUrlToClipboard = (copyLinkUrl: string) => {
  copy(`${FRONTEND_URL}${copyLinkUrl}`);
};

function ShareIconButton({ label, onClick, imgSrc }: any) {
  return (
    <button style={{ width: 80 }} className="border-0 p-0 pb-1 pt-2 bg-black text-white rounded" type="button" onClick={onClick}>
      <img className="d-block mx-auto pt-1" width={60} alt="copy link icon" src={imgSrc} />
      <div className="mt-2">{label}</div>
    </button>
  );
}

function ShareLinksModal({ copyLinkUrl, show, setShow }: any) {
  const params = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleCloseModal = () => {
    setShow(false);
  };

  return (
    <ModalContainer
      $widthMarginAuto
      show={show}
      centered
      onHide={handleCloseModal}
      size="lg"
    >
      <Modal.Header className="border-0 shadow-none justify-content-end" closeButton />
      <Modal.Body className="d-flex flex-column align-items-center text-center mx-5 px-5 pt-0 pb-0 mb-5">
        <h1 className="mb-0 text-primary text-center mx-4">Share</h1>
        <Row xs={3} lg="auto" className="mt-4">
          {isMovieDetailsPageSubRoutes(pathname)
            && (
              <Col className="pb-5">
                <ShareIconButton label="Share as a post" onClick={() => { navigate(`/app/posts/create?movieId=${params.id}`, { state: pathname }); }} imgSrc={ShareAsApostIcon} />
              </Col>
            )}
          {
            enableDevFeatures && (
              <Col className="pb-5">
                <ShareIconButton label="Share as a message" onClick={() => { }} imgSrc={ShareAsAmessageIcon} />
              </Col>
            )
          }
          <Col className="pb-5">
            <ShareIconButton label="Copy link" onClick={() => { handleCloseModal(); copyUrlToClipboard(copyLinkUrl); }} imgSrc={CopyLinkIcon} />
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
      </Modal.Body>
    </ModalContainer>
  );
}

export default ShareLinksModal;
