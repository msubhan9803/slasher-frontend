import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Row, Col } from 'react-bootstrap';
import FilterModal from '../../components/filter-sort/FilterModal';
import FilterOptions from '../../components/filter-sort/FilterOptions';
import CustomSelect from '../../components/filter-sort/CustomSelect';
import CustomSearchInput from '../../components/ui/CustomSearchInput';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';
import SocialGroupListCard from '../../components/ui/SocialGroupListCard';

interface GroupsHeaderProps {
  tabKey: string;
  showKeys?: boolean;
  setShowKeys?: React.Dispatch<React.SetStateAction<boolean>>;
  setSearch: React.Dispatch<string>;
  search: string;
  sort?(e: string): void | undefined;
  selectedKey?: string;
  applyFilter?(keyValue: string, sortValue?: string): void;
  postType?: string;
  clearKeyHandler?(): void;
  noFilter?: boolean;
  sortVal?: string;
  data?: any;
}
const tabs = [
  { value: 'home', label: 'Groups home' },
  { value: 'all', label: 'Groups list' },
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
  selectedKey, applyFilter, postType, clearKeyHandler,
  noFilter, sortVal, data,
}: GroupsHeaderProps) {
  return (
    <>
      <TabLinks tabLink={tabs} toLink="/app/groups" selectedTab={tabKey} />
      {data && <SocialGroupListCard item={data} classname="mt-3" />}
      <Row className="mt-3 mb-md-3 align-items-center justify-content-between">
        <Col xs={noFilter || postType === 'group-post' ? 6 : 12} md={4} className="mt-3 my-md-0 order-md-second order-md-first">
          <CustomSearchInput label="Search..." setSearch={setSearch} search={search} />
        </Col>
        {!noFilter && (
          <Col md={4} className="text-center d-none d-md-inline">
            <FilterOptions
              setShowKeys={setShowKeys!}
              showKeys={showKeys!}
              showSort={postType === 'group-post'}
              activeKey={!!(selectedKey && selectedKey.length > 0)}
            />
          </Col>
        )}
        <Col xs={noFilter || postType === 'group-post' ? 6 : 12} md={4} className={`${noFilter || postType === 'group-post' ? 'mt-3 mt-md-0 d-block order-second order-md-third' : 'd-none d-lg-block'}`}>
          <CustomSelect value={sortVal} onChange={sort} options={sortoptions} type="sort" />
        </Col>
        {!noFilter && postType === 'group-post' && (
          <Col className="text-center d-md-none my-3">
            <span className="d-flex align-items-center justify-content-center">
              <FilterOptions
                setShowKeys={setShowKeys!}
                showKeys={showKeys!}
                showSort={postType === 'group-post'}
                activeKey={!!(selectedKey && selectedKey.length > 0)}
              />
              {selectedKey !== ''
                && (
                  <div className="d-flex justify-content-center">
                    <RoundButton size="sm" variant="filter" className="px-3" onClick={clearKeyHandler}>
                      {' '}
                      {selectedKey}
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
            setShowKeys={setShowKeys!}
            selectedKey={selectedKey}
            applyFilter={applyFilter}
            sortoptions={sortoptions}
            postType={postType}
            sortVal={sortVal}
          />
        )
      }
    </>
  );
}

SocialGroupsHeader.defaultProps = {
  sort: undefined,
  setShowKeys: undefined,
  showKeys: false,
  selectedKey: null,
  applyFilter: null,
  postType: false,
  clearKeyHandler: undefined,
  noFilter: false,
  sortVal: '',
  data: undefined,
};

export default SocialGroupsHeader;
