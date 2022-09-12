import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../components/ui/RoundButton';
import podcastDataList from './components/PodcastsListData';
import PodcastsPoster from './components/PodcastsPoster';

function PodcastsList() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="podcast">
      <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4">
        <Link to="/podcasts" className="d-lg-none">
          <RoundButton className="w-100 fs-3 fw-bold">Add my podcast</RoundButton>
        </Link>
        <Row className="mt-0">
          {podcastDataList.map((listDetail) => (
            <Col xs={6} sm={4} md={3} lg={4} xl={3} key={listDetail.id}>
              <PodcastsPoster
                poster={listDetail.image}
                name={listDetail.name}
                description={listDetail.description}
              />
            </Col>
          ))}
        </Row>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default PodcastsList;
