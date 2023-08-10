import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Row } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import BorderButton from '../../components/ui/BorderButton';
import CustomSearchInput from '../../components/ui/CustomSearchInput';
import TabLinks from '../../components/ui/Tabs/TabLinks';
import { enableDevFeatures } from '../../constants';
import { StyledHastagsCircle } from './component/Hashtags';
import CustomPopover from '../../components/ui/CustomPopover';
import ReportModal from '../../components/ui/ReportModal';

interface Search {
  tabKey: string;
  setSearch: (value: string) => void;
  search: string;
  label?: string;
  onOffNotificationClick?: () => void;
  followUnfollowClick?: () => void;
  following?: boolean;
  notificationToggle?: boolean;
  totalHashtagPosts?: number;
}

const tabs = [
  { value: 'people', label: 'People' },
  { value: 'posts', label: 'Posts', devOnly: true },
  { value: 'hashtags', label: 'Hashtags' },
  { value: 'news', label: 'News', devOnly: true },
  { value: 'events', label: 'Events', devOnly: true },
  { value: 'movies', label: 'Movies', devOnly: true },
  { value: 'books', label: 'Books', devOnly: true },
];

const popoverOptions = ['Report'];
function SearchHeader({
  tabKey, setSearch, search, label = '', onOffNotificationClick, followUnfollowClick,
  following, notificationToggle, totalHashtagPosts,
}: Search) {
  const allTabs = enableDevFeatures ? tabs : tabs.filter((t) => !t.devOnly);
  const location = useLocation();
  const [query, setQueryParam] = useState<any>();
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const hashtag = urlParams.get('hashtag');
    setQueryParam(hashtag);
  }, [location.search]);

  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };
  return (
    <div className={`${query ? 'bg-dark py-3 rounded' : 'bg-transparent'} mt-3 mt-lg-0`}>
      {query && query.length > 0
        ? (
          <div>
            <div className="text-end d-md-none">
              <CustomPopover
                popoverOptions={popoverOptions}
                onPopoverClick={handlePopoverOption}
              />
            </div>
            <Row className="align-items-center px-4 px-md-0">
              <Col md={8} lg={7} xl={8}>
                <span className="d-md-flex align-items-center">
                  <StyledHastagsCircle className="mx-auto ms-md-2 me-md-4 bg-black align-items-center d-flex fs-1 justify-content-around fw-light">#</StyledHastagsCircle>
                  <div className="text-center text-md-start">
                    <p className="fs-3 fw-bold mb-0">
                      #
                      {query}
                    </p>
                    <small className="text-light mb-0">
                      {totalHashtagPosts}
                      {' '}
                      posts
                    </small>
                  </div>
                </span>
              </Col>
              <Col md={4} lg={5} xl={4} className="mt-4 mt-md-0">
                <div className="d-flex align-items-center justify-content-center justify-content-md-end">
                  {following && (
                    <Button aria-label="notificatio bell" size="sm" className="me-2 pe-2" variant="link" onClick={onOffNotificationClick}>
                      <FontAwesomeIcon size="lg" className={`${notificationToggle ? 'me-1 text-success' : 'me-0 text-primary'} `} icon={notificationToggle ? regular('bell') : regular('bell-slash')} />
                      <span>{notificationToggle ? 'On' : 'Off'}</span>
                    </Button>
                  )}
                  <BorderButton
                    buttonClass={`${following ? 'text-white' : 'text-black'} py-2 w-100`}
                    variant="sm"
                    toggleBgColor={following}
                    handleClick={followUnfollowClick}
                    toggleButton
                  />
                  <div className="d-none d-md-block mx-4">
                    <CustomPopover
                      isHashtag
                      popoverOptions={popoverOptions}
                      onPopoverClick={handlePopoverOption}
                    />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        ) : (
          <>
            <span className="mt-3 mt-md-0 mb-3">
              <CustomSearchInput label={label} setSearch={setSearch} search={search} />
            </span>
            <div className="mt-3">
              <TabLinks display={query ? '' : 'underline'} tabLink={allTabs} toLink="/app/search" selectedTab={tabKey} />
            </div>
          </>
        )}
      <ReportModal
        show={show}
        setShow={setShow}
        slectedDropdownValue={dropDownValue}
      />
    </div>
  );
}

SearchHeader.defaultProps = {
  label: '',
  onOffNotificationClick: undefined,
  followUnfollowClick: undefined,
  following: false,
  notificationToggle: false,
  totalHashtagPosts: 0,
};

export default SearchHeader;
