import React from 'react';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PlacePosterCardList from '../components/PlacePosterCardList';
import { favorites } from '../PlaceData';
import PlaceHeader from '../PlaceHeader';

function PlaceFavorites() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="place">
      <PlaceHeader tabKey="favorites" />
      <div className="p-4 pt-0">
        <PlacePosterCardList dataList={favorites} />
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default PlaceFavorites;
