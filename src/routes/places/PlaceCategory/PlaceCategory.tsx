import React from 'react';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PlacePosterCardList from '../components/PlacePosterCardList';
import { category } from '../PlaceData';
import PlaceHeader from '../PlaceHeader';

function PlaceCategory() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="place">
      <PlaceHeader tabKey="by-category" />
      <div className="px-0 px-md-4 p-4 pt-0 mt-3 mt-lg-0">
        <PlacePosterCardList dataList={category} />
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default PlaceCategory;
