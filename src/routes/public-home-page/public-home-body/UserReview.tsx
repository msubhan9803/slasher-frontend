/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Col, Container } from 'react-bootstrap';
import styled from 'styled-components';
import { StyledCast } from '../../movies/movie-details/MovieCasts';
import useResize from '../../../hooks/useResize';

const StyledSlider = styled.div`
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

const getElementWidth = () => (document as any)?.querySelector('#slideCasts').childNodes[0].offsetWidth;

export const ratingIcons: string[] = Array.from({ length: 5 }, (_, i) => `star-${i}`);

function UserReview() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollValue = useRef<number | null>(null);
  const scrollValuesRefSetter = useCallback(() => {
    scrollValue.current = getElementWidth();
  }, []);

  useResize(scrollValuesRefSetter);

  const slideCastsRight = () => {
    if (!scrollValue.current) { return; }
    const slider = sliderRef.current;
    if (slider !== null) {
      const { scrollLeft, clientWidth, scrollWidth } = slider;
      if (scrollLeft + clientWidth >= scrollWidth) {
        slider.scrollLeft = 0;
      } else {
        slider.scrollLeft += scrollValue.current;
      }
    }
  };

  useEffect(() => {
    scrollValue.current = getElementWidth();
    if (!scrollValue.current) { return () => { }; }

    let interval: any;
    const slider: HTMLElement | null = sliderRef.current;

    const startAutoSlide = () => {
      interval = setInterval(() => {
        slideCastsRight();
      }, 5000);
    };

    const stopAutoSlide = () => {
      clearInterval(interval);
    };

    if (slider !== null) {
      slider.scroll({
        left: slider.scrollLeft + scrollValue.current,
        behavior: 'smooth',
      });
      slider.addEventListener('mouseenter', stopAutoSlide);
      slider.addEventListener('mouseleave', startAutoSlide);

      let isDragging = false;
      let startX: number;
      let scrollLeft: number;

      slider.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - slider!.offsetLeft;
        scrollLeft = slider!.scrollLeft;
      });

      slider.addEventListener('mousemove', (e) => {
        if (!isDragging) { return; }
        e.preventDefault();
        const x = e.pageX - slider!.offsetLeft;
        const walk = (x - startX) * 2;
        slider!.scrollLeft = scrollLeft - walk;
      });

      slider.addEventListener('mouseup', () => {
        isDragging = false;
      });

      slider.addEventListener('mouseleave', () => {
        isDragging = false;
      });

      startAutoSlide();
    }

    const newSlider = sliderRef?.current;
    return () => {
      if (newSlider !== null) {
        slider?.removeEventListener('mouseenter', stopAutoSlide);
        slider?.removeEventListener('mouseleave', startAutoSlide);
        slider?.removeEventListener('mousedown', () => { });
        slider?.removeEventListener('mousemove', () => { });
        slider?.removeEventListener('mouseup', () => { });
        slider?.removeEventListener('mouseleave', () => { });
      }
      clearInterval(interval);
    };
  }, []);

  if (cardData?.length === 0) {
    return null;
  }
  return (
    <StyledSlider className="mt-5 pt-4">
      <Container>

        <div className="mb-4 text-center">
          <h1 className="h1 fw-bold">
            WHAT PEOPLE ARE
            <br />
            SAYING ABOUT SLASHER
          </h1>
        </div>

        <div className="d-flex align-items-center overflow-hidden py-5">
          <StyledCast id="slideCasts" className="flex-nowrap w-100" ref={sliderRef}>
            {cardData && cardData.map((card) => (
              <Col key={card.id} md={6} lg={3}>
                <Card className="bg-black border-0 rounded-3 p-4">
                  <Card.Body className="px-0 pb-0">
                    <div className="d-flex mb-3 testimonial-item position-relative">
                      {ratingIcons.map((star) => (
                        <div key={star}>
                          <FontAwesomeIcon icon={solid('star')} className="rate" />
                        </div>
                      ))}
                    </div>
                    <Card.Title className="fs-4 review">
                      {card.review}
                    </Card.Title>
                    <Card.Text className="fs-3 fw-bold">
                      {card.user}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </StyledCast>
        </div>
      </Container>
    </StyledSlider>
  );
}

export default UserReview;
