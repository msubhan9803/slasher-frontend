import React from 'react';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PlacePosterCardList from '../components/PlacePosterCardList';
import { favorites } from '../PlaceData';
import PlaceHeader from '../PlaceHeader';
import PlaceRightSidebar from '../PlaceRightSidebar';

function PlaceFavorites() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <PlaceHeader tabKey="favorites" />
        <div className="p-4 pt-0">
          <PlacePosterCardList dataList={favorites} />
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="pb-3 d-none d-lg-block">
        <PlaceRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default PlaceFavorites;
