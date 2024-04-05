/* eslint-disable max-lines */
import React, { useState } from 'react';
import styled from 'styled-components';
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
import {
  isNativePlatform,
} from '../../constants';
import LoadingIndicator from './LoadingIndicator';
import { youtube } from '../../api/youtube';

interface SliderImage {
  postId?: string;
  imageId: string;
  // `displayVideoAndImage()` make use one of below keys to render resource
  imageUrl: string;
  linkUrl?: string;
  videoKey?: string;
  imageDescription?: string;
  posterData?: {
    poster_path: string,
    title: string,
    release_date: string,
    _id: string, // `movieId`
    type: string,
    postId: string,
  }
}

type SwiperContext = 'post' | 'comment' | 'shareMoviePost' | 'shareBookPost';

interface Props {
  context: SwiperContext;
  images: SliderImage[];
  initialSlide?: number;
  onSelect?: (value: string) => void;
  isSinglePost?: boolean;
}

const heightForContext: Record<SwiperContext, string> = {
  comment: '275px',
  post: '450px',
  shareMoviePost: '190px',
  shareBookPost: '190px',
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
  ${isNativePlatform ? 'display: none' : 'color: var(--bs-primary)'}
}
.swiper-button-next {
  ${isNativePlatform ? 'display: none' : 'color: var(--bs-primary)'}
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

const MoviePosterWithAdditionDetails = styled.div`
  display: flex;
  flex-direction: row;

  .text__details {
    margin: auto;
    padding-inline-start: 24px;
    text-align: left;
  }
  img {
    height: 170px !important;
  }
`;

let instanceCounter = 0;

function CustomSwiper({
  context, images, initialSlide, onSelect, isSinglePost,
}: Props) {
  const uniqueId = `${instanceCounter += 1}`;
  const [showVideoPlayerModal, setShowYouTubeModal] = useState(false);
  const [isValidURL, setValidURL] = useState<any>();
  const { placeholderUrlNoImageAvailable } = useAppSelector((state) => state.remoteConstants);
  const navigate = useNavigate();

  const handleImageError = (e: any) => {
    e.target.src = placeholderUrlNoImageAvailable;
  };
  const renderImage = (imageAndVideo: any) => (
    <SwiperContentContainer style={{ height: heightForContext[context] }}>
      <img
        src={`https://img.youtube.com/vi/${imageAndVideo.videoKey}/hqdefault.jpg`}
        className="w-100 h-100"
        alt={`${imageAndVideo.imageDescription ? imageAndVideo.imageDescription : 'user uploaded content videoKey'}`}
        onError={handleImageError}
      />
      <StyledYouTubeButton
        variant="link"
        onClick={(e: any) => {
          e.preventDefault();
          setShowYouTubeModal(true);
        }}
      >
        <FontAwesomeIcon icon={brands('youtube')} size="4x" />
      </StyledYouTubeButton>
    </SwiperContentContainer>
  );
  const renderPlaceholderImage = (imageAndVideo: any) => (
    <SwiperContentContainer style={{ height: heightForContext[context] }}>
      <img
        src={placeholderUrlNoImageAvailable}
        className="w-100 h-100"
        alt={`${imageAndVideo.imageDescription ? imageAndVideo.imageDescription : 'user uploaded content videoKey'}`}
        onError={handleImageError}
      />
    </SwiperContentContainer>
  );
  const displayVideoAndImage = (imageAndVideo: SliderImage) => {
    if (imageAndVideo.videoKey) {
      youtube(imageAndVideo.videoKey).then((res) => {
        if (res.status === 200) {
          setValidURL(true);
        } else {
          setValidURL(false);
        }
      }).catch(() => {
        setValidURL(false);
      });
      if (isValidURL === true) {
        return (
          renderImage(imageAndVideo)
        );
      }
      if (
        isValidURL === false && ((isSinglePost === false && images.length > 1) || (isSinglePost))
      ) {
        return (
          renderPlaceholderImage(imageAndVideo)
        );
      }
      if (isValidURL === undefined) {
        return <LoadingIndicator />;
      }
      return null;
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
          <SwiperContentContainer style={{ height: heightForContext[context] }}>
            <img
              src={imageAndVideo.imageUrl}
              className="w-100 h-100"
              alt={`${imageAndVideo.imageDescription ? imageAndVideo.imageDescription : 'user uploaded content imageUrl'} `}
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = placeholderUrlNoImageAvailable;
              }}
            />
          </SwiperContentContainer>
        </Link>
      );
    }
    if (imageAndVideo.posterData) {
      let detailPagPath: string;
      if (imageAndVideo?.posterData?.type === 'book') {
        detailPagPath = `/app/books/${imageAndVideo?.posterData?._id}/details`;
      } else if (imageAndVideo?.posterData?.type === 'movie') {
        detailPagPath = `/app/movies/${imageAndVideo?.posterData?._id}/details`;
      } else if (imageAndVideo?.posterData?.type === 'bookReview') {
        detailPagPath = `/app/books/${imageAndVideo?.posterData?._id}/reviews/${imageAndVideo?.posterData?.postId}`;
      } else if (imageAndVideo?.posterData?.type === 'movieReview') {
        detailPagPath = `/app/movies/${imageAndVideo?.posterData?._id}/reviews/${imageAndVideo?.posterData?.postId}`;
      } else {
        return null;
      }
      const onViewButtonClick = () => {
        navigate(detailPagPath);
        onSelect!(imageAndVideo.postId as string);
      };
      return (
        <SwiperContentContainer className="me-auto">
          <MoviePosterWithAdditionDetails>
            <div className="py-3">
              <StyledMoviePoster className="h-100">
                <Link to={detailPagPath}>
                  <Image
                    src={imageAndVideo?.posterData?.poster_path}
                    alt="poster"
                    className="d-block rounded-3"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      e.currentTarget.src = placeholderUrlNoImageAvailable;
                    }}
                  />
                </Link>
              </StyledMoviePoster>
            </div>
            <div className="text__details">
              <Link to={detailPagPath} className="d-block text-decoration-none fw-bold mb-1 text-start">
                {imageAndVideo?.posterData?.title}
              </Link>
              <Link to={detailPagPath} className="d-block text-decoration-none text-light mb-2 text-start">
                {imageAndVideo?.posterData?.release_date
                  && DateTime.fromJSDate(new Date(imageAndVideo?.posterData?.release_date)).toFormat('yyyy')}
              </Link>
              <RoundButton className="btn btn-form bg-black rounded-5 d-flex px-4" onClick={() => onViewButtonClick()}>
                {(imageAndVideo?.posterData?.type === 'bookReview' || imageAndVideo?.posterData?.type === 'movieReview') ? 'View review' : 'View details'}
              </RoundButton>

            </div>
          </MoviePosterWithAdditionDetails>
        </SwiperContentContainer>
      );
    }
    return (
      <SwiperContentContainer style={{ height: heightForContext[context] }}>
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
    <div className={`${images.length > 1 ? 'mb-4' : ''}`}>
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
  isSinglePost: false,
};
export default CustomSwiper;
