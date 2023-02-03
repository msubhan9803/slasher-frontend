import React from 'react';
import { Col, Row } from 'react-bootstrap';
import EventHeader from '../EventHeader';
import EventsPosterCard from '../EventsPosterCard';
import EventPoster from '../../../images/events-poster.png';
import PubWiseAd from '../../../components/ui/PubWiseAd';
import checkAdsFavorites from './checkAdsFavorites';
import useBootstrapBreakpointName from '../../../hooks/useBootstrapBreakpoint';
import { EVENTS_FAVOURITES_DIV_ID } from '../../../utils/pubwise-ad-units';
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
  {
    id: 5, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 6, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 7, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 8, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 9, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 10, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 11, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 12, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 13, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
];

function Favorites() {
  const bp = useBootstrapBreakpointName();
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <EventHeader tabKey="favorites" />
        <div className="mt-3 bg-dark bg-mobile-transparent p-lg-4 rounded">
          <Row className="justify-content-md-center">
            {eventsList.map((eventDetail, i, arr) => {
              const show = checkAdsFavorites(bp, i, arr);
              return (
                <React.Fragment key={eventDetail.id}>
                  <Col md={6}>
                    <EventsPosterCard listDetail={eventDetail} />
                  </Col>
                  {show && <PubWiseAd className="text-center my-3" id={EVENTS_FAVOURITES_DIV_ID} autoSequencer />}
                </React.Fragment>
              );
            })}
          </Row>
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <EventRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default Favorites;
