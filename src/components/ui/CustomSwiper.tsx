import React, { useState } from 'react';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper';
import 'swiper/swiper-bundle.css';
import { Link } from 'react-router-dom';
import { brands } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import CustomYoutubeModal from './CustomYoutubeModal';
import { useAppSelector } from '../../redux/hooks';

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
  background: var(--bs-black);
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
  const { placeholderUrlNoImageAvailable } = useAppSelector((state) => state.remoteConstants);

  const displayVideoAndImage = (imageAndVideo: SliderImage) => {
    if (imageAndVideo.videoKey) {
      return (
        <PostImage>
          <img
            src={`https://img.youtube.com/vi/${imageAndVideo.videoKey}/hqdefault.jpg`}
            className="w-100 h-100"
            alt="user uploaded content"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              e.currentTarget.src = placeholderUrlNoImageAvailable;
            }}
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
            <img
              src={imageAndVideo.imageUrl}
              className="w-100 h-100"
              alt="user uploaded content"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = placeholderUrlNoImageAvailable;
              }}
            />
          </PostImage>
        </Link>
      );
    }
    return (
      <PostImage>
        <img
          src={imageAndVideo.imageUrl}
          className="w-100 h-100"
          alt="user uploaded content"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = placeholderUrlNoImageAvailable;
          }}
        />
      </PostImage>
    );
  };

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
      {images?.[0]?.videoKey
        && (
          <CustomYoutubeModal
            show={showVideoPlayerModal}
            setShow={setShowYouTubeModal}
            videokey={images?.[0]?.videoKey}
          />
        )}
    </>
  );
}
CustomSwiper.defaultProps = {
  initialSlide: 0,
  onSelect: undefined,
};
export default CustomSwiper;
