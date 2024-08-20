import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import BusinessListingHeader from '../BusinessListingHeader';
import useListingPosts from '../../../hooks/businessListing/useListingPosts';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import { PopoverClickProps } from '../../../components/ui/CustomPopover';
import { likeFeedPost, unlikeFeedPost } from '../../../api/feed-likes';
import { ProfileSubroutesCache } from '../../../types';
import { setPageStateCache } from '../../../pageStateCache';
import { getProfileSubroutesCache } from '../../profile/profileSubRoutesCacheUtils';
import { formatNumberWithUnits } from '../../../utils/number.utils';
import ProfileTabContent from '../../../components/ui/profile/ProfileTabContent';

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user'];

export default function BusinessListingPosts() {
  const location = useLocation();
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

  const {
    posts,
    setPosts,
    loadingListingPosts,
    listingPostsError,
  } = useListingPosts();

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

  const postsCountWithLabel = `Posts: ${formatNumberWithUnits(posts.length)}`;

  useEffect(() => {
    if (posts.length === 0) {
      return;
    }
    console.log('🌺 posts: ', posts);
  }, [posts]);

  return (
    <>
      <BusinessListingHeader />
      <div className="ms-3 fs-4 fw-bold my-3">{postsCountWithLabel}</div>

      <ProfileTabContent>
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
      </ProfileTabContent>
    </>
  );
}
