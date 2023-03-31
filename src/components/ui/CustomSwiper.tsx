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
import CustomSwiperZoomableImage from './CustomSwiperZoomableImage';

interface SliderImage {
  postId?: string;
  imageId: string;
  imageUrl: string;
  linkUrl?: string;
  videoKey?: string;
}

type SwiperContext = 'post' | 'comment';

interface Props {
  context: SwiperContext;
  images: SliderImage[];
  initialSlide?: number;
  onSelect?: (value: string) => void;
}

const heightForContext: Record<SwiperContext, string> = {
  comment: '275px',
  post: '450px',
};

const StyledYouTubeButton = styled(Button)`
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 10px;
  margin-left: -2em;
  margin-top: -2em;
`;
const StyledSwiper = styled(Swiper)`
  width: auto;
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
  height:100%;
  width: fit-content;

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
`;
const SwiperContentContainer = styled.div`
  height: 100%;
  position: relative;
  img {
    object-fit: contain;
  }
`;

let instanceCounter = 0;

function CustomSwiper({
  context, images, initialSlide, onSelect,
}: Props) {
  const uniqueId = `${instanceCounter += 1}`;
  const [showVideoPlayerModal, setShowYouTubeModal] = useState(false);
  const { placeholderUrlNoImageAvailable } = useAppSelector((state) => state.remoteConstants);
  const [hideSwiper, setHideSwiper] = useState(false);

  const displayVideoAndImage = (imageAndVideo: SliderImage) => {
    if (imageAndVideo.videoKey) {
      return (
        <SwiperContentContainer>
          <img
            src={`https://img.youtube.com/vi/${imageAndVideo.videoKey}/hqdefault.jpg`}
            className="w-100 h-100"
            alt="user uploaded content"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              if (images.length > 1) {
                e.currentTarget.src = placeholderUrlNoImageAvailable;
              } else {
                setHideSwiper(true);
              }
            }}
            onLoad={() => setHideSwiper(false)}
          />
          <StyledYouTubeButton
            variant="link"
            onClick={(e: React.MouseEvent) => { e.preventDefault(); setShowYouTubeModal(true); }}
          >
            <FontAwesomeIcon icon={brands('youtube')} size="4x" />
          </StyledYouTubeButton>
        </SwiperContentContainer>
      );
    }
    if (imageAndVideo.linkUrl) {
      return (
        <Link
          to={imageAndVideo.linkUrl}
          onClick={
            imageAndVideo.postId ? () => onSelect!(imageAndVideo.postId as string) : undefined
          }
          className="h-100"
        >
          <SwiperContentContainer>
            <img
              src={imageAndVideo.imageUrl}
              className="w-100 h-100"
              alt="user uploaded content"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                if (images.length > 1) {
                  e.currentTarget.src = placeholderUrlNoImageAvailable;
                } else {
                  setHideSwiper(true);
                }
              }}
              onLoad={() => setHideSwiper(false)}
            />
          </SwiperContentContainer>
        </Link>
      );
    }
    return (
      <SwiperContentContainer>
        <CustomSwiperZoomableImage
          className="h-100"
          src={imageAndVideo.imageUrl}
          alt="user uploaded content"
          onImgError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            if (images.length > 1) {
              e.currentTarget.src = placeholderUrlNoImageAvailable;
            } else {
              setHideSwiper(true);
            }
          }}
          onImgLoad={() => setHideSwiper(false)}
        />
      </SwiperContentContainer>
    );
  };

  return (
    <div style={{ height: heightForContext[context] }} className={images.length > 1 ? 'mb-4' : ''}>
      <StyledSwiper
        pagination={{ type: 'fraction', el: `#swiper-pagination-el-${uniqueId}` }}
        initialSlide={initialSlide}
        navigation
        modules={[Pagination, Navigation]}
        className={hideSwiper ? 'd-none' : 'd-block'}
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
      <div id={`swiper-pagination-el-${uniqueId}`} className="text-center my-2" />
    </div>
  );
}
CustomSwiper.defaultProps = {
  initialSlide: 0,
  onSelect: undefined,
};
export default CustomSwiper;
