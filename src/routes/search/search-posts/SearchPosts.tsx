/* eslint-disable max-lines */
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
import { FriendRequestReaction, FriendType, Post } from '../../../types';
import SearchHeader from '../SearchHeader';
import {
  deleteFeedPost, getHashtagPostList, hideFeedPost, updateFeedPost,
} from '../../../api/feed-posts';
import { likeFeedPost, unlikeFeedPost } from '../../../api/feed-likes';
import { useAppSelector } from '../../../redux/hooks';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { followHashtag, getSingleHashtagDetail, unfollowHashtag } from '../../../api/users';
import EditPostModal from '../../../components/ui/post/EditPostModal';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { createBlockUser } from '../../../api/blocks';
import { reportData } from '../../../api/report';
import {
  deletePageStateCache, getPageStateCache, hasPageStateCache, setPageStateCache,
} from '../../../pageStateCache';
import useProgressButton from '../../../components/ui/ProgressButton';
import FriendshipStatusModal from '../../../components/ui/friendShipCheckModal';
// import { friendship } from '../../../api/friends';
import { sleep } from '../../../utils/timer-utils';

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
  const pageStateCache = (getPageStateCache(location) ?? []);
  const [searchPosts, setSearchPosts] = useState<Post[]>(
    hasPageStateCache(location)
      ? pageStateCache : [],
  );
  const [totalPost, setTotalPost] = useState<number>(0);
  const [followingHashtag, setFollowingHashtag] = useState<boolean>(false);
  const [notificationToggle, setNotificationToggle] = useState<boolean>(false);
  const userData = useAppSelector((state) => state.user);
  const [postContent, setPostContent] = useState<string>('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<any>([]);
  const [postId, setPostId] = useState<string>('');
  const [postUserId, setPostUserId] = useState<string>('');
  const [lastHashtagId, setLastHashtagId] = useState<string>('');
  const persistScrollPosition = () => { setPageStateCache(location, searchPosts); };
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const [friendShipStatusModal, setFriendShipStatusModal] = useState<boolean>(false);
  const [friendStatus, setFriendStatus] = useState<FriendRequestReaction | null>(null);
  const [friendData, setFriendData] = useState<FriendType>(null);
  // const userId = useAppSelector((state) => state.user.user.id);

  useEffect(() => {
    setQueryParam(searchParams.get('hashtag'));
    setSearchPosts([]);
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
    setRequestAdditionalPosts(false);
    setLastHashtagId('');
  }, [query, getHashtagDetail]);

  const getSearchPost = useCallback((forceReload = false) => {
    if (forceReload) { setSearchPosts([]); }
    if (query) {
      setLoadingPosts(true);
      getHashtagPostList(
        query.toLowerCase(),
        forceReload ? undefined : lastHashtagId,
      ).then((res) => {
        const newPosts: any = res.data.posts.map((data: any) => {
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
            movieId: data?.movieId,
            hashtags: data?.hashtags,
          };
          return setPost;
        });
        setSearchPosts((prev: Post[]) => [...prev, ...newPosts]);
        setTotalPost(res.data.count);
        if (res.data.posts.length === 0) {
          setNoMoreData(true);
          setLastHashtagId('');
        } else {
          setLastHashtagId(res.data.posts[res.data.posts.length - 1]._id);
        }
        if (hasPageStateCache(location)
          && searchPosts.length >= pageStateCache.length + 10) {
          deletePageStateCache(location);
        }
      }).catch(
        (error) => {
          setNoMoreData(true);
          setErrorMessage(error.response.data.message);
        },
      ).finally(
        () => {
          setRequestAdditionalPosts(false); setLoadingPosts(false);
          if (forceReload && (noMoreData === true)) { setNoMoreData(false); }
        },
      );
    }
  }, [location, query, pageStateCache.length,
    lastHashtagId, noMoreData, searchPosts]);

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts && query) {
      if (
        !hasPageStateCache(location)
        || searchPosts.length >= pageStateCache.length
        || searchPosts.length === 0
      ) {
        getSearchPost();
      }
    }
  }, [getSearchPost, loadingPosts, requestAdditionalPosts, query, pageStateCache.length,
    searchPosts, location]);

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
  // const checkFriendShipStatus = (selectedFeedPostId: string) => new Promise<void>(
  //   (resolve, reject) => {
  //     if (userId === selectedFeedPostId) {
  //       resolve();
  //     } else {
  //       friendship(selectedFeedPostId).then((res) => {
  //         if (res.data.reaction === FriendRequestReaction.Accepted) {
  //           resolve();
  //         } else {
  //           setPostUserId(selectedFeedPostId);
  //           setFriendShipStatusModal(true);
  //           setFriendData(res.data);
  //           setFriendStatus(res.data.reaction);
  //         }
  //       }).catch(() => reject());
  //     }
  //   },
  // );

  const handlePostDislike = useCallback((feedPostId: string) => {
    setSearchPosts((prevPosts) => prevPosts.map(
      (prevPost) => {
        if (prevPost._id === feedPostId) {
          return {
            ...prevPost,
            likeIcon: false,
            likedByUser: false,
            likeCount: prevPost.likeCount - 1,
          };
        }
        return prevPost;
      },
    ));
  }, []);

  const handlePostLike = useCallback((feedPostId: string) => {
    setSearchPosts((prevPosts) => prevPosts.map((prevPost) => {
      if (prevPost._id === feedPostId) {
        return {
          ...prevPost,
          likeIcon: true,
          likedByUser: true,
          likeCount: prevPost.likeCount + 1,
        };
      }
      return prevPost;
    }));
  }, []);

  const onLikeClick = async (feedPostId: string) => {
    const checkLike = searchPosts.some((post) => post.id === feedPostId
      && post.likeIcon);
    // const selectedFeedPostUserId = searchPosts.find((post) => post.id === feedPostId)?.userId;

    const revertOptimisticUpdate = () => {
      if (checkLike) {
        handlePostLike(feedPostId);
      } else {
        handlePostDislike(feedPostId);
      }
    };

    if (checkLike) {
      handlePostDislike(feedPostId);
    } else {
      handlePostLike(feedPostId);
    }

    const handleLikeAndUnlikeFeedPost = async () => {
      try {
        if (checkLike) {
          await unlikeFeedPost(feedPostId);
        } else {
          await likeFeedPost(feedPostId);
          // const res = await likeFeedPost(feedPostId);
          // if (!res.data.isFriend) {
          //   checkFriendShipStatus(selectedFeedPostUserId!);
          // }
        }
      } catch (error: any) {
        revertOptimisticUpdate();
        if (error.response.status === 403) {
          // checkFriendShipStatus(selectedFeedPostUserId!);
        }
      }
    };

    handleLikeAndUnlikeFeedPost();
  };

  const renderNoMoreDataMessage = () => {
    if (loadingPosts) { return null; }
    return (
      <p className="text-center">
        {searchPosts.length === 0
          ? 'No posts available'
          : 'No more posts'}
      </p>
    );
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
    setProgressButtonStatus('loading');
    updateFeedPost(postId, message, images, imageDelete).then(async (res) => {
      setProgressButtonStatus('default');
      await sleep(500);
      setShow(false);
      const updatePost = searchPosts.map((post: any) => {
        if (post._id === postId) {
          return {
            ...post, message: res.data.message, images: res.data.images,
          };
        }
        return post;
      });
      // eslint-disable-next-line max-len
      const checkHahtag = updatePost.filter((tag) => tag.message.toLowerCase().includes(query.toLowerCase()));
      setSearchPosts(checkHahtag);
    })
      .catch((error) => {
        setProgressButtonStatus('failure');
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

  const deletePostClick = async () => {
    setProgressButtonStatus('loading');
    return deleteFeedPost(postId)
      .then(() => {
        setShow(false);
        setProgressButtonStatus('default');
        getSearchPost(true);
      })
      .catch(async (error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        setProgressButtonStatus('failure');
      });
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
        totalHashtagPosts={totalPost}
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
            ProgressButton={ProgressButton}
          />
        )
      }
      {
        (dropDownValue === 'Block user' || dropDownValue === 'Report' || dropDownValue === 'Delete' || dropDownValue === 'PostReportSuccessDialog')
        && (
          <ReportModal
            onConfirmClickAsync={deletePostClick}
            show={show}
            setShow={setShow}
            slectedDropdownValue={dropDownValue}
            onBlockYesClick={onBlockYesClick}
            ProgressButton={ProgressButton}
            handleReport={reportPost}
          />
        )
      }
      {friendShipStatusModal && !userData.user.ignoreFriendSuggestionDialog && (
        <FriendshipStatusModal
          friendShipStatusModal={friendShipStatusModal}
          setFriendShipStatusModal={setFriendShipStatusModal}
          friendStatus={friendStatus}
          setFriendStatus={setFriendStatus}
          setFriendData={setFriendData}
          friendData={friendData}
          userId={postUserId}
        />
      )}
    </div>
  );
}

export default SearchPosts;
