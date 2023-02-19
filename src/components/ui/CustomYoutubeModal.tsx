import React from 'react';
import { Modal } from 'react-bootstrap';
import styled from 'styled-components';
import CustomModal from './CustomModal';

interface YoutubeProps {
  show: boolean;
  setShow: (val: boolean) => void;
  videokey: string;
}
const StyledIframe = styled.iframe`
  max-height: 75vh;
  aspect-ratio: 1.77777778;
`;
function CustomYoutubeModal({ show, setShow, videokey }: YoutubeProps) {
  return (
    <CustomModal
      show={show}
      size="xl"
      fullscreen="lg-down"
      aria-label="YouTube video modal"
      centered
      onHide={() => { setShow(false); }}
    >
      <Modal.Header closeButton />
      <Modal.Body>
        <div className="d-flex h-100">
          <StyledIframe
            width="100%"
            height="725"
            src={`https://www.youtube.com/embed/${videokey}?autoplay=1`}
            title="YouTube video player"
            className="border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </Modal.Body>
    </CustomModal>
  );
}

export default CustomYoutubeModal;
