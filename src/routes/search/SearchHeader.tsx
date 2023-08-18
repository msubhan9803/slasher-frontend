import React from 'react';
import CustomSearchInput from '../../components/ui/CustomSearchInput';
import TabLinks from '../../components/ui/Tabs/TabLinks';
import { enableDevFeatures } from '../../env';

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
  const allTabs = enableDevFeatures ? tabs : tabs.filter((t) => t.label === 'People');
  return (
    <>
      <CustomSearchInput label={label} setSearch={setSearch} search={search} />
      <div className="mt-3">
        <TabLinks display="underline" tabLink={allTabs} toLink="/app/search" selectedTab={tabKey} />
      </div>
    </>
  );
}

SearchHeader.defaultProps = {
  label: '',
};

export default SearchHeader;
