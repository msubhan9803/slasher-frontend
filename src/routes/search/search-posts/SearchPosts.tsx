/* eslint-disable max-lines */
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
import { Post } from '../../../types';
import SearchHeader from '../SearchHeader';
import { getHashtagPostList } from '../../../api/feed-posts';
import { unlikeFeedPost, likeFeedPost } from '../../../api/feed-likes';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setScrollPosition } from '../../../redux/slices/scrollPositionSlice';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { followHashtag, unfollowHashtag } from '../../../api/users';

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user', 'Hide'];

function SearchPosts() {
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [show, setShow] = useState(false);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [query, setQueryParam] = useState<any>(searchParams.get('hashtag') || '');
  const [dropDownValue, setDropDownValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const scrollPosition: any = useAppSelector((state: any) => state.scrollPosition);
  const [searchPosts, setSearchPosts] = useState<Post[]>(
    scrollPosition.pathname === location.pathname
      ? scrollPosition?.data : [],
  );
  const dispatch = useAppDispatch();
  const [followingHashtag, setFollowingHashtag] = useState<boolean>(false);
  const [notificationToggle, setNotificationToggle] = useState<boolean>(false);
  const userData = useAppSelector((state) => state.user);

  useEffect(() => {
    setQueryParam(searchParams.get('hashtag'));
  }, [searchParams]);

  useEffect(() => {
    setLoadingPosts(true);
    setSearchPosts([]);
  }, [query]);

  const getSearchPost = useCallback(() => {
    if (query) {
      setLoadingPosts(true);
      getHashtagPostList(
        query,
        searchPosts.length > 0 ? searchPosts[searchPosts.length - 1]._id : undefined,
      ).then((res) => {
        const newPosts: any = res.data.map((data: any) => {
          const setPost = {
            _id: data._id,
            id: data._id,
            postDate: data.createdAt,
            message: data.message,
            images: data.images,
            userName: data.userId.userName,
            profileImage: data.userId.profilePic,
            userId: data.userId._id,
            likeIcon: data.likedByUser,
            likeCount: data.likeCount,
            commentCount: data.commentCount,
          };
          return setPost;
        });
        setSearchPosts((prev: Post[]) => [...prev, ...newPosts]);
        if (res.data.length === 0) { setNoMoreData(true); }
        if (scrollPosition.pathname === location.pathname
          && searchPosts.length >= scrollPosition.data.length + 10) {
          const positionData = {
            pathname: '',
            position: 0,
            data: [],
            positionElementId: '',
          };
          dispatch(setScrollPosition(positionData));
        }
      }).catch(
        (error) => {
          setNoMoreData(true);
          setErrorMessage(error.response.data.message);
        },
      ).finally(
        () => { setRequestAdditionalPosts(false); setLoadingPosts(false); },
      );
    }
  }, [dispatch, location.pathname, query, searchPosts, scrollPosition.data.length,
    scrollPosition.pathname]);

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
      if (
        scrollPosition === null
        || scrollPosition?.position === 0
        || searchPosts.length >= scrollPosition?.data?.length
        || searchPosts.length === 0
        || scrollPosition.pathname !== location.pathname
      ) {
        getSearchPost();
      }
    }
  }, [query, getSearchPost, loadingPosts, location.pathname, requestAdditionalPosts,
    scrollPosition, searchPosts]);

  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };

  const onLikeClick = (feedPostId: string) => {
    const checkLike = searchPosts.some((post) => post.id === feedPostId
      && post.likeIcon);
    if (checkLike) {
      unlikeFeedPost(feedPostId).then((res) => {
        if (res.status === 200) {
          const unLikePostData = searchPosts.map(
            (unLikePost: Post) => {
              if (unLikePost._id === feedPostId) {
                return {
                  ...unLikePost,
                  likeIcon: false,
                  likedByUser: false,
                  likeCount: unLikePost.likeCount - 1,
                };
              }
              return unLikePost;
            },
          );
          setSearchPosts(unLikePostData);
        }
      });
    } else {
      likeFeedPost(feedPostId).then((res) => {
        if (res.status === 201) {
          const likePostData = searchPosts.map((likePost: Post) => {
            if (likePost._id === feedPostId) {
              return {
                ...likePost,
                likeIcon: true,
                likedByUser: true,
                likeCount: likePost.likeCount + 1,
              };
            }
            return likePost;
          });
          setSearchPosts(likePostData);
        }
      });
    }
  };

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        searchPosts.length === 0
          ? 'No posts available'
          : ''
      }
    </p>
  );

  const persistScrollPosition = (id: string) => {
    const positionData = {
      pathname: location.pathname,
      position: window.pageYOffset,
      data: searchPosts,
      positionElementId: id,
    };
    dispatch(setScrollPosition(positionData));
  };

  const followUnfollowClick = () => {
    if (!followingHashtag) {
      followHashtag(query, userData.user.id, 1).then((res) => {
        setFollowingHashtag(true);
        if (res.data.notification === 1) { setNotificationToggle(true); }
      });
    } else {
      unfollowHashtag(query, userData.user.id).then((res) => {
        setFollowingHashtag(false);
        if (res.data.notification === 0) { setNotificationToggle(false); }
      });
    }
  };

  const onOffNotificationClick = () => {
    if (!notificationToggle) {
      followHashtag(query, userData.user.id, 1).then(() => {
        setNotificationToggle(true);
      });
    } else {
      followHashtag(query, userData.user.id, 0).then(() => {
        setNotificationToggle(false);
      });
    }
  };

  return (
    <div>
      <SearchHeader
        tabKey="posts"
        setSearch={setSearch}
        search={search}
        label="Search"
        onOffNotificationClick={onOffNotificationClick}
        followUnfollowClick={followUnfollowClick}
        following={followingHashtag}
        notificationToggle={notificationToggle}
      />
      {
        errorMessage && errorMessage.length > 0 && (
          <div className="mt-3 text-start">
            {errorMessage}
          </div>
        )
      }
      <InfiniteScroll
        threshold={3000}
        pageStart={0}
        initialLoad
        loadMore={() => { setRequestAdditionalPosts(true); }}
        hasMore={!noMoreData}
      >
        {
          searchPosts.length > 0
          && (
            <PostFeed
              postFeedData={searchPosts}
              popoverOptions={loginUserPopoverOptions}
              isCommentSection={false}
              onPopoverClick={handlePopoverOption}
              otherUserPopoverOptions={otherUserPopoverOptions}
              onLikeClick={onLikeClick}
              onSelect={persistScrollPosition}
              isSinglePost={false}
            />
          )
        }
      </InfiniteScroll>
      {loadingPosts && <LoadingIndicator />}
      {noMoreData && renderNoMoreDataMessage()}
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </div>
  );
}

export default SearchPosts;
