import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Card, Col, Row } from 'react-bootstrap';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import placeholderUser from '../../placeholder-images/placeholder-user.jpg';

function NewsIndex() {
  const newsAndReviews = [
    {
      logo: placeholderUser,
      name: 'Horror Oasis',
      description: 'It is a long established fact that a reader will be by the readable content of a page when looking at its layout.',
    },
    {
      logo: placeholderUser,
      name: 'Horror Fix',
      description: 'It is a long established fact that a reader will be by the readable content of a page when looking at its layout.',
    },
    {
      logo: placeholderUser,
      name: 'Gruesome Magazine',
      description: 'It is a long established fact that a reader will be by the readable content of a page when looking at its layout.',
    },
    {
      logo: placeholderUser,
      name: 'Horror Channel',
      description: 'It is a long established fact that a reader will be by the readable content of a page when looking at its layout. ',
    },
    {
      logo: placeholderUser,
      name: 'POV Horror',
      description: 'It is a long established fact that a reader will be by the readable content of a page when looking at its layout. ',
    },
    {
      logo: placeholderUser,
      name: 'Horror Freaknews',
      description: 'It is a long established fact that a reader will be by the readable content of a page when looking at its layout.',
    },
  ];

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <Row>
        <Col xs={1} className="d-md-none">
          <FontAwesomeIcon icon={solid('arrow-left')} size="2x" />
        </Col>
        <Col xs={11} md={12} className="text-center text-md-start">
          <h1 className="h3 mb-3">News &amp; Reviews</h1>
        </Col>
      </Row>
      <Row className="bg-dark rounded-3 py-4 m-0 mb-5">
        {newsAndReviews.map((news) => (
          <Col xs={6} lg={4} className="pt-2">
            <Card className="bg-transparent border-0 px-4">
              <Card.Img src={news.logo} className="rounded-4" />
              <Card.Body className="px-0">
                <Card.Title>{news.name}</Card.Title>
                <Card.Text className="small text-light">{news.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </AuthenticatedPageWrapper>
  );
}

export default NewsIndex;
