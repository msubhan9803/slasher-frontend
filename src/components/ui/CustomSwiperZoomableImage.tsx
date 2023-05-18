import React, { useState } from 'react';
import 'swiper/swiper-bundle.css';
import { Button } from 'react-bootstrap';
import ZoomableImageModal from './ZoomingImageModal';

interface Props {
  src: string;
  alt: string;
  className?: string;
  onImgError: (e: any) => void;
  onImgLoad?: () => void;
}

function CustomSwiperZoomableImage({
  src, className, alt, onImgError, onImgLoad,
}: Props) {
  const [showZoomModal, setShowZoomModal] = useState(false);
  return (
    <div className={className}>
      <Button variant="link" className="cursor-zoom-in p-0 h-100" onClick={() => setShowZoomModal(true)}>
        <img
          src={src}
          className="w-100 h-100"
          alt={alt}
          onError={onImgError}
          onLoad={onImgLoad}
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

CustomSwiperZoomableImage.defaultProps = {
  className: '',
  onImgLoad: undefined,
};

export default CustomSwiperZoomableImage;
