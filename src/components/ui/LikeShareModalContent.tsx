import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { AxiosResponse } from 'axios';
import { Link } from 'react-router-dom';
import UserCircleImage from './UserCircleImage';
import { FriendRequestReaction, FriendType, LikeShareModalResourceName } from '../../types';
import { getLikeUsersForPost } from '../../api/feed-posts';
import FriendActionButtons from './Friend/FriendActionButtons';
import { friendship } from '../../api/friends';
import { getLikeUsersForComment, getLikeUsersForReply } from '../../api/feed-likes';
import { scrollToTop } from '../../utils/scrollFunctions';

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

function FriendAction({ likeUser }: { likeUser: LikeUsersType }) {
  const [friendshipStatus, setFriendshipStatus] = useState<any>();
  const [friendStatus, setFriendStatus] = useState<FriendRequestReaction | null>(
    likeUser.friendship
      ? likeUser.friendship.reaction
      : FriendRequestReaction.DeclinedOrCancelled,
  );
  const [friendData, setFriendData] = useState<FriendType>(
    likeUser.friendship ?? ({ reaction: FriendRequestReaction.DeclinedOrCancelled } as any),
  );

  useEffect(() => {
    friendship(likeUser._id).then((res) => {
      setFriendData(res.data);
      setFriendStatus(res.data.reaction);
    });
  }, [friendshipStatus, likeUser._id]);

  return (
    <FriendActionButtons
      friendStatus={friendStatus}
      user={({ _id: likeUser._id } as any)}
      friendData={friendData}
      setFriendshipStatus={setFriendshipStatus}
      showOnlyAddAndSend
    />
  );
}

type LikeUsersProp = {
  likeUsers: LikeUsersType[], onSelect?: () => void;
  setShow: (value: boolean) => void;

};
function LikeUsers({
  likeUsers, onSelect, setShow,
}: LikeUsersProp) {
  return (
    <div>
      {likeUsers?.map((likeUser: LikeUsersType) => (
        <div className="pb-4 pt-1 ps-1 py-3 d-flex align-items-center justify-content-between" key={likeUser._id}>
          <Link
            onClick={() => { onSelect?.(); setShow(false); setTimeout(() => scrollToTop('instant'), 500); }}
            to={`/${likeUser.userName}/posts`}
            className="text-decoration-none rounded"
          >
            <div className="d-flex align-items-center">
              <div>
                <UserCircleImage src={likeUser.profilePic} />
              </div>
              <div className="px-3 flex-grow-1 min-width-0">
                <p className="mb-0">
                  {likeUser.userName}
                </p>
              </div>
            </div>
          </Link>
          <FriendAction likeUser={likeUser} />
        </div>
      ))}
    </div>
  );
}
LikeUsers.defaultProps = { onSelect: undefined };

type Props = {
  resourceId: string, modaResourceName: LikeShareModalResourceName | null,
  setShow: (value: boolean) => void;
  onSelect?: () => void;
};
function LikeShareModalContent({
  modaResourceName, resourceId, setShow, onSelect,
}: Props) {
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [likeUsers, setLikeUsers] = useState<LikeUsersType[]>([]);
  const [page, setPage] = useState<number>(0);
  const parentRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line max-len
  const likeUsersApi = useMemo<(id: string, pageNumber: number) => Promise<AxiosResponse<any, any>>>(() => {
    if (!modaResourceName) { return () => { }; }
    const fns: Record<LikeShareModalResourceName, any> = {
      comment: getLikeUsersForComment,
      feedpost: getLikeUsersForPost,
      reply: getLikeUsersForReply,
    };
    return fns[modaResourceName];
  }, [modaResourceName]);
  const getLikeUsers = useCallback((pageNumber: number) => {
    if (!modaResourceName) {
      return;
    }

    // Call one of the methods of `fns`
    likeUsersApi(resourceId, pageNumber)
      .then((res: any) => {
        setLikeUsers(res.data);
        setPage(pageNumber + 1);
        if (res.data.length === 0) {
          setNoMoreData(true);
        }
      })
      .catch((error: any) => setErrorMessage(error.response.data.message));
  }, [resourceId, likeUsersApi, modaResourceName]);

  useEffect(() => {
    getLikeUsers(0);
  }, [getLikeUsers]);

  const fetchMoreLikeUsers = () => {
    if (page > 0) {
      if (modaResourceName === 'feedpost') {
        likeUsersApi(resourceId, page)
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
          threshold={1000}
          pageStart={0}
          initialLoad
          loadMore={fetchMoreLikeUsers}
          hasMore={!noMoreData}
          /* Using a custom parentNode element to base the scroll calulations on. */
          useWindow={false}
          getScrollParent={() => parentRef.current}
        >
          <LikeUsers
            likeUsers={likeUsers}
            onSelect={onSelect}
            setShow={setShow}
          />
        </InfiniteScroll>
      </div>
    </>

  );
}
LikeShareModalContent.defaultProps = {
  onSelect: undefined,
};
export default LikeShareModalContent;
