/* eslint-disable max-lines */
import React, { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Cookies from 'js-cookie';
import { useLocation, useParams } from 'react-router-dom';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import ProfileHeader from '../ProfileHeader';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import ReportModal from '../../../components/ui/ReportModal';
import { getProfilePosts } from '../../../api/users';
import { User, Post } from '../../../types';
import { deleteFeedPost, updateFeedPost } from '../../../api/feed-posts';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { likeFeedPost, unlikeFeedPost } from '../../../api/feed-likes';
import { createBlockUser } from '../../../api/blocks';
import { reportData } from '../../../api/report';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import FormatImageVideoList from '../../../utils/vido-utils';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import { setScrollPosition } from '../../../redux/slices/scrollPositionSlice';
import EditPostModal from '../../../components/ui/post/EditPostModal';

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user'];

interface Props {
  user: User
}

function ProfilePosts({ user }: Props) {
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [editModalErrorMessage, setEditModalErrorMessage] = useState<string[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<any>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [postContent, setPostContent] = useState<string>('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postId, setPostId] = useState<string>('');
  const loginUserData = useAppSelector((state) => state.user.user);
  const [postUserId, setPostUserId] = useState<string>('');
  const loginUserId = Cookies.get('userId');
  const scrollPosition: any = useAppSelector((state: any) => state.scrollPosition);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const [posts, setPosts] = useState<Post[]>(
    scrollPosition.pathname === location.pathname
      ? scrollPosition?.data : [],
  );
  const { userName: userNameOrId } = useParams<string>();
  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
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
    setShowReportModal(true);
    setDropDownValue(value);
  };
  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts && userNameOrId === user.userName) {
      if (scrollPosition === null
        || scrollPosition?.position === 0
        || posts.length >= scrollPosition?.data?.length
        || posts.length === 0
      ) {
        setLoadingPosts(true);
        getProfilePosts(
          user._id,
          posts.length > 0 ? posts[posts.length - 1]._id : undefined,
        ).then((res) => {
          const newPosts = res.data.map((data: any) => (
            {
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
            }
          ));
          setPosts((prev: Post[]) => [
            ...prev,
            ...newPosts,
          ]);
          if (res.data.length === 0) { setNoMoreData(true); }
          if (scrollPosition?.pathname === location.pathname
            && scrollPosition?.position >= window.pageYOffset) {
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
    requestAdditionalPosts, loadingPosts, loginUserId, userNameOrId, user._id, user.userName,
    posts, scrollPosition, location, dispatch,
  ]);
  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        posts.length === 0
          ? 'No posts available'
          : 'No more posts'
      }
    </p>
  );

  const callLatestFeedPost = useCallback(() => {
    if (user) {
      getProfilePosts(user._id).then((res) => {
        const newPosts = res.data.map((data: any) => ({
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
        }));
        setPosts(newPosts);
      });
    }
  }, [user]);
  const onUpdatePost = (message: string, images: string[], imageDelete: string[] | undefined) => {
    updateFeedPost(postId, message, images, imageDelete).then(() => {
      setShowReportModal(false);
      const updatePost = posts.map((post: any) => {
        if (post._id === postId) {
          return {
            ...post, content: message,
          };
        }
        return post;
      });
      setPosts(updatePost);
    })
      .catch((error) => {
        setEditModalErrorMessage(error.response.data.message);
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
      if (res.status === 200) { callLatestFeedPost(); }
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
    <div>
      <ProfileHeader tabKey="posts" user={user} />
      {loginUserData.userName === user.userName
        && (
          <div className="my-4">
            <CustomCreatePost />
          </div>
        )}
      <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
      <InfiniteScroll
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
              onLikeClick={onLikeClick}
              onSelect={persistScrollPosition}
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
      {dropDownValue === 'Edit'
        && (
          <EditPostModal
            show={showReportModal}
            errorMessage={editModalErrorMessage}
            setShow={setShowReportModal}
            setPostContent={setPostContent}
            postContent={postContent}
            onUpdatePost={onUpdatePost}
            postImages={postImages}
            setPostImages={setPostImages}
            deleteImageIds={deleteImageIds}
            setDeleteImageIds={setDeleteImageIds}
          />
        )}
    </div>
  );
}
export default ProfilePosts;
