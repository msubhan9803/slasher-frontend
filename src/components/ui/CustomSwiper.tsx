import React from 'react';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import 'swiper/swiper-bundle.css';
import { Link } from 'react-router-dom';

interface SliderImage {
  imageUrl: string;
  linkUrl?: string;
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

.swiper-slide img {
  display: block;
  height: 100%;
  object-fit: cover;
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
`;
function CustomSwiper({ images, initialSlide }: Props) {
  return (
    <StyledSwiper
      pagination={{ type: 'fraction' }}
      initialSlide={initialSlide}
      modules={[Pagination]}
    >
      {
        images.map((image: SliderImage) => (
          <SwiperSlide key={image.imageUrl}>
            {image.linkUrl
              ? (
                <Link to={image.linkUrl}>
                  <PostImage>
                    <img src={image.imageUrl} className="w-100" alt="user uploaded content" />
                  </PostImage>
                </Link>
              )
              : (
                <PostImage>
                  <img src={image.imageUrl} className="w-100" alt="user uploaded content" />
                </PostImage>
              )}
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
