import React, { useEffect } from 'react';
import { Image, Modal } from 'react-bootstrap';
import styled from 'styled-components';
import CustomModal from './CustomModal';
import { disableScrollOnWindow, enableScrollOnWindow } from '../../utils/scrollFunctions';

interface Props {
  imgSrc: string;
  imgAlt: string;
  show: boolean;
  onHide: () => void;
}

const FullscreenImage = styled(Image)`
  display: block;
  max-width: 100%;
  max-height: 100%;
  height: auto;
  margin: auto;
`;

function ZoomableImageModal({
  imgSrc, imgAlt, show, onHide,
}: Props) {
  useEffect(() => {
    if (show) { disableScrollOnWindow(); } else { enableScrollOnWindow(); }
  }, [show]);

  return (
    <CustomModal show={show} fullscreen onHide={onHide}>
      <Modal.Header closeButton />
      <Modal.Body>
        <div className="w-100 h-100 d-flex align-items-center">
          <FullscreenImage alt={imgAlt} src={imgSrc} />
        </div>
      </Modal.Body>
    </CustomModal>
  );
}

export default ZoomableImageModal;
