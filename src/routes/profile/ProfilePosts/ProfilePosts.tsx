/* eslint-disable max-lines */
import React, { useCallback, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useLocation, useParams } from 'react-router-dom';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import ProfileHeader from '../ProfileHeader';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import ReportModal from '../../../components/ui/ReportModal';
import { getProfilePosts } from '../../../api/users';
import { User, Post, ContentDescription } from '../../../types';
import { deleteFeedPost, updateFeedPost } from '../../../api/feed-posts';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { likeFeedPost, unlikeFeedPost } from '../../../api/feed-likes';
import { createBlockUser } from '../../../api/blocks';
import { reportData } from '../../../api/report';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import EditPostModal from '../../../components/ui/post/EditPostModal';
import ProfileTabContent from '../../../components/ui/profile/ProfileTabContent';
import {
  deletePageStateCache, deletedPostsCache, getPageStateCache, hasPageStateCache, setPageStateCache,
} from '../../../pageStateCache';
import useProgressButton from '../../../components/ui/ProgressButton';
import { sleep } from '../../../utils/timer-utils';

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user'];

interface Props {
  user: User
}
const removeDeletedPost = (post: any) => !deletedPostsCache.has(post._id);

const staticHashTags = ['horrorday', 'horrorcommunity', 'slasher', 'horror'];

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
  const userId = useAppSelector((state) => state.user.user.id);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const pageStateCache = (getPageStateCache(location) ?? []).filter(removeDeletedPost);
  const [posts, setPosts] = useState<Post[]>(
    hasPageStateCache(location)
      ? pageStateCache : [],
  );
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const { userName: userNameOrId } = useParams<string>();
  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
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
    setShowReportModal(true);
    setDropDownValue(value);
  };
  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts && userNameOrId === user.userName) {
      if (hasPageStateCache(location)
        || posts.length >= pageStateCache?.length
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
              message: data.message,
              images: data.images,
              userName: data.userId.userName,
              profileImage: data.userId.profilePic,
              userId: data.userId._id,
              likeIcon: data.likedByUser,
              likeCount: data.likeCount,
              commentCount: data.commentCount,
              hashTag: staticHashTags,
            }
          ));
          setPosts((prev: Post[]) => [
            ...prev,
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
          () => { setRequestAdditionalPosts(false); setLoadingPosts(false); },
        );
      }
    }
  }, [requestAdditionalPosts, loadingPosts, userId, userNameOrId, user._id,
    user.userName, posts, location, dispatch, pageStateCache.length,
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
          message: data.message,
          images: data.images,
          userName: data.userId.userName,
          profileImage: data.userId.profilePic,
          userId: data.userId._id,
          likeIcon: data.likedByUser,
          likeCount: data.likeCount,
          commentCount: data.commentCount,
          hashTag: staticHashTags,
        }));
        setPosts(newPosts);
      });
    }
  }, [user]);
  const onUpdatePost = (
    message: string,
    images: string[],
    imageDelete: string[] | undefined,
    descriptionArray?: ContentDescription[],
  ) => {
    setProgressButtonStatus('loading');
    updateFeedPost(postId, message, images, imageDelete, null, descriptionArray).then(async () => {
      setProgressButtonStatus('success');
      await sleep(1000);
      setShowReportModal(false);
      const updatePost = posts.map((post: any) => {
        if (post._id === postId) {
          return {
            ...post, message,
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
        setEditModalErrorMessage(msg);
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

  const persistScrollPosition = () => { setPageStateCache(location, posts); };

  return (
    <div>
      <ProfileHeader tabKey="posts" user={user} />
      <ProfileTabContent>
        {loginUserData.userName === user.userName
          && (
            <div className="my-4">
              <CustomCreatePost />
            </div>
          )}
        <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
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
              ProgressButton={ProgressButton}
            />
          )}
      </ProfileTabContent>
    </div>
  );
}
export default ProfilePosts;
