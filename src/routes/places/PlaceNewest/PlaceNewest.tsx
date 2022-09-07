import React from 'react';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PlacePosterCardList from '../components/PlacePosterCard/PlacePosterCardList';
import { newest } from '../PlaceData';
import PlaceHeader from '../PlaceHeader';

function PlaceNewest() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="place">
      <PlaceHeader tabKey="newest" />
      <div className="p-4 pt-0">
        <PlacePosterCardList dataList={newest} />
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default PlaceNewest;
