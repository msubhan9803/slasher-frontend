import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Col, Row } from 'react-bootstrap';
import styled from 'styled-components';

function WatchListCard() {
  const watchListImage = ['https://i.pravatar.cc/300?img=56', 'https://i.pravatar.cc/300?img=57', 'https://i.pravatar.cc/300?img=58'];
  const MovieCardStyle = styled(Card)`
  img {
    width:80px;
    height: 104px;
  }

  .card-img-overlay {
    top: 67px;
    right: -10px;

    .rating {
      height: 18px;
      font-size: 11px
    }
  }
  .fa-star {
    color: #FF8A00;
  }
  .fa-thumbs-down {
    transform: rotateY(180deg);
  }
`;
  return (
    <Row className=" p-3 bg-dark rounded-3">
      {watchListImage.map((image) => (
        <Col md={4} className="px-1">
          <MovieCardStyle className="bg-transparent my-2 position-relative">
            <Card.Img variant="top" src={image} className="rounded-3 w-100" />
            <Card.ImgOverlay className="d-flex justify-content-end">
              <Card.Title className="d-flex align-items-center rating bg-white mb-0 px-1 rounded-5 small text-black">
                <FontAwesomeIcon icon={solid('star')} className="me-1 my-auto" size="xs" />
                3.0
              </Card.Title>
            </Card.ImgOverlay>
            <Card.Body className="px-1">
              <Card.Text className="d-flex justify-content-between align-items-center mb-1 small text-light">
                2022
                <FontAwesomeIcon icon={regular('thumbs-up')} className="text-success rounded-circle border p-1" size="xs" />
              </Card.Text>
              <Card.Text>
                Dreamcatcher: Get ready for a killer night out
              </Card.Text>
            </Card.Body>
          </MovieCardStyle>
        </Col>
      ))}
    </Row>
  );
}

export default WatchListCard;
