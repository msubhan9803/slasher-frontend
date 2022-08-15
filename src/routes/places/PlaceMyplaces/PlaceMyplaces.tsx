import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PlacePosterCardList from '../components/PlacePosterCardList';
import MyPlaces from '../PlaceData';
import PlaceHeader from '../PlaceHeader';

function PlaceMyplaces() {
  const navigate = useNavigate();
  const changeTab = (tab: string) => {
    navigate(`/places/${tab}`);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="place">
      <PlaceHeader tabKey="my-places" changeTab={changeTab} />
      <div className="px-md-4 pt-0">
        <PlacePosterCardList dataList={MyPlaces} />
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default PlaceMyplaces;
