import React, { useState } from 'react';
import {
  Button,
} from 'react-bootstrap';
import ZoomableImageModal from './ZoomingImageModal';

interface Props {
  src: string;
  alt: string;
  imgClassName?: string;
  imgStyle?: React.CSSProperties;
  containerClassName?: string;
  containerStyle?: React.CSSProperties;
  onLoad?: () => void;
}

function ZoomableImage({
  src, alt, imgClassName, imgStyle, containerClassName, containerStyle, onLoad,
}: Props) {
  const [showZoomModal, setShowZoomModal] = useState(false);

  return (
    <div className={containerClassName} style={containerStyle}>
      <Button variant="link" className="cursor-zoom-in p-0" onClick={() => setShowZoomModal(true)}>
        <img
          className={imgClassName}
          style={imgStyle}
          alt={alt}
          src={src}
          onLoad={onLoad}
        />
      </Button>
      <ZoomableImageModal
        imgSrc={src}
        imgAlt={alt}
        show={showZoomModal}
        onHide={() => setShowZoomModal(false)}
      />
    </div>
  );
}

ZoomableImage.defaultProps = {
  imgClassName: undefined,
  containerClassName: undefined,
  imgStyle: {},
  containerStyle: {},
  onLoad: undefined,
};

export default ZoomableImage;
