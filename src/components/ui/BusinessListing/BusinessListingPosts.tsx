/* eslint-disable max-lines */
import React, { useCallback, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { useLocation } from 'react-router-dom';
import {
  ContentDescription, FriendRequestReaction, FriendType, ProfileSubroutesCache,
} from '../../../types';
import { createBlockUser } from '../../../api/blocks';
import { unlikeFeedPost, likeFeedPost } from '../../../api/feed-likes';
import { deleteFeedPost, updateFeedPost } from '../../../api/feed-posts';
import { reportData } from '../../../api/report';
import useListingDetail from '../../../hooks/businessListing/useListingDetail';
import useListingPosts from '../../../hooks/businessListing/useListingPosts';
import { setPageStateCache } from '../../../pageStateCache';
import { setProfilePageUserDetailsReload } from '../../../redux/slices/userSlice';
import { getProfileSubroutesCache } from '../../../routes/profile/profileSubRoutesCacheUtils';
import { formatNumberWithUnits } from '../../../utils/number.utils';
import CustomCreatePost from '../CustomCreatePost';
import { PopoverClickProps } from '../CustomPopover';
import ErrorMessageList from '../ErrorMessageList';
import FriendshipStatusModal from '../friendShipCheckModal';
import LoadingIndicator from '../LoadingIndicator';
import EditPostModal from '../post/EditPostModal';
import PostFeed from '../post/PostFeed/PostFeed';
import ProfileTabContent from '../profile/ProfileTabContent';
import useProgressButton from '../ProgressButton';
import ReportModal from '../ReportModal';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';

type Props = {
  businessListingRef: string;
};

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user'];

export default function BusinessListingPosts({ businessListingRef }: Props) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const loginUserData = useAppSelector((state) => state.user.user);
  const [showReportModal, setShowReportModal] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [editModalErrorMessage, setEditModalErrorMessage] = useState<string[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<any>([]);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [postContent, setPostContent] = useState<string>('');
  const [postImages, setPostImages] = useState<string[]>([]);
  const [postId, setPostId] = useState<string>('');
  const [postUserId, setPostUserId] = useState<string>('');
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const [friendShipStatusModal, setFriendShipStatusModal] = useState<boolean>(false);
  const [friendStatus, setFriendStatus] = useState<FriendRequestReaction | null>(null);
  const [friendData, setFriendData] = useState<FriendType>(null);

  const {
    posts,
    setPosts,
    loadingListingPosts,
    listingPostsError,
    refetchListingPosts,
  } = useListingPosts({ businessListingRef });

  const {
    listingDetail,
    loadingListingDetail,
    listingDetailError,
  } = useListingDetail(businessListingRef as string);

  const postsCountWithLabel = `Posts: ${formatNumberWithUnits(posts.length)}`;

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

  const handlePostDislike = useCallback((feedPostId: string) => {
    setPosts((prevPosts) => prevPosts.map(
      (prevPost) => {
        if (prevPost._id === feedPostId) {
          return {
            ...prevPost,
            likeIcon: false,
            likedByUser: false,
            likeCount: prevPost.likeCount - 1,
          };
        }
        return prevPost;
      },
    ));
  }, []);

  const handlePostLike = useCallback((feedPostId: string) => {
    setPosts((prevPosts) => prevPosts.map((prevPost) => {
      if (prevPost._id === feedPostId) {
        return {
          ...prevPost,
          likeIcon: true,
          likedByUser: true,
          likeCount: prevPost.likeCount + 1,
        };
      }
      return prevPost;
    }));
  }, []);

  const persistScrollPosition = () => {
    setPageStateCache<ProfileSubroutesCache>(location, {
      ...getProfileSubroutesCache(location),
      profilePosts: posts,
    });
  };

  const onLikeClick = useCallback(async (feedPostId: string) => {
    const checkLike = posts.some((post) => post.id === feedPostId
        && post.likeIcon);

    // Dislike/Like optimistically
    if (checkLike) {
      handlePostDislike(feedPostId);
    } else {
      handlePostLike(feedPostId);
    }

    const revertOptimisticUpdate = () => {
      if (checkLike) {
        handlePostLike(feedPostId);
      } else {
        handlePostDislike(feedPostId);
      }
    };

    const handleLikeAndUnlikeFeedPost = async () => {
      try {
        if (checkLike) {
          await unlikeFeedPost(feedPostId);
        } else {
          await likeFeedPost(feedPostId);
        }
      } catch (error: any) {
        revertOptimisticUpdate();
        if (error.response.status === 403) {
          // checkFriendShipStatus(selectedFeedPostUserId!);
        }
      }
    };

    handleLikeAndUnlikeFeedPost();
  }, [handlePostDislike, handlePostLike, posts]);

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
          posts.length === 0
            ? 'No posts available'
            : 'No more posts'
        }
    </p>
  );

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

  const onBlockYesClick = () => {
    setProgressButtonStatus('loading');
    createBlockUser(postUserId)
      .then(() => {
        setProgressButtonStatus('default');
        setDropDownValue('BlockUserSuccess');
        refetchListingPosts();
      })
    /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
  };

  const afterBlockUser = () => {
    setShowReportModal(false);
  };

  const reportProfilePost = (reason: string) => {
    setProgressButtonStatus('loading');
    const reportPayload = {
      targetId: postId!,
      reason,
      reportType: 'post',
    };
    reportData(reportPayload).then((res) => {
      if (res) {
        refetchListingPosts();
        setProgressButtonStatus('default');
      }
    })
    /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
    setDropDownValue('PostReportSuccessDialog');
  };

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
      refetchListingPosts();
    })
      .catch((error) => {
        setProgressButtonStatus('failure');
        const msg = error.response.status === 0 && !error.response.data
          ? 'Combined size of files is too large.'
          : error.response.data.message;
        setEditModalErrorMessage(msg);
      });
  };

  return (
    <>
      <div className="ms-3 fs-4 fw-bold my-3">{postsCountWithLabel}</div>

      <ProfileTabContent>
        {listingDetail && loginUserData.userName === listingDetail.userRef?.userName
            && (
              <div className="mb-4 mt-1">
                <CustomCreatePost />
              </div>
            )}

        <ErrorMessageList errorMessages={listingDetailError ? [listingDetailError] : []} divClass="mt-3 text-start" className="m-0" />

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

        {loadingListingPosts && <LoadingIndicator />}

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

        {friendShipStatusModal && !loginUserData.ignoreFriendSuggestionDialog && (
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
    </>
  );
}
