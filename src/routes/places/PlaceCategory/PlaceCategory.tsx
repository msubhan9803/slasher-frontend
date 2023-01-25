import React from 'react';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PlacePosterCardList from '../components/PlacePosterCardList';
import { category } from '../PlaceData';
import PlaceHeader from '../PlaceHeader';
import PlaceRightSidebar from '../PlaceRightSidebar';

function PlaceCategory() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <PlaceHeader tabKey="by-category" />
        <div className="px-0 px-md-4 p-4 pt-0 mt-3 mt-lg-0">
          <PlacePosterCardList dataList={category} />
        </div>
      </ContentPageWrapper>
      <RightSidebarWrapper className="pb-3 d-none d-lg-block">
        <PlaceRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default PlaceCategory;
