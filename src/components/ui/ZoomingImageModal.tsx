import React, { useEffect } from 'react';
import { Modal, Image } from 'react-bootstrap';
import styled from 'styled-components';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { disableScrollOnWindow, enableScrollOnWindow } from '../../utils/scrollFunctions';
import CustomModal from './CustomModal';

interface Props {
  imgSrc: string;
  imgAlt: string;
  show: boolean;
  onHide: () => void;
}
const ImageWrapper = styled.div`
  cursor: zoom-in;
  max-width: 100%;
  max-height: 100%;
  .image {
    max-height: 90vh;
    max-width: 100vw;
  }
`;
const StyleDiv = styled.div`
  .transform-component-module_wrapper__SPB86 {
    overflow: visible !important;
  }
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
        <div className="w-100 h-100 d-flex align-items-center justify-content-center">
          <StyleDiv className="d-flex justify-content-center align-items-center">
            <TransformWrapper>
              {() => (
                <ImageWrapper>
                  <TransformComponent>
                    <Image
                      className="image"
                      src={imgSrc}
                      alt={imgAlt}
                    />
                  </TransformComponent>
                </ImageWrapper>
              )}
            </TransformWrapper>
          </StyleDiv>
        </div>
      </Modal.Body>
    </CustomModal>

  );
}

export default ZoomableImageModal;
