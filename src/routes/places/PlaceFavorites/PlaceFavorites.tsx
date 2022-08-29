import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PlacePosterCardList from '../components/PlacePosterCardList';
import favorites from '../PlaceData';
import PlaceHeader from '../PlaceHeader';

function PlaceCategory() {
  const navigate = useNavigate();
  const changeTab = (tab: string) => {
    navigate(`/places/${tab}`);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="place">
      <PlaceHeader tabKey="favorites" changeTab={changeTab} />
      <div className="p-4 pt-0">
        <PlacePosterCardList dataList={favorites} />
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default PlaceCategory;
