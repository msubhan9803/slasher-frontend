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
      logo: placeholderUser,
      name: 'Horror Oasis',
      description: 'It is a long established fact that a reader will be by the readable content of a page when looking at a page when looking at',
    },
    {
      logo: placeholderUser,
      name: 'Horror Fix',
      description: 'Explore Stormmie\'s board "Horror Fix" ideas about horror, horror movies, scary movies ,  about horror',
    },
    {
      logo: placeholderUser,
      name: 'Gruesome Magazine',
      description: 'Gruesome Magazine is launching a quarterly magazine available in both print and digital magazine available',
    },
    {
      logo: placeholderUser,
      name: 'HorrorNews',
      description: 'Latest Horror News, Reviews, Movie Releases, Trailers, Articles and More! ',
    },
    {
      logo: placeholderUser,
      name: 'Horror Oasis',
      description: 'It is a long established fact that a reader will be by the readable content of a page when looking at a page when looking at',
    },
    {
      logo: placeholderUser,
      name: 'Horror Fix',
      description: 'Explore Stormmie\'s board "Horror Fix" ideas about horror, horror movies, scary movies....',
    },
    {
      logo: placeholderUser,
      name: 'Gruesome Magazine',
      description: 'Gruesome Magazine is launching a quarterly magazine available in both print and digital magazine available',
    },
    {
      logo: placeholderUser,
      name: 'HorrorNews',
      description: 'Latest Horror News, Reviews, Movie Releases, Trailers, Articles and More! ',
    },

  ];

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <Row className="d-md-none bg-dark pt-3">
        <Col xs="auto" className="ms-2 "><FontAwesomeIcon role="button" icon={solid('arrow-left-long')} size="2x" /></Col>
        <Col><h1 className="h4 text-center">News &#38; Reviews </h1></Col>
      </Row>
      <Row className="bg-dark rounded-3 px-4 pt-4 pb-5 m-0 mb-5">
        {newsAndReviews.map((news) => (
          <Col key={news.name} xs={6} md={3} className="pt-2">
            <Card className="bg-transparent border-0">
              <Card.Img src={news.logo} className="rounded-4" />
              <Card.Body className="px-0">
                <p className="mb-1 fw-bold">{news.name}</p>
                <TrucatedDescription className="text-light">{news.description}</TrucatedDescription>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </AuthenticatedPageWrapper>
  );
}

export default NewsIndex;
