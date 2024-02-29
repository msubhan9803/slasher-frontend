import React from 'react';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PlacePosterCardList from '../components/PlacePosterCard/PlacePosterCardList';
import { newest } from '../PlaceData';
import PlaceHeader from '../PlaceHeader';
import PlaceRightSidebar from '../PlaceRightSidebar';
import SticyBannerAdSpaceCompensation from '../../../components/SticyBannerAdSpaceCompensation';

function PlaceNewest() {
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <PlaceHeader tabKey="newest" />
        <div className="p-4 pt-0">
          <PlacePosterCardList dataList={newest} />
        </div>
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <PlaceRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default PlaceNewest;
