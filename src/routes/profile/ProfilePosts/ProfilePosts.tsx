/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import ProfileHeader from '../ProfileHeader';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import ReportModal from '../../../components/ui/ReportModal';
import { getProfilePosts, getSuggestUserName, getUser } from '../../../api/users';
import { User, Post } from '../../../types';
import EditPostModal from '../../../components/ui/EditPostModal';
import { MentionProps } from '../../posts/create-post/CreatePost';
import { deleteFeedPost, updateFeedPost } from '../../../api/feed-posts';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { likeFeedPost, unlikeFeedPost } from '../../../api/feed-likes';
import { findFirstYouTubeLinkVideoId } from '../../../utils/text-utils';
import { createBlockUser } from '../../../api/blocks';
import { reportData } from '../../../api/report';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { useAppSelector } from '../../../redux/hooks';

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user'];

function ProfilePosts() {
  const { userName } = useParams<string>();
  const [user, setUser] = useState<User>();
  useEffect(() => {
    if (userName) {
      getUser(userName)
        .then((res) => {
          setUser(res.data);
        });
    }
  }, [userName]);
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [mentionList, setMentionList] = useState<MentionProps[]>([]);
  const [postContent, setPostContent] = useState<string>('');
  const [postId, setPostId] = useState<string>('');
  const loginUserData = useAppSelector((state) => state.user.user);
  const [postUserId, setPostUserId] = useState<string>('');

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
    setShowReportModal(true);
    setDropDownValue(value);
  };
  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts && user) {
      setLoadingPosts(true);
      getProfilePosts(
        user.id,
        posts.length > 1 ? posts[posts.length - 1]._id : undefined,
      ).then((res) => {
        const newPosts = res.data.map((data: any) => (
          {
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
            likeIcon: data.likes.includes(loginUserData.id),
            likeCount: data.likeCount,
            commentCount: data.commentCount,
          }
        ));
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
  }, [requestAdditionalPosts, loadingPosts, user]);
  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        posts.length === 0
          ? 'No posts available'
          : 'No more posts'
      }
    </p>
  );

  const handleSearch = (text: string) => {
    setMentionList([]);
    if (text) {
      getSuggestUserName(text)
        .then((res) => setMentionList(res.data));
    }
  };
  const callLatestFeedPost = () => {
    if (user) {
      getProfilePosts(user.id).then((res) => {
        const newPosts = res.data.map((data: any) => ({
          _id: data._id,
          id: data._id,
          postDate: data.createdAt,
          content: data.message,
          images: formatImageVideoList(data.images, data.message),
          userName: data.userId.userName,
          profileImage: data.userId.profilePic,
          userId: data.userId.userId,
          likes: data.likes,
          likeIcon: data.likes.includes(loginUserData.id),
          likeCount: data.likeCount,
          commentCount: data.commentCount,
        }));
        setPosts(newPosts);
      });
    }
  };
  const onUpdatePost = (message: string) => {
    updateFeedPost(postId, message).then(() => {
      setShowReportModal(false);
      callLatestFeedPost();
    });
  };
  const deletePostClick = () => {
    deleteFeedPost(postId)
      .then(() => {
        setShowReportModal(false);
        callLatestFeedPost();
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };
  const onLikeClick = (feedPostId: string) => {
    const checkLike = posts.some((post) => post.id === feedPostId
      && post.likes?.includes(loginUserData.id));

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
        setShowReportModal(false);
        callLatestFeedPost();
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };

  const reportProfilePost = (reason: string) => {
    const reportPayload = {
      targetId: postId!,
      reason,
      reportType: 'post',
    };
    reportData(reportPayload).then((res) => {
      if (res.status === 200) callLatestFeedPost();
    })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };

  return (
    <AuthenticatedPageWrapper rightSidebarType={loginUserData.id === user?.id ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="posts" user={user} />
      {loginUserData.userName === userName
        && (
          <div className="my-4">
            <CustomCreatePost />
          </div>
        )}
      {errorMessage && errorMessage.length > 0 && (
        <div className="mt-3 text-start">
          {errorMessage}
        </div>
      )}
      <InfiniteScroll
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
              onLikeClick={onLikeClick}
            />
          )
        }
      </InfiniteScroll>
      {loadingPosts && <LoadingIndicator />}
      {noMoreData && renderNoMoreDataMessage()}
      <ReportModal
        show={showReportModal}
        setShow={setShowReportModal}
        slectedDropdownValue={dropDownValue}
      />
      {dropDownValue !== 'Edit'
        && (
          <ReportModal
            deleteText="Are you sure you want to delete this post?"
            onConfirmClick={deletePostClick}
            show={showReportModal}
            setShow={setShowReportModal}
            slectedDropdownValue={dropDownValue}
            onBlockYesClick={onBlockYesClick}
            handleReport={reportProfilePost}
          />
        )}
      {dropDownValue === 'Edit' && <EditPostModal show={showReportModal} setShow={setShowReportModal} handleSearch={handleSearch} mentionList={mentionList} setPostContent={setPostContent} postContent={postContent} onUpdatePost={onUpdatePost} />}
    </AuthenticatedPageWrapper>
  );
}
export default ProfilePosts;
