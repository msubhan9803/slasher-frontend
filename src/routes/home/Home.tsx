/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useLocation } from 'react-router-dom';
import CustomCreatePost from '../../components/ui/CustomCreatePost';
import PostFeed from '../../components/ui/post/PostFeed/PostFeed';
import SuggestedFriend from './SuggestedFriend';
import ReportModal from '../../components/ui/ReportModal';
import {
  deleteFeedPost, getHomeFeedPosts, hideFeedPost, updateFeedPost,
} from '../../api/feed-posts';
import {
  ContentDescription, FriendRequestReaction, FriendType, Post,
} from '../../types';
import { PopoverClickProps } from '../../components/ui/CustomPopover';
import { likeFeedPost, unlikeFeedPost } from '../../api/feed-likes';
import { createBlockUser } from '../../api/blocks';
import { reportData } from '../../api/report';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import EditPostModal from '../../components/ui/post/EditPostModal';
import {
  blockedUsersCache,
  deletedPostsCache, getPageStateCache, hasPageStateCache, setPageStateCache,
} from '../../pageStateCache';
import useProgressButton from '../../components/ui/ProgressButton';
import { sleep } from '../../utils/timer-utils';
import { useAppSelector } from '../../redux/hooks';
import { friendship } from '../../api/friends';
import FriendshipStatusModal from '../../components/ui/friendShipCheckModal';

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user', 'Hide'];
const newsPostPopoverOptions = ['Report', 'Hide'];

const removeDeletedPost = (post: any) => !deletedPostsCache.has(post._id);
const removeBlockedUserPosts = (post: any) => !blockedUsersCache.has(post.userId);

function Home() {
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [show, setShow] = useState(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [postImages, setPostImages] = useState<string[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<any>([]);
  const [postContent, setPostContent] = useState<string>('');
  const [postId, setPostId] = useState<string>('');
  const [postUserId, setPostUserId] = useState<string>('');
  const [rssfeedProviderId, setRssfeedProviderId] = useState<string>('');
  const [friendStatus, setFriendStatus] = useState<FriendRequestReaction | null>(null);
  const [friendData, setFriendData] = useState<FriendType>(null);
  const [friendShipStatusModal, setFriendShipStatusModal] = useState<boolean>(false);
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const location = useLocation();
  const userId = useAppSelector((state: any) => state.user.user.id);
  const userData = useAppSelector((state) => state.user.user);
  const pageStateCache = (getPageStateCache(location) ?? [])
    .filter(removeDeletedPost)
    .filter(removeBlockedUserPosts);
  const [posts, setPosts] = useState<Post[]>(
    hasPageStateCache(location)
      ? pageStateCache : [],
  );
  const lastLocationKeyRef = useRef(location.key);

  const persistScrollPosition = () => { setPageStateCache(location, posts); };

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    persistScrollPosition();
    if (value === 'Hide') {
      const postIdToHide = popoverClickProps.id;
      if (!postIdToHide) { return; }
      hideFeedPost(postIdToHide).then(() => {
        // Set posts excluding the `focussedPost` so that the focussedPost is hidden immediately
        setPosts((allPosts) => allPosts.filter((post) => post._id !== postIdToHide));
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
    setRssfeedProviderId(popoverClickProps.rssfeedProviderId ?? '');
    setShow(true);
    setDropDownValue(value);
  };

  const fetchFeedPosts = useCallback((forceReload = false) => {
    if (forceReload) { setPosts([]); }
    setLoadingPosts(true);
    const lastPostId = posts.length > 0 ? posts[posts.length - 1]._id : undefined;
    getHomeFeedPosts(
      forceReload ? undefined : lastPostId,
    ).then((res) => {
      const newPosts = res.data.map((data: any) => {
        if (data.userId) {
          // Regular post
          return {
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
            hashtags: data.hashtags,
          };
        }
        // RSS feed post
        return {
          _id: data._id,
          id: data._id,
          postDate: data.createdAt,
          message: data.message,
          images: data.images,
          userName: data.rssfeedProviderId?.title,
          profileImage: data.rssfeedProviderId?.logo,
          likeIcon: data.likedByUser,
          likeCount: data.likeCount,
          commentCount: data.commentCount,
          rssfeedProviderId: data?.rssfeedProviderId?._id,
          hashtags: data.hashtags,
        };
      });
      setPosts((prev: Post[]) => [
        ...(forceReload ? [] : prev),
        ...newPosts,
      ]);
      if (res.data.length === 0) { setNoMoreData(true); }
    }).catch(
      (error) => {
        setNoMoreData(true);
        setErrorMessage(error.response.data.message);
      },
    ).finally(
      () => {
        setRequestAdditionalPosts(false);
        setLoadingPosts(false);
        // Fixed edge case bug when `noMoreData` is already set to `true` when user has reached the
        // end of the page and clicks on the `notification-icon` in top navbar to reload the page
        // otherwise pagination doesn't work.
        if (forceReload && (noMoreData === true)) { setNoMoreData(false); }
      },
    );
  }, [noMoreData, posts]);

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
      fetchFeedPosts();
    }
  }, [
    fetchFeedPosts, loadingPosts, location, pageStateCache.length,
    posts.length, requestAdditionalPosts, location.pathname,
  ]);

  useEffect(() => {
    const isSameKey = lastLocationKeyRef.current === location.key;
    if (isSameKey) { return; }
    // Fetch feedPosts when we click the `home-icon` in navbar
    fetchFeedPosts(true);
    // Update lastLocation
    lastLocationKeyRef.current = location.key;
  }, [fetchFeedPosts, location.key]);

  const renderNoMoreDataMessage = () => {
    if (loadingPosts) { return null; }
    return (
      <p className="text-center">
        {posts.length === 0
          ? 'No posts available'
          : 'No more posts'}
      </p>
    );
  };
  const callLatestFeedPost = () => {
    getHomeFeedPosts().then((res) => {
      const newPosts = res.data.map((data: any) => {
        if (data.userId) {
          // Regular post
          return {
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
            movieId: data.movieId,
            hashtags: data.hashtags,
          };
        }
        // RSS feed post
        return {
          _id: data._id,
          id: data._id,
          postDate: data.createdAt,
          message: data.message,
          images: data.images,
          userName: data.rssfeedProviderId?.title,
          profileImage: data.rssfeedProviderId?.logo,
          likeIcon: data.likedByUser,
          likeCount: data.likeCount,
          commentCount: data.commentCount,
          rssfeedProviderId: data.rssfeedProviderId._id,
          hashtags: data.hashtags,
        };
      });
      setPosts(newPosts);
    });
  };

  const onUpdatePost = (
    message: string,
    images: string[],
    imageDelete: string[] | undefined,
    descriptionArray?: ContentDescription[],
  ) => {
    setProgressButtonStatus('loading');
    updateFeedPost(postId, message, images, imageDelete, null, descriptionArray)
      .then(async (res) => {
        setProgressButtonStatus('default');
        await sleep(500);
        setShow(false);
        const updatePost = posts.map((post: any) => {
          if (post._id === postId) {
            return {
              ...post,
              message: res.data.message,
              images: res.data.images,
            };
          }
          return post;
        });
        setPosts(updatePost);
        callLatestFeedPost();
      })
      .catch((error) => {
        setProgressButtonStatus('failure');
        const msg = error.response.status === 0 && !error.response.data
          ? 'Combined size of files is too large.'
          : error.response.data.message;
        setErrorMessage(msg);
      });
  };
  const deletePostClickAsync = async () => {
    setProgressButtonStatus('loading');
    setPosts((prevPosts) => prevPosts.filter(((post) => post._id !== postId)));
    return deleteFeedPost(postId)
      .then(() => {
        setProgressButtonStatus('default');
      })
      .catch(async (error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        setProgressButtonStatus('failure');
        await sleep(500);
      });
  };

  const checkFriendShipStatus = useCallback((selectedFeedPostUserId: string) => new Promise<void>(
    (resolve, reject) => {
      if (userId === selectedFeedPostUserId) {
        resolve();
      } else {
        friendship(selectedFeedPostUserId).then((res) => {
          if (res.data.reaction === FriendRequestReaction.Accepted) {
            resolve();
          } else {
            setPostUserId(selectedFeedPostUserId!);
            setFriendShipStatusModal(true);
            setFriendData(res.data);
            setFriendStatus(res.data.reaction);
            reject();
          }
        }).catch(() => reject());
      }
    },
  ), [userId]);

  const handlePostDislike = useCallback((feedPostId: string) => {
    setPosts((prevPosts) => prevPosts.map(
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
    setPosts((prevPosts) => prevPosts.map((prevPost) => {
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
    const checkLike = posts.some((post) => post.id === feedPostId
      && post.likeIcon);

    // Dislike/Like optimistically
    if (checkLike) {
      handlePostDislike(feedPostId);
    } else {
      handlePostLike(feedPostId);
    }

    const revertOptimisticUpdate = () => {
      if (checkLike) {
        handlePostLike(feedPostId);
      } else {
        handlePostDislike(feedPostId);
      }
    };

    const selectedFeedPostUserId = posts.find((post) => post.id === feedPostId)?.userId;

    const handleLikeAndUnlikeFeedPost = async () => {
      try {
        if (checkLike) {
          await unlikeFeedPost(feedPostId);
        } else {
          const res = await likeFeedPost(feedPostId);
          if (!res.data.isFriend) {
            checkFriendShipStatus(selectedFeedPostUserId!);
          }
        }
      } catch (error: any) {
        revertOptimisticUpdate();
        if (error.response.status === 403) {
          checkFriendShipStatus(selectedFeedPostUserId!);
        }
      }
    };

    handleLikeAndUnlikeFeedPost();
  };

  const onBlockYesClick = () => {
    setProgressButtonStatus('loading');
    createBlockUser(postUserId)
      .then(() => {
        setProgressButtonStatus('default');
        setDropDownValue('BlockUserSuccess');
        setPosts((prev) => prev.filter(
          (scrollData: any) => scrollData.userId !== postUserId,
        ));
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
        setProgressButtonStatus('failure');
      });
  };
  const afterBlockUser = () => {
    setShow(false);
  };

  const reportHomePost = (reason: string) => {
    setProgressButtonStatus('loading');
    const reportPayload = {
      targetId: postId,
      reason,
      reportType: 'post',
    };
    reportData(reportPayload).then((res) => {
      if (res) { callLatestFeedPost(); setProgressButtonStatus('default'); }
    })
      // eslint-disable-next-line no-console
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
    // Ask to block user as well
    setDropDownValue('PostReportSuccessDialog');
  };

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        {/* <DebugAdvertisingId /> */}

        <CustomCreatePost className="mt-3 mt-lg-0" />
        <h1 className="h2 my-3 ms-3 ms-md-0">Suggested friends</h1>
        <SuggestedFriend />
        {
          errorMessage && errorMessage.length > 0 && (
            <div className="mt-3 text-start">
              {errorMessage}
            </div>
          )
        }
        <h1 className="h2 my-3 ms-3 ms-md-0">Latest posts</h1>
        <InfiniteScroll
          threshold={3000}
          pageStart={0}
          initialLoad
          loadMore={() => { setRequestAdditionalPosts(true); }}
          hasMore={!noMoreData}
        >
          {
            posts.length > 0
            && (
              <PostFeed
                postFeedData={posts}
                popoverOptions={loginUserPopoverOptions}
                isCommentSection={false}
                onPopoverClick={handlePopoverOption}
                otherUserPopoverOptions={otherUserPopoverOptions}
                newsPostPopoverOptions={newsPostPopoverOptions}
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
          ['Block user', 'Report', 'Delete', 'PostReportSuccessDialog', 'BlockUserSuccess'].includes(dropDownValue)
          && (
            <ReportModal
              onConfirmClickAsync={deletePostClickAsync}
              show={show}
              setShow={setShow}
              slectedDropdownValue={dropDownValue}
              onBlockYesClick={onBlockYesClick}
              afterBlockUser={afterBlockUser}
              handleReport={reportHomePost}
              rssfeedProviderId={rssfeedProviderId}
              ProgressButton={ProgressButton}
            />
          )
        }
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
              editPost
            />
          )
        }

        {friendShipStatusModal && !userData.ignoreFriendSuggestionDialog && (
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
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default Home;
