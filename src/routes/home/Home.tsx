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
import { ContentDescription, Post } from '../../types';
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
  deletePageStateCache, deletedPostsCache, getPageStateCache, hasPageStateCache, setPageStateCache,
} from '../../pageStateCache';

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
  const location = useLocation();
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
        };
      });
      setPosts((prev: Post[]) => [
        ...(forceReload ? [] : prev),
        ...newPosts,
      ]);
      if (res.data.length === 0) { setNoMoreData(true); }
      if (hasPageStateCache(location)
        && posts.length >= pageStateCache.length + 10) {
        deletePageStateCache(location);
      }
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
  }, [location, noMoreData, pageStateCache.length, posts]);

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
      if (
        !hasPageStateCache(location)
        || posts.length >= pageStateCache.length
        || posts.length === 0
      ) {
        fetchFeedPosts();
      }
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
    updateFeedPost(postId, message, images, imageDelete, null, descriptionArray)
      .then((res) => {
        setShow(false);
        const updatePost = posts.map((post: any) => {
          if (post._id === postId) {
            return {
              ...post, message: res.data.message, images: res.data.images,
            };
          }
          return post;
        });
        setPosts(updatePost);
      })
      .catch((error) => {
        const msg = error.response.status === 0 && !error.response.data
          ? 'Combined size of files is too large.'
          : error.response.data.message;
        setErrorMessage(msg);
      });
  };
  const deletePostClick = () => {
    deleteFeedPost(postId)
      .then(() => {
        setShow(false);
        callLatestFeedPost();
      })
      // eslint-disable-next-line no-console
      .catch((error) => console.error(error));
  };

  const onLikeClick = (feedPostId: string) => {
    const checkLike = posts.some((post) => post.id === feedPostId
      && post.likeIcon);
    if (checkLike) {
      unlikeFeedPost(feedPostId).then((res) => {
        if (res.status === 200) {
          const unLikePostData = posts.map(
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
          setPosts(unLikePostData);
        }
      });
    } else {
      likeFeedPost(feedPostId).then((res) => {
        if (res.status === 201) {
          const likePostData = posts.map((likePost: Post) => {
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
          setPosts(likePostData);
        }
      });
    }
  };

  const onBlockYesClick = () => {
    createBlockUser(postUserId)
      .then(() => {
        setDropDownValue('BlockUserSuccess');
        setPosts((prev) => prev.filter(
          (scrollData: any) => scrollData.userId !== postUserId,
        ));
      })
      // eslint-disable-next-line no-console
      .catch((error) => console.error(error));
  };
  const afterBlockUser = () => {
    setShow(false);
  };

  const reportHomePost = (reason: string) => {
    const reportPayload = {
      targetId: postId,
      reason,
      reportType: 'post',
    };
    reportData(reportPayload).then((res) => {
      if (res.status === 200) { callLatestFeedPost(); }
    })
      // eslint-disable-next-line no-console
      .catch((error) => console.error(error));
    // Ask to block user as well
    setDropDownValue('PostReportSuccessDialog');
  };

  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
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
              onConfirmClick={deletePostClick}
              show={show}
              setShow={setShow}
              slectedDropdownValue={dropDownValue}
              onBlockYesClick={onBlockYesClick}
              afterBlockUser={afterBlockUser}
              handleReport={reportHomePost}
              rssfeedProviderId={rssfeedProviderId}
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
              editPost
            />
          )
        }
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default Home;
