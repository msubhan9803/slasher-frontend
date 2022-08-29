import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PlacePosterCardList from '../components/PlacePosterCardList';
import { category } from '../PlaceData';
import PlaceHeader from '../PlaceHeader';

function PlaceCategory() {
  const navigate = useNavigate();
  const changeTab = (tab: string) => {
    navigate(`/places/${tab}`);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="place">
      <PlaceHeader tabKey="by-category" changeTab={changeTab} />
      <div className="px-0 px-md-4 p-4 pt-0 mt-3 mt-lg-0">
        <PlacePosterCardList dataList={category} />
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default PlaceCategory;
