import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PlacePosterCardList from '../components/PlacePosterCardList';
import category from '../PlaceData';
import PlaceHeader from '../PlaceHeader';

function PlaceCategory() {
  const [showKeys, setShowKeys] = useState(false);
  const navigate = useNavigate();
  const changeTab = (tab: string) => {
    navigate(`/places/${tab}`);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="place">
      <PlaceHeader tabKey="categories" changeTab={changeTab} showKeys={showKeys} setShowKeys={setShowKeys} />
      <div className="p-4 pt-0">
        <PlacePosterCardList dataList={category} />
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default PlaceCategory;
