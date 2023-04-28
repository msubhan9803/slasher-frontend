import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
import { Post } from '../../../types';
import SearchHeader from '../SearchHeader';
import { posts } from '../SearchResult';
import { getHashtagPostList } from '../../../api/feed-posts';
import { unlikeFeedPost, likeFeedPost } from '../../../api/feed-likes';

const popoverOptions = ['Report'];

function SearchPosts() {
  const [search, setSearch] = useState<string>('');
  const [searchPosts, setSearchPosts] = useState<Post[]>([]);
  const [show, setShow] = useState(false);
  const [query, setQueryParam] = useState<any>();
  const [dropDownValue, setDropDownValue] = useState('');
  const location = useLocation();
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const hashtag = urlParams.get('hashtag');
    setQueryParam(hashtag);
  }, [location.search]);

  const getSearchPost = useCallback(() => {
    if (query) {
      getHashtagPostList(query).then((res) => {
        const postData = query ? res.data : posts;
        const newPosts: any = postData.map((data: any) => {
          const setPost = {
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
          };
          return setPost;
        });
        setSearchPosts(newPosts);
      });
    }
  }, [query]);

  const searchData = useCallback(() => {
    let searchResult: any;
    const newFilter = posts;
    if (search.length > 0) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: any) => src.userName.toLowerCase().includes(search))
        : [];
      setSearchPosts(searchResult);
    } else {
      getSearchPost();
    }
  }, [search, getSearchPost]);
  useEffect(() => {
    searchData();
  }, [search, searchData]);

  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };

  const onLikeClick = (feedPostId: string) => {
    const checkLike = searchPosts.some((post) => post.id === feedPostId
      && post.likeIcon);
    if (checkLike) {
      unlikeFeedPost(feedPostId).then((res) => {
        if (res.status === 200) {
          const unLikePostData = searchPosts.map(
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
          setSearchPosts(unLikePostData);
        }
      });
    } else {
      likeFeedPost(feedPostId).then((res) => {
        if (res.status === 201) {
          const likePostData = searchPosts.map((likePost: Post) => {
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
          setSearchPosts(likePostData);
        }
      });
    }
  };
  return (
    <div>
      <SearchHeader
        tabKey="posts"
        setSearch={setSearch}
        search={search}
      />
      <PostFeed
        postFeedData={searchPosts}
        popoverOptions={popoverOptions}
        isCommentSection={false}
        onPopoverClick={handlePopoverOption}
        onLikeClick={onLikeClick}
      />
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </div>
  );
}

export default SearchPosts;
