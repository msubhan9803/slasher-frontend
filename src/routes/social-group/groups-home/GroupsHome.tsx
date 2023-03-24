import React, { useState, useEffect } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import RoundButton from '../../../components/ui/RoundButton';
import SocialGroupsHeader from '../SocialGroupsHeader';
import { homePost } from '../SocialGroupListItem';
import {
  LG_MEDIA_BREAKPOINT, MD_MEDIA_BREAKPOINT, XL_MEDIA_BREAKPOINT,
} from '../../../constants';

const popoverOptions = ['Hide post', 'Report post'];
const smallScreenGroupHomPopoverOptions = ['Follow post', 'Unsaved post', 'Hide post', 'Report post'];
function GroupsHome() {
  const [search, setSearch] = useState<string>('');
  const [showKeys, setShowKeys] = useState(false);
  const [sortVal, setSortVal] = useState<string>('recent-activity');
  const [key, setKey] = useState<string>('');
  const [postsType, setPostsType] = useState('all-groups');
  const posts = homePost;
  const [smallScreen, setSmallScreen] = useState(false);
  const [mediumScreen, setMediumScreen] = useState(false);
  const [largeScreen, setLargeScreen] = useState(false);
  const [xLargeScreen, setXLargeScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setSmallScreen(window.matchMedia(`(max-width: ${MD_MEDIA_BREAKPOINT})`).matches);
      setMediumScreen(window.matchMedia(`(min-width: ${MD_MEDIA_BREAKPOINT}) and (max-width: ${LG_MEDIA_BREAKPOINT})`).matches);
      setLargeScreen(window.matchMedia(`(min-width: ${LG_MEDIA_BREAKPOINT}) and (max-width: ${XL_MEDIA_BREAKPOINT})`).matches);
      setXLargeScreen(window.matchMedia(`(min-width: ${XL_MEDIA_BREAKPOINT})`).matches);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleResponsivePopoverOptions = () => {
    if (smallScreen) {
      return smallScreenGroupHomPopoverOptions;
    } if (mediumScreen) {
      return popoverOptions;
    } if (largeScreen) {
      return smallScreenGroupHomPopoverOptions;
    } if (xLargeScreen) {
      return popoverOptions;
    }
    return popoverOptions;
  };
  const options = handleResponsivePopoverOptions();
  const applyFilter = (keyValue: string, sortValue?: string) => {
    setKey(keyValue.toLowerCase());
    if (sortValue) { setSortVal(sortValue); }
  };
  const handlePopoverOption = () => null;
  const clearKeyHandler = () => {
    setKey('');
  };
  return (
    <div>
      <SocialGroupsHeader
        tabKey="home"
        showKeys={showKeys}
        setShowKeys={setShowKeys}
        setSearch={setSearch}
        search={search}
        sort={(value: string) => setSortVal(value)}
        selectedKey={key}
        applyFilter={applyFilter}
        postType="group-post"
        clearKeyHandler={clearKeyHandler}
        sortVal={sortVal}
      />
      {key !== ''
        && (
          <div className="w-100 d-none d-md-flex d-lg-none d-xl-flex justify-content-center mb-3">
            <RoundButton size="sm" variant="filter" className="px-3" onClick={clearKeyHandler}>
              {' '}
              {key}
              {' '}
              <FontAwesomeIcon icon={solid('x')} size="sm" />
            </RoundButton>
          </div>
        )}
      <div className="d-block d-md-flex d-lg-block d-xl-flex align-items-center px-3">
        <p className="m-0 text-center">Select where you want to see posts from:</p>
        <div className="d-flex align-items-center justify-content-center mt-3 mt-md-0 mt-lg-3 mt-xl-0">
          <RoundButton
            size="sm"
            variant="form"
            name="all-groups"
            className={`${postsType === 'all-groups' ? 'text-black' : 'text-white'} py-2 px-4 mx-2`}
            active={postsType === 'all-groups'}
            onClick={(e: any) => setPostsType((e.target as HTMLButtonElement).name)}
          >
            All groups
          </RoundButton>
          <RoundButton
            variant="form"
            size="sm"
            name="your-groups"
            className={`${postsType === 'your-groups' ? 'text-black' : 'text-white'} py-2 px-4`}
            active={postsType === 'your-groups'}
            onClick={(e: any) => setPostsType((e.target as HTMLButtonElement).name)}
          >
            Your groups
          </RoundButton>
        </div>
      </div>
      <div className="mt-3">
        <PostFeed
          postFeedData={posts}
          postType="group"
          popoverOptions={options!}
          isCommentSection={false}
          onPopoverClick={handlePopoverOption}
        />
      </div>
    </div>
  );
}

export default GroupsHome;
