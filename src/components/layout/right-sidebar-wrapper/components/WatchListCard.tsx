import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Col, Row } from 'react-bootstrap';
import styled from 'styled-components';

const MovieCardStyle = styled.div`
  .fa-star {
    color: #FF8A00;
  }
`;
const RatingDiv = styled.div`
  margin-top : -1.43rem;
`;
const CardImage = styled(Card.Img)`
  height : 6.5rem;
  width: 5.37rem;
`;

function WatchListCard() {
  const watchListImage = ['https://i.pravatar.cc/300?img=56', 'https://i.pravatar.cc/300?img=57', 'https://i.pravatar.cc/300?img=58'];
  return (
    <div className="p-3 bg-dark rounded-3">
      <Row>
        {watchListImage.map((image) => (
          <Col md={4} key={image}>
            <Card className="bg-transparent my-2 border-0">
              <CardImage variant="top" src={image} className="rounded-3" />
              <RatingDiv className="d-flex justify-content-end">
                <MovieCardStyle className="bg-white text-black rounded-5 px-1 small">
                  <FontAwesomeIcon icon={solid('star')} className="me-1 my-auto" size="xs" />
                  <span>3.0</span>
                </MovieCardStyle>
              </RatingDiv>
              <Card.Body className="px-1">
                <Card.Text className="d-flex justify-content-between align-items-center mb-1 small text-light">
                  2022
                  <FontAwesomeIcon icon={regular('thumbs-up')} className="text-success rounded-circle border p-1" size="xs" />
                </Card.Text>
                <Card.Text className="small">
                  Dreamcatcher: Get ready for a killer night out
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default WatchListCard;
