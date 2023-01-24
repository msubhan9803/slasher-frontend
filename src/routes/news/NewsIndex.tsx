import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Card, Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { rssFeedInitialData } from '../../api/rss-feed-providers';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';

const TrucatedDescription = styled.small`
  display: -webkit-box;
  max-width: 12.5rem;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;
function NewsIndex() {
  const [newsAndReviews, setNewsAndReviews] = useState([]);

  useEffect(() => {
    rssFeedInitialData().then((res) => {
      setNewsAndReviews(res.data);
    });
  }, []);

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper className="container">
        <div className="px-2 bg-mobile-transparent d-flex align-items-center d-lg-none bg-dark">
          <FontAwesomeIcon role="button" icon={solid('arrow-left')} size="lg" />
          <h1 className="h2 text-center mb-0 mx-auto">News &#38; Reviews </h1>
        </div>
        <Row className="bg-dark bg-mobile-transparent rounded-3 pt-4 pb-3 px-lg-3 px-0 m-0 mb-5">
          {newsAndReviews.map((news: any) => (
            /* eslint no-underscore-dangle: 0 */
            <Col key={news._id} xs={6} sm={4} md={3} lg={4} xl={3} className="pt-2">
              <Link to={`/news/partner/${news._id}`} className="text-decoration-none">
                <Card className="bg-transparent border-0">
                  <Card.Img src={news.logo} className="rounded-4" style={{ aspectRatio: '1' }} />
                  <Card.Body className="px-0">
                    <p className="fs-3 mb-1 fw-bold">{news.title}</p>
                    <TrucatedDescription className="text-light fs-4">{news.description}</TrucatedDescription>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default NewsIndex;
