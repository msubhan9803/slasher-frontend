import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ContentSidbarWrapper, ContentPageWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import EventDetails from './EventDetails/EventDetails';
import EventRightSidebar from './EventRightSidebar';
import EventsByDate from './EventsByDate/EventsByDate';
import EventsByLocation from './EventsByLocation/EventsByLocation';
import Favorites from './Favorites/Favorites';
import EventsSuggestion from './suggestion/EventsSuggestion';
import SticyBannerAdSpaceCompensation from '../../components/SticyBannerAdSpaceCompensation';

function Events() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <Routes>
          <Route path="/" element={<Navigate to="by-date" replace />} />
          <Route path="/suggestion" element={<EventsSuggestion />} />
          <Route path="/by-location" element={<EventsByLocation />} />
          <Route path="/by-date" element={<EventsByDate />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/:id" element={<EventDetails />} />
        </Routes>
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>

      {/* Global right sidebar for all above routes */}
      <RightSidebarWrapper>
        <EventRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}
export default Events;
