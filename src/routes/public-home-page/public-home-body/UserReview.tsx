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
    id: 1,
    user: 'JahRose',
    rating: 5,
    review: 'One pet peeve that I have with certain social media fan pages is that there isn’t much complexity the types of posts. That is not the case with this app. There are so many people with many different interests from pure fans, to those that aspire to or work within this beloved industry. While there are aspects about the app that need to be updated, the potential is already here and I plan to stay with this app for long haul. I’m very glad I found this app, and I think you will too.',
    title: 'A Horror Fan’s Home away from Home',
  },
  {
    id: 3,
    user: 'Renee Dodd',
    rating: 5,
    review: 'Yes, this app does have some lags or glitches when it gets really busy, but that’s only because it has had a huge influx of users that the app is working very hard to keep up with. The new users are there because the app is amazing and the people are amazing and it is attracting more and more friendly horror people. Be patient! It won’t be slow forever!',
    title: 'Amazing app, have patience',
  },
  {
    id: 2, user: 'A Google user', rating: 5, review: "Love this app! It's really great for EVERYTHING horror.... And I do mean everything!...the developer is really involved, and has a suggestion section where he actually personally responds to all suggestions and questions. There is a section for literally everything...Movies, books, blogs, podcasts, videos, home decor, haunts, and for extra horror there is even a 'Dating' section.... If you dare! 😉 Download it or forever have nightmares of being stuck on FB.. & Tinder!",
  },
  {
    id: 4,
    user: 'ChrisWritesReviews',
    rating: 5,
    review: 'I’ve been using this since day one and absolutely love it. Great work on what you’re doing, the only issue I have is the movies and podcasts sections, I can go into those sections but can’t click on any of the movies or podcasts in the lists. It just lets me scroll the list. Not sure if anyone else has had this issue but I just wanted to bring it to your attention. Thanks for making such a great app.',
    title: 'Love the app, but...',
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
                    {card.title
                      && (
                      <Card.Title className="fs-4 fw-bold mb-3">
                        {card.title}
                      </Card.Title>
                      )}
                    <Card.Text className="fs-4 review">
                      {card.review}
                    </Card.Text>
                    <div className="d-flex mt-3 mb-1 testimonial-item position-relative">
                      {ratingIcons.map((star) => (
                        <div key={star}>
                          <FontAwesomeIcon icon={solid('star')} className="rate" />
                        </div>
                      ))}
                    </div>
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
