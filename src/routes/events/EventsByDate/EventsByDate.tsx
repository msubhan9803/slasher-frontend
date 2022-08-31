import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import Calendar, { CalendarTileProperties } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import moment from 'moment';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import EventHeader from '../EventHeader';
import EventsPosterCard from '../EventsPosterCard';
import EventPoster from '../../../images/events-poster.png';

const EventCalender = styled(Calendar)`
  .react-calendar__tile--now {
    background: transparent !important;
  }

  .react-calendar__tile {
    color: var(--bs-white) !important;
  }

  .react-calendar__navigation button {
    color: var(--bs-white) !important;
  }

  .highlight {
    color: var(--bs-primary) !important;
  }

  button:enabled:hover {
    background-color: var(--bs-black) !important;
  }

  .react-calendar__tile--active {
    background-color: transparent !important;
  }

  .react-calendar__tile--active abbr {
    color: var(--bs-white) !important;
    background: var(--bs-black) !important;
    padding: 7px 10px !important;
    border-radius: 50% !important;
    border: 1px solid #3A3B46 !important;
  }

  .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none !important;
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: var(--bs-black) !important;
  }

  .react-calendar__navigation button:disabled {
    background-color: var(--bs-black) !important;
    pointer-events: none !important;
  }

  .react-calendar__decade-view__decades__decade {
    pointer-events: none !important;
  }

  .react-calendar__navigation {
    display: flex !important;
    justify-content: center !important;
  }

  .react-calendar__navigation__label {
    flex-grow: 0 !important;
  }
  .react-calendar__tile--hasActive{
    background: var(-bs--black) !important;
  }

`;
const eventsList = [
  {
    id: 1, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
  {
    id: 2, image: `${EventPoster}`, date: '07/05/2022', location: '1 Main St, New York, NY USA', eventName: 'Escape from a House of Horror - A Diane Sawyer Special Event',
  },
];
const mark = [
  '11-08-2022',
  '13-08-2022',
  '23-08-2022',
];
function EventsByDate() {
  const [value, onChange] = useState(new Date());
  return (
    <AuthenticatedPageWrapper rightSidebarType="event">
      <EventHeader tabKey="by-date" />
      <div className="mt-3 bg-dark bg-mobile-transparent p-4 rounded">
        <EventCalender
          className="w-100 p-4 bg-dark border-0 text-white"
          onChange={onChange}
          value={value}
          minDetail="decade"
          tileClassName={({ date }: CalendarTileProperties) => {
            if (mark.find((x: any) => x === moment(date).format('DD-MM-YYYY'))) {
              return 'highlight';
            }
            return null;
          }}
        />
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
    </AuthenticatedPageWrapper>
  );
}

export default EventsByDate;
