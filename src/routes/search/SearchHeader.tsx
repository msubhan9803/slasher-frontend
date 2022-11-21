import React from 'react';
import CustomSearchInput from '../../components/ui/CustomerSearchInput';
import TabLinks from '../../components/ui/Tabs/TabLinks';

interface Search {
  tabKey: string;
  setSearch: (value: string) => void;
  search: string;
  label?: string;
}

const tabs = [
  { value: 'people', label: 'People' },
  { value: 'posts', label: 'Posts' },
  { value: 'hashtags', label: 'Hashtags' },
  { value: 'news', label: 'News' },
  { value: 'events', label: 'Events' },
  { value: 'movies', label: 'Movies' },
  { value: 'books', label: 'Books' },
];
function SearchHeader({
  tabKey, setSearch, search, label = '',
}: Search) {
  return (
    <>
      <CustomSearchInput label={label} setSearch={setSearch} search={search} />
      <div className="mt-3">
        <TabLinks display="underline" tabLink={tabs} toLink="/search" selectedTab={tabKey} />
      </div>
    </>
  );
}

SearchHeader.defaultProps = {
  label: '',
};

export default SearchHeader;
