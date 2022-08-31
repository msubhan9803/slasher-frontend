import React, { useEffect, useState } from 'react';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import SearchHeader from '../SearchHeader';
import { posts } from '../SearchResult';

interface SearchPostsProps {
  id: number;
  profileImage: string;
  userName: string;
  postUrl: string;
  postDate: string;
  content: string;
  hashTag: string[];
  likeIcon: boolean;
}
const popoverOptions = ['Report'];
function SearchPosts() {
  const [search, setSearch] = useState<string>('');
  const [searchPosts, setSearchPosts] = useState<SearchPostsProps[]>(posts);
  const searchData = () => {
    let searchResult;
    const newFilter = posts;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: SearchPostsProps) => src.userName.toLowerCase().includes(search))
        : [];
      setSearchPosts(searchResult);
    } else {
      setSearchPosts(posts);
    }
  };
  useEffect(() => {
    searchData();
  }, [search]);
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <SearchHeader
        tabKey="posts"
        setSearch={setSearch}
        search={search}
      />
      <PostFeed
        postFeedData={searchPosts}
        popoverOptions={popoverOptions}
        isCommentSection={false}
      />
    </AuthenticatedPageWrapper>
  );
}

export default SearchPosts;
