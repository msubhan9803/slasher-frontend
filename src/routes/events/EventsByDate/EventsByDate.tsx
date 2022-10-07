/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import Calendar, { CalendarTileProperties } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment';
import { DateTime } from 'luxon';
import InfiniteScroll from 'react-infinite-scroller';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import EventHeader from '../EventHeader';
import EventsPosterCard from '../EventsPosterCard';
import { getEvents, getMoreEvents } from '../../../api/eventByDate';

const EventCalender = styled(Calendar)`
  .react-calendar__tile--now {
    background: transparent;
  }

  .react-calendar__tile {
    color: var(--bs-white);
  }

  .react-calendar__navigation button {
    color: var(--bs-white);
  }

  .highlight {
    color: var(--bs-primary);
    &::after {
      content: "\\A•";
      white-space: pre;
      position: absolute;
      left: 48%;
    }
  }

  .react-calendar__tile:enabled:hover{
    background-color: transparent  !important;
  }

  .react-calendar__tile--active {
    background-color: transparent  !important;
  }

  .react-calendar__tile--active abbr {
    width:2.5rem;
    height:2.5rem;
    border-radius:50%;
    background-color:var(--bs-black);
    color:var(--bs-white);
    display:inline-flex;
    justify-content: center;
    align-items:center;
    border: 0.071rem solid #3A3B46;
  }
  .react-calendar__tile{
    width:4rem !important;
    height:4rem !important; 
    position: relative;
  }
  .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none;
  }

  .react-calendar__navigation button:enabled:hover
 {
    background-color: black;
    color:white !important;
  }
 
  .react-calendar__navigation button:enabled:focus {
    background-color: white;
    color:black !important;
  }

  .react-calendar__navigation button:disabled {
    background-color: transparent;
    pointer-events: none;
  }

  .react-calendar__navigation {
    display: flex;
    justify-content: center;
  }

  .react-calendar__navigation__label {
    flex-grow: 0 !important;
  }
  .react-calendar__tile--hasActive{
    background-color: var(-bs--black) !important;
  }
  .react-calendar__navigation__prev-button,.react-calendar__navigation__next-button{
    background : var(--bs-white);
    color:var(--bs-black) !important;
    border-radius:50%;
    font-size: x-large;
    width: 2.143rem !important;
    min-width: 2.143rem !important;
    padding-bottom: 0.214rem;
  }
  .react-calendar__navigation__label{
    margin-left: 1.429rem;
    margin-right: 1.429rem;
  }
 
  .react-calendar__navigation{
    height : 2.143rem;
  }
  .react-calendar__tile--active::after {
    visibility: hidden;
}
`;
const mark = [
  '04-09-2022',
  '13-09-2022',
  '23-09-2022',
];
function EventsByDate() {
  const [value, onChange] = useState(new Date());
  const [eventsList, setEventList] = useState<any[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const selectedDateString = DateTime.fromJSDate(value).toFormat('yyyy-MM-dd');
  const startDate = `${selectedDateString}T00:00:00Z`;
  const endDate = `${selectedDateString}T23:59:59Z`;
  useEffect(() => {
    getEvents(startDate, endDate).then((res) => {
      const eventsData = res.data.map((event: any) => (
        {
          ...event,
          /* eslint no-underscore-dangle: 0 */
          id: event._id,
          image: event.images[0],
          date: DateTime.fromISO(event.startDate).toFormat('dd/MM/yyyy'),
          location: event.address,
          eventName: event.name,
        }
      ));
      setEventList(eventsData);
    }).catch(() => {});
  }, [startDate]);

  const fetchMoreEvent = () => {
    if (eventsList && eventsList.length > 0) {
      getMoreEvents(startDate, endDate, eventsList[eventsList.length - 1]._id)
        .then((res) => {
          const eventsData = res.data.map((event: any) => (
            {
              ...event,
              /* eslint no-underscore-dangle: 0 */
              id: event._id,
              image: event.images[0],
              date: DateTime.fromISO(event.startDate).toFormat('dd/MM/yyyy'),
              location: event.address,
              eventName: event.name,
            }
          ));
          setEventList((prev: any) => [
            ...prev,
            ...eventsData,
          ]);
          if (res.data.length === 0) {
            setNoMoreData(true);
          }
        })
        .catch(() => { });
    }
  };

  return (
    <AuthenticatedPageWrapper rightSidebarType="event">
      <EventHeader tabKey="by-date" />
      <div className="mt-md-3 bg-dark bg-mobile-transparent p-4 rounded">
        <EventCalender
          className="w-100 p-4 pb-0 bg-dark border-0 text-white"
          onChange={onChange}
          value={value}
          minDetail="year"
          prev2Label={null}
          next2Label={null}
          tileClassName={({ date }: CalendarTileProperties) => {
            if (mark.find((x: any) => x === moment(date).format('DD-MM-YYYY'))) {
              return 'highlight';
            }
            return null;
          }}
        />
        <Row className="justify-content-md-center">
          <InfiniteScroll
            pageStart={0}
            initialLoad={false}
            loadMore={fetchMoreEvent}
            hasMore
          >
            {eventsList && eventsList.length > 0
              ? (eventsList.map((eventDetail) => (
                <Col md={6} key={eventDetail.id}>
                  <EventsPosterCard
                    listDetail={eventDetail}
                  />
                </Col>
              )))
              : <p className="text-center mt-3">No events available</p>}
          </InfiniteScroll>
          {noMoreData && eventsList.length > 1 && <p className="text-center">No more Events</p>}
        </Row>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default EventsByDate;
