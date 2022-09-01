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
    width:3.571rem !important;
    height:3.571rem !important; 
  }
  .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none;
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: transparent;
  }

  .react-calendar__navigation button:disabled {
    background-color: transparent;
    pointer-events: none;
  }

  .react-calendar__decade-view__decades__decade {
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
    background: var(-bs--black);
  }
  .react-calendar__navigation__prev-button{
    background : var(--bs-white);
    color:var(--bs-black) !important;
    border-radius:50%;
    font-size: x-large;
    width: 2.143rem !important;
    min-width: 2.143rem !important;
  }
  .react-calendar__navigation__next-button{
    background : var(--bs-white);
    color:var(--bs-black) !important;
    border-radius:50%;
    font-size: x-large;    
    width: 2.143rem !important;
    min-width: 2.143rem !important;
  }
  .react-calendar__navigation__label{
    margin-left: 1.429rem;
    margin-right: 1.429rem;
  }
  .react-calendar__navigation{
    height : 2.143rem;
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
  '11-09-2022',
  '13-09-2022',
  '23-09-2022',
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
