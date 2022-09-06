import React, { useEffect, useState } from 'react';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
import SearchHeader from '../SearchHeader';
import { news } from '../SearchResult';

interface SearchNewsProps {
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
function SearchNews() {
  const [search, setSearch] = useState<string>('');
  const [searchNews, setSearchNews] = useState<SearchNewsProps[]>(news);
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const searchData = () => {
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
    </AuthenticatedPageWrapper>
  );
}

export default SearchNews;
