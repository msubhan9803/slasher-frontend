import React, { useCallback, useEffect, useState } from 'react';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
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
  const searchData = useCallback(() => {
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
  }, [search]);
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
