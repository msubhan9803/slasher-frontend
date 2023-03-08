import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroller';
import { Link } from 'react-router-dom';
import UserCircleImage from './UserCircleImage';
import { FriendRequestReaction } from '../../types';
import { getLikeUsersForPost } from '../../api/feed-posts';
import FriendActionButtons from './Friend/FriendActionButtons';
import { friendship } from '../../api/friends';

// TODO-SAHIL: Remove after Damon's check!
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SmallText = styled.p`
    font-size: .75rem;
  `;

type PostLike = {
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

function FriendAction({ postLike }: { postLike: PostLike }) {
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

type PostLikesProp = { postLikesList: PostLike[] };
function PostLikes({ postLikesList } : PostLikesProp) {
  return (
    <div>
      {postLikesList?.map((postLike: PostLike) => (
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

            {/* TODO-SAHIL: Remove after Damon's check! */}
            {/* <SmallText className="text-light mb-0">{postLike.userName}</SmallText> */}
          </div>
          <FriendAction postLike={postLike} />
        </div>
      ))}
    </div>
  );
}

type Props = { feedPostId: string };
function LikeShareModalContent({ feedPostId }: Props) {
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [postLikes, setPostLikes] = useState<PostLike[]>([]);
  const [page, setPage] = useState<number>(0);
  const parentRef = useRef<HTMLInputElement>(null);

  const getPostLikesList = useCallback((postLikesPage: number) => {
    getLikeUsersForPost(feedPostId, postLikesPage)
      .then((res) => {
        setPostLikes(res.data);
        setPage(postLikesPage + 1);
        if (res.data.length === 0) {
          setNoMoreData(true);
        }
      })
      .catch((error) => setErrorMessage(error.response.data.message));
  }, [feedPostId]);

  useEffect(() => {
    getPostLikesList(0);
  }, [getPostLikesList]);

  const fetchMorePostLikesList = () => {
    if (page > 0) {
      getLikeUsersForPost(feedPostId, page)
        .then((res) => {
          setPostLikes((prev: any) => [...prev, ...res.data]);
          setPage(page + 1);
          if (res.data.length === 0) {
            setNoMoreData(true);
          }
        })
        .catch((error) => setErrorMessage(error.response.data.message));
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
          loadMore={fetchMorePostLikesList}
          hasMore={!noMoreData}
          /* Using a custom parentNode element to base the scroll calulations on. */
          useWindow={false}
          getScrollParent={() => parentRef.current}
        >
          <PostLikes postLikesList={postLikes} />
        </InfiniteScroll>
      </div>
    </>

  );
}

export default LikeShareModalContent;
