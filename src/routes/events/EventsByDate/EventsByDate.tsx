/* eslint-disable max-lines */
import React, { useEffect, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import Calendar, { CalendarTileProperties, DrillCallbackProperties, ViewCallbackProperties } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { DateTime } from 'luxon';
import InfiniteScroll from 'react-infinite-scroller';
import EventHeader from '../EventHeader';
import EventsPosterCard from '../EventsPosterCard';
import { getEvents, getEventsDateCount } from '../../../api/eventByDate';
import checkAdsEventByDate from './checkAdsEventByDate';
import useBootstrapBreakpointName from '../../../hooks/useBootstrapBreakpoint';
import PubWiseAd from '../../../components/ui/PubWiseAd';
import { EVENTS_BY_DATE_DIV_ID } from '../../../utils/pubwise-ad-units';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import EventRightSidebar from '../EventRightSidebar';

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

function EventsByDate() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewChange, onViewChange] = useState<Date | null>(null);
  const [eventsList, setEventList] = useState<any[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [markDateList, setMarkDateList] = useState<string[]>([]);
  const selectedDateString = DateTime.fromJSDate(selectedDate).toFormat('yyyy-MM-dd');
  const startDate = `${selectedDateString}T00:00:00Z`;
  const endDate = `${selectedDateString}T23:59:59Z`;
  const eventContainerElementRef = useRef<any>(null);
  const [yPositionOfLastEventElement, setYPositionOfLastEventElement] = useState<number>(0);
  const bp = useBootstrapBreakpointName();

  const getDateRange = (dateValue: Date) => {
    const startDateRange = DateTime.fromJSDate(dateValue).startOf('month').minus({ days: 7 }).toFormat('yyyy-MM-dd');
    const endDateRange = DateTime.fromJSDate(dateValue).endOf('month').plus({ days: 6 }).toFormat('yyyy-MM-dd');
    return [startDateRange, endDateRange];
  };

  const eventsFromResponse = (res: any) => res.data.map((event: any) => {
    const formattedStartDate = DateTime.fromISO(event.startDate).toUTC().toLocaleString();
    const formattedEndDate = DateTime.fromISO(event.endDate).toUTC().toLocaleString();
    const formattedDate = formattedStartDate === formattedEndDate ? formattedStartDate : `${formattedStartDate} - ${formattedEndDate}`;
    return {
      ...event,
      /* eslint no-underscore-dangle: 0 */
      id: event._id,
      image: event.images[0],
      date: formattedDate,
      location: event.address,
      eventName: event.name,
    };
  });

  useEffect(() => {
    let monthRange = [];
    if (!viewChange) {
      monthRange = getDateRange(selectedDate);
    } else {
      monthRange = getDateRange(viewChange);
    }
    getEventsDateCount(monthRange[0], monthRange[1]).then((res) => {
      const countedDateList = res.data.filter((dateCount: any) => dateCount.count > 0);
      const formatDateList = countedDateList.map((dateCount: any) => DateTime.fromISO(dateCount.date).toUTC().toFormat('yyyy-MM-dd'));
      setMarkDateList(formatDateList);
    });
  }, [viewChange]);

  useEffect(() => {
    setNoMoreData(false); // reset when day changes
    getEvents(startDate, endDate).then((res) => {
      setEventList(eventsFromResponse(res));
      if (res.data.length === 0) {
        setNoMoreData(true);
      }
    }).catch(() => { });
  }, [startDate]);

  const fetchMoreEvent = () => {
    if (eventsList && eventsList.length > 0) {
      getEvents(startDate, endDate, eventsList[eventsList.length - 1]._id)
        .then((res) => {
          setEventList((prev: any) => [
            ...prev,
            ...eventsFromResponse(res),
          ]);
          if (res.data.length === 0) {
            setNoMoreData(true);
          }
        })
        .catch(() => { });
    }
  };

  const onActiveStartDateChange = (data: ViewCallbackProperties) => {
    if (data.view === 'month') {
      onViewChange(data.activeStartDate);
    }
  };

  const onDrillDownChange = (data: DrillCallbackProperties) => {
    if (data.activeStartDate.getMonth() === 0) {
      onViewChange(data.activeStartDate);
    }
  };

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        eventsList.length === 0
          ? 'No events on the selected date.'
          : 'No more events'
      }
    </p>
  );
  const getYPosition = () => {
    const yPosition = eventContainerElementRef.current?.lastElementChild?.offsetTop;
    setYPositionOfLastEventElement(yPosition);
  };
  useEffect(() => {
    getYPosition();
  }, [eventsList]);

  useEffect(() => {
    if (yPositionOfLastEventElement) {
      const bottomLine = window.scrollY + window.innerHeight > yPositionOfLastEventElement;
      if (bottomLine) {
        fetchMoreEvent();
      }
    }
  }, [yPositionOfLastEventElement]);
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <EventHeader tabKey="by-date" />
        <div className="mt-md-3 bg-dark bg-mobile-transparent p-4 rounded">
          <EventCalender
            className="w-100 p-4 pb-0 bg-dark border-0 text-white"
            onClickDay={setSelectedDate}
            onActiveStartDateChange={onActiveStartDateChange}
            onDrillDown={onDrillDownChange}
            value={selectedDate}
            minDetail="year"
            prev2Label={null}
            next2Label={null}
            tileClassName={({ date }: CalendarTileProperties) => {
              if (markDateList.find((x: any) => x === DateTime.fromJSDate(date).toFormat('yyyy-MM-dd'))) {
                return 'highlight';
              }
              return null;
            }}
          />
          <InfiniteScroll
            pageStart={0}
            initialLoad={false}
            loadMore={fetchMoreEvent}
            hasMore={!noMoreData}
            element="span"
          >
            <Row ref={eventContainerElementRef}>
              {eventsList && eventsList.length > 0
              && (eventsList.map((eventDetail, i, arr) => {
                // (*temporary*) DEBUGGING TIP: Use `Array(15).fill(eventsList[0]).map(..)`
                // inplace of `eventsList.map(..)`  to mimic sample data from a single data item.
                const show = checkAdsEventByDate(bp, i, arr);
                return (
                  <React.Fragment key={eventDetail.id}>
                    <Col md={6}>
                      <EventsPosterCard listDetail={eventDetail} />
                    </Col>
                    {show && <PubWiseAd className="text-center my-3" id={EVENTS_BY_DATE_DIV_ID} autoSequencer />}
                  </React.Fragment>
                );
              }))}
            </Row>
          </InfiniteScroll>
          {noMoreData && renderNoMoreDataMessage()}
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <EventRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default EventsByDate;
