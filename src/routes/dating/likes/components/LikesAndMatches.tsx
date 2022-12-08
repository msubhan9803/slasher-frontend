import React from 'react';
import ItemRow from '../ItemRow';

interface SubscriberLikesProps {
  MatchesList: LikesListProps[];
  LikesList: LikesListProps[];
  handleLikesOption: (value: string) => void;
  isMatchesTab: boolean;
  isLikesTab: boolean;
  queryParam: string | null;
}
interface LikesListProps {
  id: number;
  imageUrl: string;
  name: string;
  email: string;
  time: string;
}

const matchesOptions = ['View profile', 'Message', 'Block user', 'Report'];
const likesOptions = ['View profile', 'Block user', 'Report'];

function LikesAndMatches({
  MatchesList,
  LikesList,
  handleLikesOption,
  isMatchesTab,
  isLikesTab,
  queryParam,
}: SubscriberLikesProps) {
  const isSubscriber = queryParam === 'subscriber';

  return (
    <>
      {isMatchesTab && (
      <div className="bg-dark bg-mobile-transparent p-lg-4 pt-lg-1 pb-lg-3 rounded-3">
        <h1 className="h2 fw-semibold mt-4 mb-3">Matches</h1>
          {MatchesList.slice(0, 4).map((matchDetail: LikesListProps) => {
            const item = {
              name: 'You’ve got a new match', time: matchDetail.time, id: matchDetail.id, imageUrl: '', email: '',
            };
            return (
              <ItemRow
                key={matchDetail.id}
                item={isSubscriber ? matchDetail : item}
                handleLikesOption={handleLikesOption}
                popoverOptions={isSubscriber ? matchesOptions : []}
                handlePopover={handleLikesOption}
              />

            );
          })}
      </div>
      )}
      { isLikesTab && (
      <div className="bg-dark bg-mobile-transparent p-lg-4 pt-lg-1 pb-lg-3 rounded-3">
        <h1 className="h2 fw-semibold mt-4 mb-3">Likes</h1>
          {LikesList.slice(0, 4).map((likesDetail: any) => {
            const item = {
              name: 'You’ve got a new like', time: '12 hours ago', id: likesDetail.id, imageUrl: '', email: '',
            };
            return (
              <ItemRow
                key={likesDetail.id}
                item={isSubscriber ? likesDetail : item}
                handleLikesOption={handleLikesOption}
                popoverOptions={isSubscriber ? likesOptions : []}
                handlePopover={handleLikesOption}
              />
            );
          })}
      </div>
      )}
    </>
  );
}

export default LikesAndMatches;
