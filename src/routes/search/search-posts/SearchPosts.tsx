/* eslint-disable max-lines */
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
import { Post } from '../../../types';
import SearchHeader from '../SearchHeader';
import {
  deleteFeedPost, getHashtagPostList, hideFeedPost, updateFeedPost,
} from '../../../api/feed-posts';
import { unlikeFeedPost, likeFeedPost } from '../../../api/feed-likes';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { setScrollPosition } from '../../../redux/slices/scrollPositionSlice';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { followHashtag, getSingleHashtagDetail, unfollowHashtag } from '../../../api/users';
import EditPostModal from '../../../components/ui/post/EditPostModal';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { createBlockUser } from '../../../api/blocks';
import { reportData } from '../../../api/report';

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
  const [postContent, setPostContent] = useState<string>('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<any>([]);
  const [postId, setPostId] = useState<string>('');
  const [postUserId, setPostUserId] = useState<string>('');

  useEffect(() => {
    setQueryParam(searchParams.get('hashtag'));
  }, [searchParams]);

  const getHashtagDetail = useCallback(() => {
    getSingleHashtagDetail(query.toLowerCase(), userData.user.id).then((res) => {
      setFollowingHashtag(!!res.data.hashTagId);
      setNotificationToggle(res.data.notification !== 0);
    })
      .catch(() => {
        setFollowingHashtag(false);
        setNotificationToggle(false);
      });
  }, [query, userData]);

  useEffect(() => {
    getHashtagDetail();
    setSearchPosts([]);
    setRequestAdditionalPosts(true);
  }, [query, getHashtagDetail]);

  const getSearchPost = useCallback(() => {
    if (query) {
      setLoadingPosts(true);
      getHashtagPostList(
        query.toLowerCase(),
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
        if (scrollPosition.pathname === location.pathname) {
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
  }, [dispatch, location.pathname, query, searchPosts, scrollPosition.pathname]);

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts && query) {
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
  }, [getSearchPost, loadingPosts, location.pathname, requestAdditionalPosts, query,
    scrollPosition, searchPosts]);

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    if (value === 'Hide') {
      const postIdToHide = popoverClickProps.id;
      if (!postIdToHide) { return; }
      hideFeedPost(postIdToHide).then(() => {
        // Set posts excluding the `focussedPost` so that the focussedPost is hidden immediately
        setSearchPosts((allPosts) => allPosts.filter((post) => post._id !== postIdToHide));
      });
      return;
    }

    if (popoverClickProps.message) {
      setPostContent(popoverClickProps.message);
    }
    if (popoverClickProps.postImages) {
      setDeleteImageIds([]);
      setPostImages(popoverClickProps.postImages);
    }
    if (popoverClickProps.id) {
      setPostId(popoverClickProps.id);
    }
    if (popoverClickProps.userId) {
      setPostUserId(popoverClickProps.userId);
    }
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
          : 'No more posts'
      }
    </p>
  );

  const persistScrollPosition = (id: string) => {
    const positionData = {
      pathname: location.pathname,
      position: window.pageYOffset === 0 ? 1 : window.pageYOffset,
      data: searchPosts,
      positionElementId: id,
    };
    dispatch(setScrollPosition(positionData));
  };

  const followUnfollowClick = () => {
    if (!followingHashtag) {
      followHashtag(query.toLowerCase(), userData.user.id, true).then((res) => {
        setFollowingHashtag(true);
        if (res.data.notification === 1) { setNotificationToggle(true); }
      });
    } else {
      unfollowHashtag(query.toLowerCase(), userData.user.id).then((res) => {
        setFollowingHashtag(false);
        if (res.data.notification === 0) { setNotificationToggle(false); }
      });
    }
  };

  const onOffNotificationClick = () => {
    if (!notificationToggle) {
      followHashtag(query.toLowerCase(), userData.user.id, true).then(() => {
        setNotificationToggle(true);
      });
    } else {
      followHashtag(query.toLowerCase(), userData.user.id, false).then(() => {
        setNotificationToggle(false);
      });
    }
  };

  const onUpdatePost = (message: string, images: string[], imageDelete: string[] | undefined) => {
    updateFeedPost(postId, message, images, imageDelete).then((res) => {
      setShow(false);
      const updatePost = searchPosts.map((post: any) => {
        if (post._id === postId) {
          return {
            ...post, message: res.data.message, images: res.data.images,
          };
        }
        return post;
      });
      const checkHahtag = updatePost.filter((tag) => tag.message.includes(query));
      setSearchPosts(checkHahtag);
    })
      .catch((error) => {
        const msg = error.response.status === 0 && !error.response.data
          ? 'Combined size of files is too large.'
          : error.response.data.message;
        setErrorMessage(msg);
      });
  };

  const onBlockYesClick = () => {
    createBlockUser(postUserId)
      .then(() => {
        setShow(false);
        getSearchPost();
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };

  const deletePostClick = () => {
    deleteFeedPost(postId)
      .then(() => {
        setShow(false);
        getSearchPost();
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };

  const reportPost = (reason: string) => {
    const reportPayload = {
      targetId: postId,
      reason,
      reportType: 'post',
    };
    reportData(reportPayload).then((res) => {
      if (res.status === 200) {
        getSearchPost();
      }
    })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
    // Ask to block user as well
    setDropDownValue('PostReportSuccessDialog');
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
        totalHashtagPosts={searchPosts.length}
      />
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
            // postFeedData={posts}
            // popoverOptions={loginUserPopoverOptions}
            // isCommentSection={false}
            // onPopoverClick={handlePopoverOption}
            // otherUserPopoverOptions={otherUserPopoverOptions}
            // newsPostPopoverOptions={newsPostPopoverOptions}
            // onLikeClick={onLikeClick}
            // onSelect={persistScrollPosition}
            // isSinglePost={false}
          )
        }
      </InfiniteScroll>
      {loadingPosts && <LoadingIndicator />}
      {noMoreData && renderNoMoreDataMessage()}
      {
        dropDownValue === 'Edit'
        && (
          <EditPostModal
            show={show}
            errorMessage={errorMessage}
            setShow={setShow}
            setPostContent={setPostContent}
            postContent={postContent}
            onUpdatePost={onUpdatePost}
            postImages={postImages}
            setPostImages={setPostImages}
            deleteImageIds={deleteImageIds}
            setDeleteImageIds={setDeleteImageIds}
          />
        )
      }
      {
        (dropDownValue === 'Block user' || dropDownValue === 'Report' || dropDownValue === 'Delete' || dropDownValue === 'PostReportSuccessDialog')
        && (
          <ReportModal
            onConfirmClick={deletePostClick}
            show={show}
            setShow={setShow}
            slectedDropdownValue={dropDownValue}
            onBlockYesClick={onBlockYesClick}
            handleReport={reportPost}
          />
        )
      }
    </div>
  );
}

export default SearchPosts;
