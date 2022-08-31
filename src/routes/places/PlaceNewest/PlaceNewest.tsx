import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PlacePosterCardList from '../components/PlacePosterCard/PlacePosterCardList';
import { newest } from '../PlaceData';
import PlaceHeader from '../PlaceHeader';

function PlaceNewest() {
  const navigate = useNavigate();
  const changeTab = (tab: string) => {
    navigate(`/places/${tab}`);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="place">
      <PlaceHeader tabKey="newest" changeTab={changeTab} />
      <div className="p-4 pt-0">
        <PlacePosterCardList dataList={newest} />
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default PlaceNewest;
