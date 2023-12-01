import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RoundButton from '../../components/ui/RoundButton';
import podcastDataList from './components/PodcastsListData';
import PodcastsPoster from './components/PodcastsPoster';
import PodcastsSidebar from './components/PodcastsSidebar';
import SticyBannerAdSpaceCompensation from '../../components/SticyBannerAdSpaceCompensation';

function PodcastsList() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <div className="bg-dark bg-mobile-transparent rounded-3 px-lg-4">
          <Link to="/podcasts" className="d-lg-none">
            <RoundButton className="w-100">Add my podcast</RoundButton>
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
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <PodcastsSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default PodcastsList;
