import React from 'react';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import 'swiper/swiper-bundle.css';
import { Link } from 'react-router-dom';

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
}
const StyledSwiper = styled(Swiper)`
  width: 100%;
  height: 100%;
  z-index: 0 !important;

.swiper-slide {
  text-align: center;
  font-size: 1.125rem;
  background: #fff;

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
.swiper-pagination-bullet {
  border:0.063rem solid !important;
}
.swiper-pagination-bullet-active{
  background: white !important;
}
`;
const PostImage = styled.div`
  aspect-ratio : 1.9;
  img {
    object-fit: contain;
  }
`;
function CustomSwiper({ images, initialSlide }: Props) {
  const displayVideoAndImage = (imageAndVideo: SliderImage) => {
    if (imageAndVideo.videoKey) {
      return (
        <iframe
          width="100%"
          height="425"
          src={`https://www.youtube.com/embed/${imageAndVideo.videoKey}`}
          title="YouTube video player"
          className="border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    if (imageAndVideo.linkUrl) {
      return (
        <Link to={imageAndVideo.linkUrl}>
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

  return (
    <StyledSwiper
      pagination={{ type: 'fraction' }}
      initialSlide={initialSlide}
      modules={[Pagination]}
    >
      {
        images.map((image: SliderImage) => (
          <SwiperSlide key={`${image.imageId}${image.postId}`}>
            {displayVideoAndImage(image)}
          </SwiperSlide>
        ))
      }
    </StyledSwiper>
  );
}
CustomSwiper.defaultProps = {
  initialSlide: 0,
};
export default CustomSwiper;
