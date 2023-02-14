import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Row, Col } from 'react-bootstrap';
import FilterModal from '../../components/filter-sort/FilterModal';
import FilterOptions from '../../components/filter-sort/FilterOptions';
import SortData from '../../components/filter-sort/SortData';
import CustomSearchInput from '../../components/ui/CustomSearchInput';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';
import SocialGroupListCard from '../../components/ui/SocialGroupListCard';

interface GroupsHeaderProps {
  tabKey: string;
  showKeys: boolean;
  setShowKeys: React.Dispatch<React.SetStateAction<boolean>>;
  setSearch: React.Dispatch<string>;
  search: string;
  sort?(e: React.ChangeEvent<HTMLSelectElement>): void | undefined;
  selectedKey?(e: string): void;
  applyFilter?(): void;
  groupHomePosts?: boolean;
  key?: string;
  clearKeyHandler?(): void;
  data?: any;
}
const tabs = [
  { value: 'home', label: 'Groups home' },
  { value: 'groups-list', label: 'Groups list' },
  { value: 'my-groups', label: 'My groups' },
  { value: 'watch-list', label: 'Watch list' },
  { value: 'saved', label: 'Saved' },
];
const sortoptions = [
  { value: 'recent-activity', label: 'Recent activity' },
  { value: 'most-popular', label: 'Most popular' },
  { value: 'newest', label: 'Newest' },
];

function SocialGroupsHeader({
  tabKey, showKeys, setShowKeys, setSearch, search, sort,
  selectedKey, applyFilter, groupHomePosts, key, clearKeyHandler,
  data,
}: GroupsHeaderProps) {
  return (
    <>
      <TabLinks tabLink={tabs} toLink="/app/groups" selectedTab={tabKey} />
      {data && <SocialGroupListCard item={data} classname="mt-3" />}
      <Row className="mt-3 mb-md-3 align-items-center">
        <Col xs={groupHomePosts ? 6 : 12} md={4} className="mt-3 my-md-0 order-md-second order-md-first">
          <CustomSearchInput label="Search..." setSearch={setSearch} search={search} />
        </Col>
        <Col md={4} className="text-center d-none d-md-inline">
          <FilterOptions buttonClass={`${key !== '' ? 'text-primary' : 'text-white'}`} setShowKeys={setShowKeys} showKeys={showKeys} showSort={groupHomePosts} />
        </Col>
        <Col xs={groupHomePosts ? 6 : 12} md={4} className={`${groupHomePosts ? 'mt-3 mt-md-0 d-block order-second order-md-third' : 'd-none d-lg-block'}`}>
          <SortData onSelectSort={sort} sortoptions={sortoptions} title="Sort: " className="rounded-5" type="sort" />
        </Col>
        {groupHomePosts && (
          <Col className="text-center d-md-none my-3">
            <span className="d-flex align-items-center justify-content-center">
              <FilterOptions buttonClass={`${key !== '' ? 'text-primary' : 'text-white'} d-flex align-items-center`} setShowKeys={setShowKeys} showKeys={showKeys} showSort={groupHomePosts} />
              {key !== ''
                && (
                  <div className="d-flex justify-content-center">
                    <RoundButton size="sm" variant="filter" className="px-3" onClick={clearKeyHandler}>
                      {' '}
                      {key}
                      {' '}
                      <FontAwesomeIcon icon={solid('x')} size="sm" />
                    </RoundButton>
                  </div>
                )}
            </span>

          </Col>
        )}
      </Row>
      {
        showKeys
        && (
          <FilterModal
            showKeys={showKeys}
            setShowKeys={setShowKeys}
            selectedKey={selectedKey}
            applyFilter={applyFilter}
            sortoptions={sortoptions}
            onSelectSort={sort}
            groupHomePosts={groupHomePosts}
          />
        )
      }
    </>
  );
}

SocialGroupsHeader.defaultProps = {
  sort: undefined,
  selectedKey: null,
  applyFilter: null,
  groupHomePosts: false,
  key: '',
  clearKeyHandler: undefined,
  data: undefined,
};

export default SocialGroupsHeader;
