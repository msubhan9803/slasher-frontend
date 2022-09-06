import React, { useEffect, useState } from 'react';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
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
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
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

  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };
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
        onPopoverClick={handlePopoverOption}
      />
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}

export default SearchPosts;
