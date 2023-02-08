import React, { useCallback, useEffect, useState } from 'react';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
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
    <ContentSidbarWrapper>
      <ContentPageWrapper>
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
      </ContentPageWrapper>
      <RightSidebarWrapper className="d-none d-lg-block">
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default SearchNews;
