import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Form, Image, Modal,
} from 'react-bootstrap';
import styled from 'styled-components';
import CustomModal from './CustomModal';
import RoundButton from './RoundButton';

interface ImageContainerProps {
  image: any;
  alt: string;
  handleRemoveImage: (image: File, id?: string) => void;
  containerClass: string;
  removeIconStyle: any;
  containerWidth: string;
  containerHeight: string;
  containerBorder: string;
  dataId?: string;
  onAltTextChange?: (newValue: string) => void;
}
interface StyledImageContainerProps {
  width: string;
  height: string;
  border: string;
}
const StyledImageContainer = styled.div<StyledImageContainerProps>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  border: ${(props) => props.border};
`;

function ImagesContainer({
  image, alt, handleRemoveImage, containerClass, removeIconStyle,
  containerWidth, containerHeight, containerBorder, dataId, onAltTextChange,
}: ImageContainerProps) {
  const [altText, setAltText] = useState(alt);
  const [showAltTextEditModal, setShowAltTextEditModal] = useState(false);

  const onSave = () => {
    onAltTextChange?.(altText);
    setShowAltTextEditModal(false);
  };

  return (
    <div style={{ width: containerWidth }}>
      <StyledImageContainer
        width={containerWidth}
        height={containerHeight}
        border={containerBorder}
        className={containerClass}
      >
        <Image
          src={
            (image && image.image_path) ? image.image_path : URL.createObjectURL(image)
          }
          alt={alt}
          className="w-100 h-100 img-fluid rounded"
        />
        <FontAwesomeIcon
          icon={solid('times')}
          size="xs"
          role="button"
          className="position-absolute bg-primary text-black rounded-circle"
          style={removeIconStyle}
          onClick={() => (dataId ? handleRemoveImage(image, dataId) : handleRemoveImage(image))}
        />
      </StyledImageContainer>
      <div className="text-center mt-2">
        <RoundButton variant="black" onClick={() => { setShowAltTextEditModal(true); }}>Edit alt text</RoundButton>
      </div>
      <CustomModal
        show={showAltTextEditModal}
        onHide={() => { setShowAltTextEditModal(false); }}
        onShow={() => { (document.querySelector('.alt-text-editor-input')! as HTMLTextAreaElement).focus(); }}
        centered
      >
        <Modal.Header className="border-0 shadow-none" closeButton>
          <span className="text-primary">Edit Alt Text</span>
        </Modal.Header>

        <Modal.Body>
          {/* <h3 className="h2 text-primary text-center mb-3">Edit Alt Text</h3> */}
          <Form.Control
            as="textarea"
            aria-label="Alt text description for this image"
            rows={3}
            className="alt-text-editor-input"
            defaultValue={alt}
            onChange={(e) => { setAltText(e.target.value); }}
          />
          <RoundButton variant="primary" className="w-100 mt-4 mb-3" onClick={() => { onSave(); }}>Save changes</RoundButton>
        </Modal.Body>
      </CustomModal>
    </div>
  );
}

ImagesContainer.defaultProps = {
  dataId: undefined,
  onAltTextChange: undefined,
};

export default ImagesContainer;
