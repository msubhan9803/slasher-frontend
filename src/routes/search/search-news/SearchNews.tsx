import React, { useCallback, useEffect, useState } from 'react';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
import SearchHeader from '../SearchHeader';
import { news } from '../SearchResult';

interface SearchNewsProps {
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
function SearchNews() {
  const [search, setSearch] = useState<string>('');
  const [searchNews, setSearchNews] = useState<SearchNewsProps[]>(news);
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const searchData = useCallback(() => {
    let searchResult;
    const newFilter = news;
    if (search) {
      searchResult = newFilter && newFilter.length > 0
        ? newFilter.filter((src: SearchNewsProps) => src.userName.toLowerCase().includes(search))
        : [];
      setSearchNews(searchResult);
    } else {
      setSearchNews(news);
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
        tabKey="news"
        setSearch={setSearch}
        search={search}
      />
      <PostFeed
        postFeedData={searchNews}
        popoverOptions={popoverOptions}
        isCommentSection={false}
        onPopoverClick={handlePopoverOption}
      />
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </div>
  );
}

export default SearchNews;
