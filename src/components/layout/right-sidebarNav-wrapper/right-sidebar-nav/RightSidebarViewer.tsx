import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import styled from 'styled-components';

const AdvertisementBox = styled.div`
  height: 15.625rem;
`;
const MovieCardStyle = styled(Card)`
  img {
    width:80px;
    height: 104px;
  }

  .card-img-overlay {
    top: 125px;

    .rating {
      height: 25px;
      line-height: 2
    }
  }
  .fa-star {
    color: #FF8A00;
  }
  .fa-thumbs-down {
    transform: rotateY(180deg);
  }
`;

function RightSidebarViewer() {
  return (
    <>
      <Row className="d-none d-md-flex">
        <h1 className="h4 my-3 ps-0">Advertisment</h1>
        <AdvertisementBox className=" bg-dark " />
      </Row>

      <Row className="mt-3">
        <Col xs={9}>
          <h2 className="h4">Watched list</h2>
        </Col>
        <Col xs={3} className="text-end">
          <small className="text-primary">See All</small>
        </Col>
      </Row>

      <Row className=" p-3 bg-dark rounded-3">
        <Col md={4}>
          <MovieCardStyle className="bg-transparent my-2">
            <Card.Img variant="top" src="https://i.pravatar.cc/300?img=56" className="rounded-3" />
            <Card.ImgOverlay className="d-flex justify-content-end">
              <Card.Title className="rating bg-white mb-0 px-2 rounded-5 small text-black">
                <FontAwesomeIcon icon={solid('star')} className="me-1" size="sm" />
                3.0
              </Card.Title>
            </Card.ImgOverlay>
            <Card.Body className="px-0">
              <Card.Text className="d-flex justify-content-between align-items-center mb-1 small text-light">
                2022

                <FontAwesomeIcon icon={regular('thumbs-up')} className="text-success rounded-circle border p-1" size="sm" />

              </Card.Text>
              <Card.Text>
                Dreamcatcher: Get ready for a killer night out
              </Card.Text>
            </Card.Body>
          </MovieCardStyle>
        </Col>
        <Col md={4}>
          <MovieCardStyle className="bg-transparent my-2">
            <Card.Img variant="top" src="https://i.pravatar.cc/300?img=56" className="rounded-3" />
            <Card.ImgOverlay className="d-flex justify-content-end">
              <Card.Title className="rating bg-white mb-0 px-2 rounded-5 small text-black">
                <FontAwesomeIcon icon={solid('star')} className="me-1" size="sm" />
                3.0
              </Card.Title>
            </Card.ImgOverlay>
            <Card.Body className="px-0">
              <Card.Text className="d-flex justify-content-between align-items-center mb-1 small text-light">
                2022

                <FontAwesomeIcon icon={regular('thumbs-up')} className="text-success rounded-circle border p-1" size="sm" />

              </Card.Text>
              <Card.Text>
                Dreamcatcher: Get ready for a killer night out
              </Card.Text>
            </Card.Body>
          </MovieCardStyle>
        </Col>
        <Col md={4}>
          <MovieCardStyle className="bg-transparent my-2">
            <Card.Img variant="top" src="https://i.pravatar.cc/300?img=56" className="rounded-3" />
            <Card.ImgOverlay className="d-flex justify-content-end">
              <Card.Title className="rating bg-white mb-0 px-2 rounded-5 small text-black">
                <FontAwesomeIcon icon={solid('star')} className="me-1" size="sm" />
                3.0
              </Card.Title>
            </Card.ImgOverlay>
            <Card.Body className="px-0">
              <Card.Text className="d-flex justify-content-between align-items-center mb-1 small text-light">
                2022

                <FontAwesomeIcon icon={regular('thumbs-up')} className="text-success rounded-circle border p-1" size="sm" />

              </Card.Text>
              <Card.Text>
                Dreamcatcher: Get ready for a killer night out
              </Card.Text>
            </Card.Body>
          </MovieCardStyle>
        </Col>
      </Row>
    </>
  );
}

export default RightSidebarViewer;
