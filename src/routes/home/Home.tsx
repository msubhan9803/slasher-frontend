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

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user'];

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
  const loginUserId = Cookies.get('userId');
  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    if (popoverClickProps.content) {
      setPostContent(popoverClickProps.content);
    }
    if (popoverClickProps.id) {
      setPostId(popoverClickProps.id);
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
              images: data.images,
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
            images: data.images,
            userName: data.rssfeedProviderId?.title,
            profileImage: data.rssfeedProviderId?.logo,
            likes: data.likes,
            likeIcon: data.likes.includes(loginUserId),
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
  const renderLoadingIndicator = () => (
    <p className="text-center">Loading...</p>
  );

  const callLatestFeedPost = () => {
    getHomeFeedPosts().then((res) => {
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

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <CustomCreatePost imageUrl="https://i.pravatar.cc/300?img=12" />
      <h1 className="h2 mt-2 ms-3 ms-md-0">Suggested friends</h1>
      <SuggestedFriend />
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
      {dropDownValue !== 'Edit'
        && (
          <ReportModal
            deleteText="Are you sure you want to delete this post?"
            onConfirmClick={deletePostClick}
            show={show}
            setShow={setShow}
            slectedDropdownValue={dropDownValue}
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
