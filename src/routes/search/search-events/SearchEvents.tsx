import React, { useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
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
  const searchData = useCallback(() => {
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
  }, [search]);
  useEffect(() => {
    searchData();
  }, [search, searchData]);
  return (
    <div>
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
    </div>
  );
}

export default SearchEvents;
