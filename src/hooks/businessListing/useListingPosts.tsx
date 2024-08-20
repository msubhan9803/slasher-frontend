import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getBusinessListingPosts } from '../../api/feed-posts';
import { Post } from '../../types';
import { getBusinessListingSubroutesCache } from '../../routes/business-listings/businessListingSubroutesCache';
import { deletedPostsCache } from '../../pageStateCache';

const removeDeletedPost = (post: any) => !deletedPostsCache.has(post._id);

export default function useListingPosts() {
  const params = useParams();
  const location = useLocation();
  const businessListingSubRoutesCache = getBusinessListingSubroutesCache(location);
  const [posts, setPosts] = useState<Post[]>(
    businessListingSubRoutesCache?.listingPosts?.filter(removeDeletedPost) || [],
  );
  const [loadingListingPosts, setLoadingListingPosts] = useState<boolean>(true);
  const [listingPostsError, setListingPostsError] = useState<string | null>(null);

  const fetchBusinessListingPosts = async () => {
    setLoadingListingPosts(true);
    setListingPostsError(null);

    try {
      const res = await getBusinessListingPosts(
        params.id as string,
        posts.length > 0 ? posts[posts.length - 1]._id : undefined,
      );

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
          bookId: data?.bookId,
          hashtags: data.hashtags,
          postType: data.postType,
          businessListingRef: data.businessListingRef,
        }
      ));

      setPosts(newPosts);
    } catch (err: any) {
      setListingPostsError('Failed to fetch listings');
    } finally {
      setLoadingListingPosts(false);
    }
  };

  useEffect(() => {
    fetchBusinessListingPosts();
  }, []);

  return {
    posts,
    setPosts,
    loadingListingPosts,
    listingPostsError,
    refetchListingPosts: fetchBusinessListingPosts,
  };
}
