/* eslint-disable max-lines */
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper';
import 'swiper/swiper-bundle.css';
import { Link, useNavigate } from 'react-router-dom';
import { brands } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Image } from 'react-bootstrap';
import { DateTime } from 'luxon';
import CustomYoutubeModal from './CustomYoutubeModal';
import { useAppSelector } from '../../redux/hooks';
import CustomSwiperZoomableImage from './CustomSwiperZoomableImage';
import { StyledMoviePoster } from '../../routes/movies/movie-details/StyledUtils';
import RoundButton from './RoundButton';
import { LG_MEDIA_BREAKPOINT, MD_MEDIA_BREAKPOINT, XL_MEDIA_BREAKPOINT } from '../../constants';

interface SliderImage {
  postId?: string;
  imageId: string;
  // `displayVideoAndImage()` make use one of below keys to render resource
  imageUrl: string;
  linkUrl?: string;
  videoKey?: string;
  imageDescription?: string;
  movieData?: {
    poster_path: string,
    title: string,
    release_date: string,
    _id: string, // `movieId`
  }
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
  padding: 2px 0px;

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

const CssForColumnView = css`
  & {
    flex-direction: column-reverse;
  }
  .text__details {
    padding-inline-start: 0px;
  }
`;

const MoviePosterWithAdditionDetails = styled.div`
  display: flex;
  .text__details {
    margin: auto;
    padding-inline-start: 24px;
    text-align: left;
  }
  @media (max-width: ${XL_MEDIA_BREAKPOINT}) and (min-width: ${LG_MEDIA_BREAKPOINT}) {
    ${CssForColumnView}
  }
  @media (max-width: ${MD_MEDIA_BREAKPOINT}) {
    ${CssForColumnView}
  }
`;

let instanceCounter = 0;

function CustomSwiper({
  context, images, initialSlide, onSelect,
}: Props) {
  const uniqueId = `${instanceCounter += 1}`;
  const [showVideoPlayerModal, setShowYouTubeModal] = useState(false);
  const { placeholderUrlNoImageAvailable } = useAppSelector((state) => state.remoteConstants);
  const navigate = useNavigate();

  const displayVideoAndImage = (imageAndVideo: SliderImage) => {
    if (imageAndVideo.videoKey) {
      return (
        <SwiperContentContainer>
          <img
            src={`https://img.youtube.com/vi/${imageAndVideo.videoKey}/hqdefault.jpg`}
            className="w-100 h-100"
            alt={`${imageAndVideo.imageDescription ? imageAndVideo.imageDescription : 'user uploaded content'} `}
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
              alt={`${imageAndVideo.imageDescription ? imageAndVideo.imageDescription : 'user uploaded content'} `}
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = placeholderUrlNoImageAvailable;
              }}
            />
          </SwiperContentContainer>
        </Link>
      );
    }
    if (imageAndVideo.movieData) {
      return (
        <SwiperContentContainer>
          <MoviePosterWithAdditionDetails>
            <div className="py-3">
              <StyledMoviePoster className="h-100">
                <Image
                  src={imageAndVideo?.movieData?.poster_path}
                  alt="movie poster"
                  className="rounded-3 w-100 h-100"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    e.currentTarget.src = placeholderUrlNoImageAvailable;
                  }}
                />
              </StyledMoviePoster>
            </div>
            <div className="text__details">
              <div className="fw-bold mb-1">
                {imageAndVideo?.movieData?.title}
              </div>
              <div className="text-light mb-2">
                {imageAndVideo?.movieData?.release_date
                  && DateTime.fromJSDate(new Date(imageAndVideo?.movieData?.release_date)).toFormat('yyyy')}
              </div>
              <RoundButton className="btn btn-form bg-black rounded-5 d-flex px-4" onClick={() => navigate(`/app/movies/${imageAndVideo?.movieData?._id}/details`)}>
                View details
              </RoundButton>

            </div>
          </MoviePosterWithAdditionDetails>
        </SwiperContentContainer>
      );
    }
    return (
      <SwiperContentContainer>
        <CustomSwiperZoomableImage
          className="h-100"
          src={imageAndVideo.imageUrl}
          alt={`${imageAndVideo.imageDescription ? imageAndVideo.imageDescription : 'user uploaded content'} `}
          onImgError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            e.currentTarget.src = placeholderUrlNoImageAvailable;
          }}
        />
      </SwiperContentContainer>
    );
  };

  return (
    <div style={{ height: heightForContext[context] }} className={`${images.length > 1 ? 'mb-4' : ''}`}>
      <StyledSwiper
        pagination={{ type: 'fraction', el: `#swiper-pagination-el-${uniqueId}` }}
        initialSlide={initialSlide}
        navigation
        modules={[Pagination, Navigation]}
      >
        {
          images.map((image: SliderImage) => (
            <SwiperSlide
              key={`${image.imageId}${image.postId}`}
            >
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
