/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router-dom';
import CustomCreatePost from '../../components/ui/CustomCreatePost';
import PostFeed from '../../components/ui/post/PostFeed/PostFeed';
import SuggestedFriend from './SuggestedFriend';
import ReportModal from '../../components/ui/ReportModal';
import {
  deleteFeedPost, getHomeFeedPosts, hideFeedPost, updateFeedPost,
} from '../../api/feed-posts';
import { Post } from '../../types';
import { PopoverClickProps } from '../../components/ui/CustomPopover';
import { likeFeedPost, unlikeFeedPost } from '../../api/feed-likes';
import { createBlockUser } from '../../api/blocks';
import { reportData } from '../../api/report';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import RightSidebarSelf from '../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import FormatImageVideoList from '../../utils/vido-utils';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { setScrollPosition } from '../../redux/slices/scrollPositionSlice';
import EditPostModal from '../../components/ui/post/EditPostModal';
import { setHomeDataReload } from '../../redux/slices/userSlice';

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user', 'Hide'];
const newsPostPopoverOptions = ['Report', 'Hide'];

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
  const loginUserId = Cookies.get('userId');
  const scrollPosition: any = useAppSelector((state: any) => state.scrollPosition);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [posts, setPosts] = useState<Post[]>(
    scrollPosition.pathname === location.pathname
      ? scrollPosition?.data : [],
  );
  const reloadData = useAppSelector((state) => state.user.homeDataReload);
  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    if (value === 'Hide') {
      const postIdToHide = popoverClickProps.id;
      if (!postIdToHide) { return; }
      hideFeedPost(postIdToHide).then(() => {
        // Set posts excluding the `focussedPost` so that the focussedPost is hidden immediately
        setPosts((allPosts) => allPosts.filter((post) => post._id !== postIdToHide));
      });
      return;
    }

    if (popoverClickProps.content) {
      setPostContent(popoverClickProps.content);
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

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
      if (scrollPosition === null
        || scrollPosition?.position === 0
        || posts.length >= scrollPosition?.data?.length
        || posts.length === 0
        || scrollPosition.pathname !== location.pathname
        || reloadData
      ) {
        setLoadingPosts(true);
        getHomeFeedPosts(
          posts.length > 1 ? posts[posts.length - 1]._id : undefined,
        ).then((res) => {
          const newPosts = res.data.map((data: any) => {
            if (data.userId) {
              // Regular post
              return {
                _id: data._id,
                id: data._id,
                postDate: data.createdAt,
                content: data.message,
                images: FormatImageVideoList(data.images, data.message),
                userName: data.userId.userName,
                profileImage: data.userId.profilePic,
                userId: data.userId._id,
                likeIcon: data.likedByUser,
                likeCount: data.likeCount,
                commentCount: data.commentCount,
              };
            }
            // RSS feed post
            return {
              _id: data._id,
              id: data._id,
              postDate: data.createdAt,
              content: data.message,
              images: FormatImageVideoList(data.images, data.message),
              userName: data.rssfeedProviderId?.title,
              profileImage: data.rssfeedProviderId?.logo,
              likeIcon: data.likedByUser,
              likeCount: data.likeCount,
              commentCount: data.commentCount,
              rssfeedProviderId: data.rssfeedProviderId._id,
            };
          });
          setPosts((prev: Post[]) => [
            ...prev,
            ...newPosts,
          ]);
          if (res.data.length === 0) { setNoMoreData(true); }
          if (scrollPosition.pathname === location.pathname
            && posts.length >= scrollPosition.data.length + 10) {
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
    }
  }, [
    requestAdditionalPosts, loadingPosts, loginUserId, posts, scrollPosition,
    dispatch, location.pathname, reloadData,
  ]);

  useEffect(() => {
    if (reloadData) {
      dispatch(setHomeDataReload(false));
      const positionData = {
        pathname: '',
        position: 0,
        data: [],
        positionElementId: '',
      };
      dispatch(setScrollPosition(positionData));
    }
  }, [reloadData, dispatch]);
  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        posts.length === 0
          ? 'No posts available'
          : 'No more posts'
      }
    </p>
  );
  const callLatestFeedPost = () => {
    getHomeFeedPosts().then((res) => {
      const newPosts = res.data.map((data: any) => {
        if (data.userId) {
          // Regular post
          return {
            _id: data._id,
            id: data._id,
            postDate: data.createdAt,
            content: data.message,
            images: FormatImageVideoList(data.images, data.message),
            userName: data.userId.userName,
            profileImage: data.userId.profilePic,
            userId: data.userId._id,
            likeIcon: data.likedByUser,
            likeCount: data.likeCount,
            commentCount: data.commentCount,
          };
        }
        // RSS feed post
        return {
          _id: data._id,
          id: data._id,
          postDate: data.createdAt,
          content: data.message,
          images: FormatImageVideoList(data.images, data.message),
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

  const onUpdatePost = (message: string, images: string[], imageDelete: string[] | undefined) => {
    updateFeedPost(postId, message, images, imageDelete).then((res) => {
      setShow(false);
      const updatePost = posts.map((post: any) => {
        if (post._id === postId) {
          return {
            ...post, content: res.data.message, images: res.data.images,
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
      /* eslint-disable no-console */
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
        setShow(false);
        callLatestFeedPost();
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };

  const reportHomePost = (reason: string) => {
    const reportPayload = {
      targetId: postId,
      reason,
      reportType: 'post',
    };
    reportData(reportPayload).then((res) => {
      if (res.status === 200) { callLatestFeedPost(); }
      setShow(false);
    })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };

  const persistScrollPosition = (id: string) => {
    const positionData = {
      pathname: location.pathname,
      position: window.pageYOffset,
      data: posts,
      positionElementId: id,
    };
    dispatch(setScrollPosition(positionData));
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
              />
            )
          }
        </InfiniteScroll>
        {loadingPosts && <LoadingIndicator />}
        {noMoreData && renderNoMoreDataMessage()}
        {
          (dropDownValue === 'Block user' || dropDownValue === 'Report' || dropDownValue === 'Delete')
          && (
            <ReportModal
              onConfirmClick={deletePostClick}
              show={show}
              setShow={setShow}
              slectedDropdownValue={dropDownValue}
              onBlockYesClick={onBlockYesClick}
              handleReport={reportHomePost}
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
