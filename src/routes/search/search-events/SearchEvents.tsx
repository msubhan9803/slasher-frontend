import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import SearchHeader from '../SearchHeader';
import { events } from '../SearchResult';
import EventPosterCard from './EventPosterCard';

interface SearchEventsProps {
  id: number;
  name: string;
  image: string;
  date: string;
  address: string;
}
function SearchEvents() {
  const [search, setSearch] = useState<string>('');
  const [searchEvents, setSearchEvents] = useState<SearchEventsProps[]>(events);
  const searchData = () => {
    let searchResult;
    const newFilter = events;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: SearchEventsProps) => src.name.toLowerCase().includes(search))
        : [];
      setSearchEvents(searchResult);
    } else {
      setSearchEvents(events);
    }
  };
  useEffect(() => {
    searchData();
  }, [search]);
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper className="container">
        <SearchHeader
          tabKey="events"
          setSearch={setSearch}
          search={search}
        />
        <Row className="justify-content-center mt-2 mx-3 mx-sm-0">
          {searchEvents.map((eventDetails) => (
            <Col sm={6} key={eventDetails.id}>
              <EventPosterCard eventDetails={eventDetails} />
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

export default SearchEvents;
