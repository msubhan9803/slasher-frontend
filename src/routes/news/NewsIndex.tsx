import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Card, Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import placeholderUser from '../../placeholder-images/placeholder-user.jpg';

const TrucatedDescription = styled.small`
  display: -webkit-box;
  max-width: 12.5rem;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
function NewsIndex() {
  const newsAndReviews = [
    {
      id: 1,
      logo: placeholderUser,
      name: 'Horror Oasis',
      description: 'It is a long established fact that a reader will be by the readable content of a page when looking at a page when looking at',
    },
    {
      id: 2,
      logo: placeholderUser,
      name: 'Horror Fix',
      description: 'Explore Stormmie\'s board "Horror Fix" ideas about horror, horror movies, scary movies ,  about horror',
    },
    {
      id: 3,
      logo: placeholderUser,
      name: 'Gruesome Magazine',
      description: 'Gruesome Magazine is launching a quarterly magazine available in both print and digital magazine available',
    },
    {
      id: 4,
      logo: placeholderUser,
      name: 'HorrorNews',
      description: 'Latest Horror News, Reviews, Movie Releases, Trailers, Articles and More! ',
    },
    {
      id: 5,
      logo: placeholderUser,
      name: 'Horror Oasis',
      description: 'It is a long established fact that a reader will be by the readable content of a page when looking at a page when looking at',
    },
    {
      id: 6,
      logo: placeholderUser,
      name: 'Horror Fix',
      description: 'Explore Stormmie\'s board "Horror Fix" ideas about horror, horror movies, scary movies....',
    },
    {
      id: 7,
      logo: placeholderUser,
      name: 'Gruesome Magazine',
      description: 'Gruesome Magazine is launching a quarterly magazine available in both print and digital magazine available',
    },
    {
      id: 8,
      logo: placeholderUser,
      name: 'HorrorNews',
      description: 'Latest Horror News, Reviews, Movie Releases, Trailers, Articles and More! ',
    },

  ];

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <div className="px-2 bg-mobile-transparent d-flex align-items-center d-lg-none bg-dark">
        <FontAwesomeIcon role="button" icon={solid('arrow-left')} size="lg" />
        <h1 className="h2 text-center mb-0 mx-auto">News &#38; Reviews </h1>
      </div>
      <Row className="bg-dark bg-mobile-transparent rounded-3 pt-4 pb-3 px-lg-3 px-0 m-0 mb-5">
        {newsAndReviews.map((news) => (
          <Col key={news.id} xs={6} sm={4} md={3} lg={4} xl={3} className="pt-2">
            <Card className="bg-transparent border-0">
              <Card.Img src={news.logo} className="rounded-4" style={{ aspectRatio: '1' }} />
              <Card.Body className="px-0">
                <p className="fs-3 mb-1 fw-bold">{news.name}</p>
                <TrucatedDescription className="text-light fs-4">{news.description}</TrucatedDescription>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </AuthenticatedPageWrapper>
  );
}

export default NewsIndex;
