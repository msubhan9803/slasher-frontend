/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Cookies from 'js-cookie';
import { useLocation } from 'react-router-dom';
import CustomCreatePost from '../../components/ui/CustomCreatePost';
import PostFeed from '../../components/ui/PostFeed/PostFeed';
import SuggestedFriend from './SuggestedFriend';
import ReportModal from '../../components/ui/ReportModal';
import {
  deleteFeedPost, getHomeFeedPosts, hideFeedPost, updateFeedPost,
} from '../../api/feed-posts';
import { Post } from '../../types';
import { MentionProps } from '../posts/create-post/CreatePost';
import { getSuggestUserName } from '../../api/users';
import EditPostModal from '../../components/ui/EditPostModal';
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

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user', 'Hide'];
const newsPostPopoverOptions = ['Report', 'Hide'];

function Home() {
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [show, setShow] = useState(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [mentionList, setMentionList] = useState<MentionProps[]>([]);
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
    if (popoverClickProps.id) {
      setPostId(popoverClickProps.id);
    }
    if (popoverClickProps.userId) {
      setPostUserId(popoverClickProps.userId);
    }
    setShow(true);
    setDropDownValue(value);
  };

  const handleSearch = (text: string) => {
    setMentionList([]);
    if (text) {
      getSuggestUserName(text)
        .then((res) => setMentionList(res.data));
    }
  };

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
      if (scrollPosition === null
        || scrollPosition?.position === 0
        || posts.length >= scrollPosition?.data?.length
        || posts.length === 0
      ) {
        setLoadingPosts(true);
        getHomeFeedPosts(
          posts.length > 1 ? posts[posts.length - 1]._id : undefined,
        ).then((res) => {
          const newPosts = res.data.map((data: any) => {
            if (data.userId) {
              // Regular post
              return {
                /* eslint no-underscore-dangle: 0 */
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
          const positionData = {
            pathname: '',
            position: 0,
            data: [],
            positionElementId: '',
          };
          dispatch(setScrollPosition(positionData));
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
  }, [requestAdditionalPosts, loadingPosts, loginUserId, posts, scrollPosition, dispatch]);

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
            /* eslint no-underscore-dangle: 0 */
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

  useEffect(() => {
    callLatestFeedPost();
  }, []);
  const onUpdatePost = (message: string) => {
    updateFeedPost(postId, message).then(() => {
      setShow(false);
      callLatestFeedPost();
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
          threshold={2000}
          pageStart={0}
          initialLoad={false}
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
          dropDownValue === 'Delete'
          && (
            <ReportModal
              deleteText="Are you sure you want to delete this post?"
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
              setShow={setShow}
              handleSearch={handleSearch}
              mentionList={mentionList}
              setPostContent={setPostContent}
              postContent={postContent}
              onUpdatePost={onUpdatePost}
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
