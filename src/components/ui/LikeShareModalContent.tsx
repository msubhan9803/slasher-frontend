import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { Link } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import UserCircleImage from './UserCircleImage';
import { FriendRequestReaction, LikeShareModalResourceName } from '../../types';
import { getLikeUsersForPost } from '../../api/feed-posts';
import FriendActionButtons from './Friend/FriendActionButtons';
import { friendship } from '../../api/friends';
import { getLikeUsersForComment, getLikeUsersForReply } from '../../api/feed-likes';

type LikeUsersType = {
  _id: string,
  userName: string,
  profilePic: string,
  firstName: string,
  friendship?: {
    reaction: FriendRequestReaction,
    from: string,
    to: string,
  } | null,
};

type FriendType = { from: string, to: string, reaction: FriendRequestReaction } | null;

function FriendAction({ postLike }: { postLike: LikeUsersType }) {
  const [friendshipStatus, setFriendshipStatus] = useState<any>();
  const [friendStatus, setFriendStatus] = useState<FriendRequestReaction | null>(
    postLike.friendship
      ? postLike.friendship.reaction
      : FriendRequestReaction.DeclinedOrCancelled,
  );
  const [friendData, setFriendData] = useState<FriendType>(
    postLike.friendship ?? ({ reaction: FriendRequestReaction.DeclinedOrCancelled } as any),
  );

  useEffect(() => {
    friendship(postLike._id).then((res) => {
      setFriendData(res.data);
      setFriendStatus(res.data.reaction);
    });
  }, [friendshipStatus, postLike._id]);

  return (
    <FriendActionButtons
      friendStatus={friendStatus}
      user={({ _id: postLike._id } as any)}
      friendData={friendData}
      setFriendshipStatus={setFriendshipStatus}
      showOnlyAddAndSend
    />
  );
}

type LikeUsersProp = { likeUsers: LikeUsersType[] };
function LikeUsers({ likeUsers }: LikeUsersProp) {
  return (
    <div>
      {likeUsers?.map((postLike: LikeUsersType) => (
        <div className="pb-4 pt-0 py-3 d-flex align-items-center" key={postLike._id}>
          <div>
            <UserCircleImage src={postLike.profilePic} />
          </div>
          <div className="px-3 flex-grow-1 min-width-0">
            <Link className="text-decoration-none" to={`/${postLike.userName}/posts`}>
              <p className="mb-0">
                {postLike.userName}
              </p>
            </Link>
          </div>
          <FriendAction postLike={postLike} />
        </div>
      ))}
    </div>
  );
}

type Props = { resourceId: string, modaResourceName: LikeShareModalResourceName | null };
function LikeShareModalContent({ modaResourceName, resourceId }: Props) {
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [likeUsers, setLikeUsers] = useState<LikeUsersType[]>([]);
  const [page, setPage] = useState<number>(0);
  const parentRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line max-len
  const getLikeUsersApi = useMemo<(id: string, pageNumber: number) => Promise<AxiosResponse<any, any>>>(() => {
    if (!modaResourceName) { return () => { }; }
    const fns: Record<LikeShareModalResourceName, any> = {
      comment: getLikeUsersForComment,
      feedpost: getLikeUsersForPost,
      reply: getLikeUsersForReply,
    };
    return fns[modaResourceName];
  }, [modaResourceName]);
  const getLikeUsers = useCallback((postLikesPage: number) => {
    if (!modaResourceName) {
      return;
    }

    // Call one of the methods of `fns`
    getLikeUsersApi(resourceId, postLikesPage)
      .then((res: any) => {
        setLikeUsers(res.data);
        setPage(postLikesPage + 1);
        if (res.data.length === 0) {
          setNoMoreData(true);
        }
      })
      .catch((error: any) => setErrorMessage(error.response.data.message));
  }, [resourceId, getLikeUsersApi, modaResourceName]);

  useEffect(() => {
    getLikeUsers(0);
  }, [getLikeUsers]);

  const fetchMoreLikeUsers = () => {
    if (page > 0) {
      if (modaResourceName === 'feedpost') {
        getLikeUsersApi(resourceId, page)
          .then((res: any) => {
            setLikeUsers((prev: any) => [...prev, ...res.data]);
            setPage(page + 1);
            if (res.data.length === 0) {
              setNoMoreData(true);
            }
          })
          .catch((error: any) => setErrorMessage(error.response.data.message));
      }
    }
  };

  return (
    <>
      {errorMessage && errorMessage.length > 0 && (
        <div className="mt-3 text-start">
          {errorMessage}
        </div>
      )}
      <div
        ref={parentRef}
        style={{
          height: 700,
          overflow: 'auto',
        }}
      >
        <InfiniteScroll
          threshold={250}
          pageStart={0}
          initialLoad
          loadMore={fetchMoreLikeUsers}
          hasMore={!noMoreData}
          /* Using a custom parentNode element to base the scroll calulations on. */
          useWindow={false}
          getScrollParent={() => parentRef.current}
        >
          <LikeUsers likeUsers={likeUsers} />
        </InfiniteScroll>
      </div>
    </>

  );
}

export default LikeShareModalContent;
