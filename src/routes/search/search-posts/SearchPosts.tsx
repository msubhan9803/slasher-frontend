import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
import { Post } from '../../../types';
import SearchHeader from '../SearchHeader';
import { hashTagPosts, posts } from '../SearchResult';
import FormatImageVideoList from '../../../utils/video-utils';

interface SearchPostsProps {
  id: number;
  profileImage: string;
  userName: string;
  postUrl: string;
  postDate: string;
  message: string;
  hashTag: string[];
  likeIcon: boolean;
}
const popoverOptions = ['Report'];

function SearchPosts() {
  const [search, setSearch] = useState<string>('');
  const [searchPosts, setSearchPosts] = useState<Post[]>([]);
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const location = useLocation();
  const query = location.search.substring(1);
  const getSearchPost = useCallback(() => {
    const postData = query ? hashTagPosts : posts;
    const newPosts: any = postData.map((data: any) => {
      const setPost = {
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
        hashTag: data.hashTag,
      };
      return setPost;
    });
    setSearchPosts(newPosts);
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
      />
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </div>
  );
}

export default SearchPosts;
