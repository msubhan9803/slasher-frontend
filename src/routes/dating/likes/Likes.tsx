import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import DatingPageWrapper from '../components/DatingPageWrapper';
import DatingLikesDialog from './DatingLikeDialog';
import { LikesList, MatchesList } from './LikesData';
import LikesAndMatches from './components/LikesAndMatches';
import TabLinks from '../../../components/ui/Tabs/TabLinks';

const tabs = [
  { value: 'matches', label: 'Likes' },
  { value: 'likes/matches', label: 'Matches' },
];

function Likes() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('user');
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const location = useLocation();

  const isMatchesTab = location.pathname.includes('dating/likes/matches');
  const isLikesTab = !isMatchesTab;

  const selectedTab = isMatchesTab ? 'likes/matches' : 'matches';

  const handleLikesOption = (likeValue: string) => {
    if (likeValue === 'Message') {
      navigate('/app/dating/conversation');
    } else if (likeValue === 'View profile') {
      navigate('/app/dating/likes?user=subscriber');
    } else {
      setShow(true);
    }
    setDropDownValue(likeValue);
  };

  const tempToggleSubscriber = () => {
    if (queryParam) {
      setSearchParams({});
    } else {
      setSearchParams({ user: 'subscriber' });
    }
  };

  return (
    <DatingPageWrapper>
      <TabLinks tabsClass="start" tabsClassSmall="start" tabLink={tabs} toLink="/app/dating" params={`?${searchParams.toString()}`} selectedTab={selectedTab} />

      <div className="mt-3">
        <LikesAndMatches
          handleLikesOption={handleLikesOption}
          MatchesList={MatchesList}
          LikesList={LikesList}
          isMatchesTab={isMatchesTab}
          isLikesTab={isLikesTab}
          queryParam={queryParam}
        />
      </div>
      {/* Temporary only */}
      <Button className="mb-3 mt-5" onClick={tempToggleSubscriber}>ToggleSubscriberView</Button>

      <DatingLikesDialog show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />

    </DatingPageWrapper>
  );
}

export default Likes;
