import React, { useState, useEffect } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';

const StyledCast = styled(Row)` 
  white-space: nowrap;
  &::-webkit-scrollbar {
    display: none;
  }
  .rate {
    color: var(--bs-orange);
  }
  .review {
    white-space: normal;
  }
`;

function AutoplayCarousel() {
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

  const [slideIndex, setSlideIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((index) => (index === cardData.length - 1 ? 0 : index + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [cardData.length]);

  if (!cardData || cardData.length === 0) {
    return null;
  }

  return (
    <div className="d-flex align-items-center">
      <StyledCast
        id="slideCasts"
        className="flex-nowrap w-100"
        style={{ transform: `translateX(-${slideIndex * 300}px)` }}
      >
        {cardData.map((card) => (
          <Col key={card.id} xs={6} sm={3}>
            <Card className="bg-black border-0 rounded-3 p-4">
              <Card.Body className="px-0 pb-0">
                <div className="d-flex mb-3">
                  {[...Array(5)].map((star, index) => (
                    <div key={star}>
                      {index <= card.rating ? (
                        <FontAwesomeIcon icon={solid('star')} className="rate" />
                      ) : (
                        <FontAwesomeIcon icon={regular('star')} className="text-white" />
                      )}
                    </div>
                  ))}
                </div>
                <Card.Text className="fs-4 review">
                  {card.review}
                </Card.Text>
                <Card.Text className="fs-3 fw-bold">
                  {card.user}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </StyledCast>
    </div>
  );
}

export default AutoplayCarousel;
