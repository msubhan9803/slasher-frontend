/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useLocation, useParams } from 'react-router-dom';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import ProfileHeader from '../ProfileHeader';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import ReportModal from '../../../components/ui/ReportModal';
import { getProfilePosts } from '../../../api/users';
import {
  User, Post, ContentDescription, FriendRequestReaction, FriendType, ProfileSubroutesCache,
} from '../../../types';
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
import { deletedPostsCache, setPageStateCache } from '../../../pageStateCache';
import useProgressButton from '../../../components/ui/ProgressButton';
import FriendshipStatusModal from '../../../components/ui/friendShipCheckModal';
import { friendship } from '../../../api/friends';
import { getProfileSubroutesCache } from '../profileSubRoutesCacheUtils';
import { formatNumberWithUnits } from '../../../utils/number.utils';
import { setProfilePageUserDetailsReload } from '../../../redux/slices/userSlice';

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
  const profileSubRoutesCache = getProfileSubroutesCache(location);
  const [posts, setPosts] = useState<Post[]>(
    profileSubRoutesCache?.profilePosts?.filter(removeDeletedPost) || [],
  );
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const [friendStatus, setFriendStatus] = useState<FriendRequestReaction | null>(null);
  const [friendData, setFriendData] = useState<FriendType>(null);
  const [friendShipStatusModal, setFriendShipStatusModal] = useState<boolean>(false);
  const { userName: userNameOrId } = useParams<string>();
  const lastUserIdRef = useRef(user._id);
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

  const afterBlockUser = () => {
    setShowReportModal(false);
  };

  const fetchPosts = useCallback(() => {
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
          movieId: data.movieId,
          hashTag: staticHashTags,
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
  }, [posts, user._id]);

  useEffect(() => {
    const isUserChanged = lastUserIdRef.current !== user._id;
    if (isUserChanged) {
      // SD-1427: Fixed the bug: All `profilePosts` of current profile
      // are show on the any user's profilePosts when clicked on `ProfileLink`
      // of any user // on LikeShare modal. For example - when you're on a page say
      // `/slasher-test-user1/posts` and you open `LikeShareModal` by clicking on
      // `NumberOfLikes` and in the modal you click on any user's profile link.
      lastUserIdRef.current = user._id;
      // Cancel setting state for most recent friendList api call
      // if (controllerRef.current) { controllerRef.current.abort(); }
      // TODO: Incorporate below logic into `fetchPosts(true)` .... (refere - `ProfileFriends` file)
      // Set the new user's data in comoponent state
      setPosts(getProfileSubroutesCache(location)?.profilePosts || []);
      // Reset infinite-loading
      setNoMoreData(false);
      setRequestAdditionalPosts(true);
    }

    if (requestAdditionalPosts && !loadingPosts && userNameOrId === user.userName) {
      fetchPosts();
    }
  }, [requestAdditionalPosts, loadingPosts, userId, userNameOrId, user._id, user.userName,
    posts, location, dispatch, fetchPosts]);

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
      setProgressButtonStatus('default');
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
  const deletePostClickAsync = async () => {
    setProgressButtonStatus('loading');
    return deleteFeedPost(postId)
      .then(async () => {
        setProgressButtonStatus('default');
        setPosts((prevPosts) => prevPosts.filter(((post) => post._id !== postId)));
        dispatch(setProfilePageUserDetailsReload(true));
      })

      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };

  const checkFriendShipStatus = (selectedFeedPostId: string) => new Promise<void>(
    (resolve, reject) => {
      if (userId === selectedFeedPostId) {
        resolve();
      } else {
        friendship(selectedFeedPostId).then((res) => {
          if (res.data.reaction === FriendRequestReaction.Accepted) {
            resolve();
          } else {
            setPostUserId(selectedFeedPostId);
            setFriendShipStatusModal(true);
            setFriendData(res.data);
            setFriendStatus(res.data.reaction);
          }
        }).catch(() => reject());
      }
    },
  );

  const onLikeClick = async (feedPostId: string) => {
    const checkLike = posts.some((post) => post.id === feedPostId
      && post.likeIcon);

    const selectedFeedPostId = posts.find((post) => post.id === feedPostId)?.userId;

    await checkFriendShipStatus(selectedFeedPostId!).then(() => {
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
          if (res.status === 201 && res.data.isFriend === false) {
            setFriendShipStatusModal(true);
          }
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
        }).catch((err) => {
          if (err.response.status === 403) {
            setFriendShipStatusModal(true);
          }
        });
      }
    }).catch(() => { });
  };

  const onBlockYesClick = () => {
    setProgressButtonStatus('loading');
    createBlockUser(postUserId)
      .then(() => {
        setProgressButtonStatus('default');
        setDropDownValue('BlockUserSuccess');
        callLatestFeedPost();
      })
      /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
  };

  const reportProfilePost = (reason: string) => {
    setProgressButtonStatus('loading');
    const reportPayload = {
      targetId: postId!,
      reason,
      reportType: 'post',
    };
    reportData(reportPayload).then((res) => {
      if (res) { callLatestFeedPost(); setProgressButtonStatus('default'); }
    })
      /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
    setDropDownValue('PostReportSuccessDialog');
  };

  const persistScrollPosition = () => {
    setPageStateCache<ProfileSubroutesCache>(location, {
      ...getProfileSubroutesCache(location),
      profilePosts: posts,
    });
  };

  const postsCountWithLabel = `Posts: ${formatNumberWithUnits(user.postsCount)}`;

  return (
    <div>
      <ProfileHeader tabKey="posts" user={user} />
      <div className="ms-3 fs-4 fw-bold my-3">{postsCountWithLabel}</div>
      <ProfileTabContent>
        {loginUserData.userName === user.userName
          && (
            <div className="mb-4 mt-1">
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
        {['Block user', 'Report', 'Delete', 'PostReportSuccessDialog', 'BlockUserSuccess'].includes(dropDownValue)
          && (
            <ReportModal
              onConfirmClickAsync={deletePostClickAsync}
              show={showReportModal}
              setShow={setShowReportModal}
              slectedDropdownValue={dropDownValue}
              onBlockYesClick={onBlockYesClick}
              afterBlockUser={afterBlockUser}
              handleReport={reportProfilePost}
              ProgressButton={ProgressButton}
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

        {friendShipStatusModal && (
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
      </ProfileTabContent>
    </div>
  );
}
export default ProfilePosts;
