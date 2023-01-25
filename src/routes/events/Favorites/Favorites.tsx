import React from 'react';
import { Col, Row } from 'react-bootstrap';
import EventHeader from '../EventHeader';
import EventsPosterCard from '../EventsPosterCard';
import EventPoster from '../../../images/events-poster.png';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import EventRightSidebar from '../EventRightSidebar';

const eventsList = [
  {
    id: 1, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 2, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 3, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 4, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
];
function Favorites() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <EventHeader tabKey="favorites" />
        <div className="mt-3 bg-dark bg-mobile-transparent p-lg-4 rounded">
          <Row className="justify-content-md-center">
            {eventsList.map((eventDetail) => (
              <Col md={6} key={eventDetail.id}>
                <EventsPosterCard
                  listDetail={eventDetail}
                />
              </Col>
            ))}
          </Row>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="pb-3 d-none d-lg-block">
        <EventRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default Favorites;
