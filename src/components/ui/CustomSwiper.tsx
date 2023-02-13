import React, { useState } from 'react';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper';
import 'swiper/swiper-bundle.css';
import { Link } from 'react-router-dom';
import { brands } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal } from 'react-bootstrap';
import CustomModal from './CustomModal';

interface SliderImage {
  postId: string;
  imageId: string;
  imageUrl: string;
  linkUrl?: string;
  videoKey?: string;
}

interface Props {
  images: SliderImage[];
  initialSlide?: number;
  onSelect?: (value: string) => void;
}
const StyledYouTubeButton = styled(Button)`
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 10px;
  margin-left: -2em;
  margin-top: -2em;
`;
const StyledIframe = styled.iframe`
  max-height: 75vh;
  aspect-ratio: 1.77777778;
`;

const StyledSwiper = styled(Swiper)`
  width: 100%;
  height: 100%;
  z-index: 0 !important;
.swiper-button-prev {
  color: var(--bs-primary);
}
.swiper-button-next {
  color: var(--bs-primary);
}
.swiper-slide {
  text-align: center;
  font-size: 1.125rem;
  background: #000;
  height:450px;

  /* Center slide text vertically */
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
}

.swiper-pagination {
  position: revert !important;
}
`;
const PostImage = styled.div`
  height: 100%;
  position: relative;
  img {
    object-fit: contain;
  }
`;
function CustomSwiper({ images, initialSlide, onSelect }: Props) {
  const [showVideoPlayerModal, setShowYouTubeModal] = useState(false);

  const displayVideoAndImage = (imageAndVideo: SliderImage) => {
    if (imageAndVideo.videoKey) {
      return (
        <PostImage>
          <img
            src={`https://img.youtube.com/vi/${imageAndVideo.videoKey}/hqdefault.jpg`}
            className="w-100 h-100"
            alt="user uploaded content"
          />
          <StyledYouTubeButton
            variant="link"
            onClick={(e: React.MouseEvent) => { e.preventDefault(); setShowYouTubeModal(true); }}
          >
            <FontAwesomeIcon icon={brands('youtube')} size="4x" />
          </StyledYouTubeButton>
        </PostImage>
      );
    }
    if (imageAndVideo.linkUrl) {
      return (
        <Link
          to={imageAndVideo.linkUrl}
          onClick={() => onSelect!(imageAndVideo.postId)}
          className="h-100"
        >
          <PostImage>
            <img src={imageAndVideo.imageUrl} className="w-100 h-100" alt="user uploaded content" />
          </PostImage>
        </Link>
      );
    }
    return (
      <PostImage>
        <img src={imageAndVideo.imageUrl} className="w-100 h-100" alt="user uploaded content" />
      </PostImage>
    );
  };

  const renderVideoPlayerModal = (
    show: boolean,
    youTubeVideoId: string,
  ) => showVideoPlayerModal && (
    <CustomModal
      show={show}
      size="xl"
      fullscreen="lg-down"
      aria-label="YouTube video modal"
      centered
      onHide={() => { setShowYouTubeModal(false); }}
    >
      <Modal.Header closeButton />
      <Modal.Body>
        <div className="d-flex h-100">
          <StyledIframe
            width="100%"
            height="725"
            src={`https://www.youtube.com/embed/${youTubeVideoId}?autoplay=1`}
            title="YouTube video player"
            className="border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </Modal.Body>
    </CustomModal>
  );

  return (
    <>
      <StyledSwiper
        pagination={{ type: 'fraction' }}
        initialSlide={initialSlide}
        navigation
        modules={[Pagination, Navigation]}
      >
        {
          images.map((image: SliderImage) => (
            <SwiperSlide key={`${image.imageId}${image.postId}`}>
              {displayVideoAndImage(image)}
            </SwiperSlide>
          ))
        }
      </StyledSwiper>
      {images?.[0]?.videoKey && renderVideoPlayerModal(showVideoPlayerModal, images?.[0]?.videoKey)}
    </>
  );
}
CustomSwiper.defaultProps = {
  initialSlide: 0,
  onSelect: undefined,
};
export default CustomSwiper;
