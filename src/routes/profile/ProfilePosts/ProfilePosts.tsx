/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroller';
import Cookies from 'js-cookie';
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
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const [showReportModal, setShowReportModal] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [mentionList, setMentionList] = useState<MentionProps[]>([]);
  const [postContent, setPostContent] = useState<string>('');
  const [postId, setPostId] = useState<string>('');
  const loginUserId = Cookies.get('userId');
  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    if (popoverClickProps.content) {
      setPostContent(popoverClickProps.content);
    }
    if (popoverClickProps.id) {
      setPostId(popoverClickProps.id);
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
            images: data.images,
            userName: data.userId.userName,
            profileImage: data.userId.profilePic,
            userId: data.userId._id,
            likes: data.likes,
            likeIcon: data.likes.includes(loginUserId),
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
  const renderLoadingIndicator = () => (
    <p className="text-center">Loading...</p>
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
          images: data.images,
          userName: data.userId.userName,
          profileImage: data.userId.profilePic,
          userId: data.userId.userId,
          likes: data.likes,
          likeIcon: data.likes.includes(loginUserId),
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
  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="posts" user={user} />
      {queryParam === 'self'
        && (
          <div className="mt-4">
            <CustomCreatePost imageUrl="https://i.pravatar.cc/300?img=12" />
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
      {loadingPosts && renderLoadingIndicator()}
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
          />
        )}
      {dropDownValue === 'Edit' && <EditPostModal show={showReportModal} setShow={setShowReportModal} handleSearch={handleSearch} mentionList={mentionList} setPostContent={setPostContent} postContent={postContent} onUpdatePost={onUpdatePost} />}
    </AuthenticatedPageWrapper>
  );
}
export default ProfilePosts;
