import React from 'react';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PlacePosterCardList from '../components/PlacePosterCardList';
import { myPlaces } from '../PlaceData';
import PlaceHeader from '../PlaceHeader';

function PlaceMyplaces() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="place">
      <PlaceHeader tabKey="my-places" />
      <div className="px-md-4 pt-0">
        <PlacePosterCardList dataList={myPlaces} />
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default PlaceMyplaces;
