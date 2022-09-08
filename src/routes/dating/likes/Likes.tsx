import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DatingPageWrapper from '../components/DatingPageWrapper';
import DatingLikesDialog from './DatingLikeDialog';
import { LikesList, MatchesList } from './LikesData';
import UnsubscriberLikes from './unsubscriber-likes/UnsubscriberLikes';
import SubscriberLikes from './subscriber-likes/SubscriberLikes';

function Likes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('user');
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const handleLikesOption = (likeValue: string) => {
    if (likeValue === 'Message') {
      navigate('/dating/conversation');
    } else if (likeValue === 'View profile') {
      navigate('/dating/likes?user=subscriber');
    } else {
      setShow(true);
    }
    setDropDownValue(likeValue);
  };

  return (
    <DatingPageWrapper>
      <div className="mt-5 pt-5 mt-lg-0 pt-lg-0">
        {queryParam === 'subscriber' ? (
          <SubscriberLikes
            handleLikesOption={handleLikesOption}
            MatchesList={MatchesList}
            LikesList={LikesList}
          />
        ) : (
          <UnsubscriberLikes
            MatchesList={MatchesList}
            LikesList={LikesList}
            handleLikesOption={handleLikesOption}
          />
        )}
        <DatingLikesDialog show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
      </div>
    </DatingPageWrapper>
  );
}

export default Likes;
