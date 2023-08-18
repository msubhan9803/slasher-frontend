import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import styled from 'styled-components';
import BorderButton from '../../components/ui/BorderButton';
import CustomSearchInput from '../../components/ui/CustomSearchInput';
import TabLinks from '../../components/ui/Tabs/TabLinks';
import { MD_MEDIA_BREAKPOINT, enableDevFeatures } from '../../constants';
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
const StyledButtonIcon = styled.div`  
  min-height:2.356rem;
  .main {
    width:25.8px;
  }
  .toggle {
    line-height: 0.625;
  }
  .res-div {
    width : 100%;
  }
  @media (min-width: ${MD_MEDIA_BREAKPOINT}) {
    .res-div {
      width : auto;
    }
  }
`;
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
            <div className="text-end d-md-none me-2">
              <CustomPopover
                popoverOptions={popoverOptions}
                onPopoverClick={handlePopoverOption}
              />
            </div>
            <div className="d-md-flex d-block align-items-center px-4 px-md-0 justify-content-between">
              <div>
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
              </div>
              <StyledButtonIcon className="d-flex align-items-center mt-3 mt-md-0 me-md-3">
                {following && (
                  <div className="main me-3">
                    <div className="text-center text-md-start d-flex flex-wrap justify-content-center align-items-center align-items-md-start">
                      <Button aria-label="notification bell" size="sm" className="p-0" variant="link" onClick={onOffNotificationClick}>
                        <FontAwesomeIcon size="lg" className={`${notificationToggle ? 'text-success' : 'text-primary'} `} icon={notificationToggle ? regular('bell') : regular('bell-slash')} />
                      </Button>
                      <p className="fs-6 text-center toggle mt-1 mb-0">{notificationToggle ? 'On' : 'Off'}</p>
                    </div>
                  </div>
                )}
                <div className="res-div">
                  <BorderButton
                    buttonClass={`${following ? 'text-white' : 'text-black'} py-2 px-5 w-100`}
                    variant="sm"
                    toggleBgColor={following}
                    handleClick={followUnfollowClick}
                    toggleButton
                  />
                </div>
                <div className="d-none d-md-block">
                  <CustomPopover
                    isHashtag
                    popoverOptions={popoverOptions}
                    onPopoverClick={handlePopoverOption}
                  />
                </div>
              </StyledButtonIcon>
            </div>
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
