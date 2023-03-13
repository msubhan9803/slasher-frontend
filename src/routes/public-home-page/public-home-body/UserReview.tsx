import React, { useEffect, useRef } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Container } from 'react-bootstrap';
import styled from 'styled-components';
import Swiper from 'swiper';

const StyledSlider = styled.div`
  .testimonial-wrap {
    padding-left: 50px;
  }
  .testimonial-item {
    box-sizing: content-box;
    box-shadow: 0px 0px 20px 0px rgba(11, 35, 65, 0.1);
    
  }
  .rate {
    color: var(--bs-orange);
  }
`;
const cardData = [
  {
    id: 1, user: 'Darknessofmystery', rating: 5, review: 'I’ve joined up early on and saw the initial vision of the creator Damon. He is very active on the app looking to help people network and genuinely connect with one another over the bonding from horror and it’s sub genres. The Slasher app provides agency to those that feel uneasy or can be seen as distanced from other social media experiences due to the subculture of the horror community. I have found a new home along with more fulfilled connections than I have made over the months growing with Slasher and the community!',
  },
  {
    id: 3, user: 'Jennifer Jeffries', rating: 5, review: 'Absolutely love this app. Full of like minded, cool, nonjudgemental people, a must for horror fans! The developers have been very available for any issues or questions, and continue to make new amazing features available.',
  },
  {
    id: 2, user: 'A Google user', rating: 5, review: 'Love this app! Its really great for EVERYTHING horror.... And I do mean everything!...the developer is really involved, and has a suggestion section where he actually personally responds to all suggestions and questions. There is a section for literally everything...Movies, books, blogs, podcasts, videos, home decor, haunts, and for extra horror there is even a "Dating" section.... If you dare! ',
  },
  {
    id: 4, user: 'TypeOfan', rating: 5, review: 'This app is amazing. Where the hell has this been all my life?!! Good job with the app. Keep up the great work all! Update: This app continues to thrive and become what anyone would want from an app. Its definitely recommended if you dont want to deal with nonsense and want to be part of an online community that is respectful of others. Its awesome to see so many horror fans and music fans gathering in one place. ',
  },
];

function UserReview() {
  const testimonialsSliderRef = useRef<any>(null);

  useEffect(() => {
    const testimonialsSlider = new Swiper(testimonialsSliderRef?.current, {
      speed: 600,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      slidesPerView: 'auto',
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        980: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        1200: {
          slidesPerView: 4,
          spaceBetween: 20,
        },
        1440: {
          slidesPerView: 5,
          spaceBetween: 20,
        },
      },
    });

    return () => {
      testimonialsSlider.destroy();
    };
  }, []);

  return (
    <StyledSlider className="my-5 p-5">
      <Container>

        <div className="text-center">
          <h1 className="h1 fw-bold">
            WHAT PEOPLE ARE
            <br />
            SAYING ABOUT SLASHER
          </h1>
        </div>

        <div className="overflow-hidden swiper py-5" ref={testimonialsSliderRef}>
          <div className="swiper-wrapper">

            {
              cardData.map((card) => (
                <div key={card.id} className="bg-black border-0 rounded-3 p-4 swiper-slide">
                  <div className="px-0 pb-0testimonial-wrap">
                    <div className="d-flex mb-3 testimonial-item position-relative">
                      {[...Array(5)].map((star) => (
                        <div key={star}>
                          <FontAwesomeIcon icon={solid('star')} className="rate" />
                        </div>
                      ))}
                    </div>
                    <p className="fs-4 review">
                      {card.review}
                    </p>
                    <p className="fs-3 fw-bold">
                      {card.user}
                    </p>
                  </div>
                </div>
              ))
            }

          </div>
        </div>

      </Container>
    </StyledSlider>
  );
}

export default UserReview;
