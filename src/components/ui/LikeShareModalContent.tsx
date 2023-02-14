import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroller';
import RoundButton from './RoundButton';
import UserCircleImage from './UserCircleImage';
import { FriendRequestReaction } from '../../types';
import { getLikeUsersForPost } from '../../api/feed-posts';

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

type PostLikesProp = { postLikesList: PostLike[] };
function PostLikes({ postLikesList } : PostLikesProp) {
  return (
    <div>
      {postLikesList?.map((data: PostLike) => (
        <div className="pb-4 pt-0 py-3 d-flex align-items-center" key={data._id}>
          <div>
            <UserCircleImage src={data.profilePic} />
          </div>
          <div className="px-3 flex-grow-1 min-width-0">
            <p className="mb-0">
              {data.firstName}
            </p>
            <SmallText className="text-light mb-0">{data.userName}</SmallText>
          </div>
          {data.friendship
            ? (
              <RoundButton
                className="bg-black fw-bold text-white"
              >
                <p className="mb-0">Send message</p>
              </RoundButton>
            )
            : (
              <RoundButton
                className="fw-bold"
              >
                <p className="mb-0">Add friend</p>
              </RoundButton>
            )}
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
