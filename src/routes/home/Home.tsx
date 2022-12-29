/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Cookies from 'js-cookie';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomCreatePost from '../../components/ui/CustomCreatePost';
import PostFeed from '../../components/ui/PostFeed/PostFeed';
import SuggestedFriend from './SuggestedFriend';
import ReportModal from '../../components/ui/ReportModal';
import { deleteFeedPost, getHomeFeedPosts, updateFeedPost } from '../../api/feed-posts';
import { Post } from '../../types';
import { MentionProps } from '../posts/create-post/CreatePost';
import { getSuggestUserName } from '../../api/users';
import EditPostModal from '../../components/ui/EditPostModal';
import { PopoverClickProps } from '../../components/ui/CustomPopover';
import { likeFeedPost, unlikeFeedPost } from '../../api/feed-likes';
import { findFirstYouTubeLinkVideoId } from '../../utils/text-utils';
import { createBlockUser } from '../../api/blocks';
import { reportData } from '../../api/report';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user'];
const newsPostPopoverOptions = ['Report'];

function Home() {
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [show, setShow] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [mentionList, setMentionList] = useState<MentionProps[]>([]);
  const [postContent, setPostContent] = useState<string>('');
  const [postId, setPostId] = useState<string>('');
  const [postUserId, setPostUserId] = useState<string>('');
  const loginUserId = Cookies.get('userId');
  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
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

  // TODO: Make this a shared function becuase it also exists in other places
  const formatImageVideoList = (postImageList: any, postMessage: string) => {
    const youTubeVideoId = findFirstYouTubeLinkVideoId(postMessage);
    if (youTubeVideoId) {
      postImageList.splice(0, 0, {
        videoKey: youTubeVideoId,
      });
    }
    return postImageList;
  };

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts) {
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
              images: formatImageVideoList(data.images, data.message),
              userName: data.userId.userName,
              profileImage: data.userId.profilePic,
              userId: data.userId._id,
              likes: data.likes,
              likeIcon: data.likes.includes(loginUserId),
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
            images: formatImageVideoList(data.images, data.message),
            userName: data.rssfeedProviderId?.title,
            profileImage: data.rssfeedProviderId?.logo,
            likes: data.likes,
            likeIcon: data.likes.includes(loginUserId),
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
      }).catch(
        (error) => {
          setNoMoreData(true);
          setErrorMessage(error.response.data.message);
        },
      ).finally(
        () => { setRequestAdditionalPosts(false); setLoadingPosts(false); },
      );
    }
  }, [requestAdditionalPosts, loadingPosts]);

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
            images: formatImageVideoList(data.images, data.message),
            userName: data.userId.userName,
            profileImage: data.userId.profilePic,
            userId: data.userId._id,
            likes: data.likes,
            likeIcon: data.likes.includes(loginUserId),
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
          images: formatImageVideoList(data.images, data.message),
          userName: data.rssfeedProviderId?.title,
          profileImage: data.rssfeedProviderId?.logo,
          likes: data.likes,
          likeIcon: data.likes.includes(loginUserId),
          likeCount: data.likeCount,
          commentCount: data.commentCount,
          rssfeedProviderId: data.rssfeedProviderId._id,
        };
      });
      setPosts(newPosts);
    });
  };

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
      && post.likes?.includes(loginUserId!));

    if (checkLike) {
      unlikeFeedPost(feedPostId).then((res) => {
        if (res.status === 200) callLatestFeedPost();
      });
    } else {
      likeFeedPost(feedPostId).then((res) => {
        if (res.status === 201) callLatestFeedPost();
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
      if (res.status === 200) callLatestFeedPost();
      setShow(false);
    })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <CustomCreatePost />
      <h1 className="h2 mt-2 ms-3 ms-md-0">Suggested friends</h1>
      <SuggestedFriend />
      {errorMessage && errorMessage.length > 0 && (
        <div className="mt-3 text-start">
          {errorMessage}
        </div>
      )}
      <InfiniteScroll
        threshold={2000}
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
            />
          )
        }
      </InfiniteScroll>
      {loadingPosts && <LoadingIndicator />}
      {noMoreData && renderNoMoreDataMessage()}
      {dropDownValue !== 'Edit'
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
        )}
      {dropDownValue === 'Edit'
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
        )}
    </AuthenticatedPageWrapper>
  );
}

export default Home;
