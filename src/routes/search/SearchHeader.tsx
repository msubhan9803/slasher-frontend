import React from 'react';
import CustomSearchInput from '../../components/ui/CustomerSearchInput';
import TabLinks from '../../components/ui/Tabs/TabLinks';

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
  tabKey, setSearch, search,
}: any) {
  return (
    <>
      <CustomSearchInput label="Search..." setSearch={setSearch} search={search} />
      <div className="mt-3">
        <TabLinks display="underline" tabLink={tabs} toLink="/search" selectedTab={tabKey} />
      </div>
    </>
  );
}

export default SearchHeader;
