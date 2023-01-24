import React from 'react';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PlacePosterCardList from '../components/PlacePosterCardList';
import { myPlaces } from '../PlaceData';
import PlaceHeader from '../PlaceHeader';
import PlaceRightSidebar from '../PlaceRightSidebar';

function PlaceMyplaces() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper className="container">
        <PlaceHeader tabKey="my-places" />
        <div className="px-md-4 pt-0">
          <PlacePosterCardList dataList={myPlaces} />
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <PlaceRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default PlaceMyplaces;
