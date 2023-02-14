import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import RoundButton from '../../../components/ui/RoundButton';
import SocialGroupsHeader from '../SocialGroupsHeader';
import { homePost } from '../GroupsData';
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
  const handleResponsivePopoverOptions = () => {
    /* eslint-disable react-hooks/rules-of-hooks */
    const smallScreen = useMediaQuery({ query: `(max-width: ${MD_MEDIA_BREAKPOINT})` });
    const mediumScreen = useMediaQuery({ query: `(min-width: ${MD_MEDIA_BREAKPOINT})` })
      && useMediaQuery({ query: `(max-width: ${LG_MEDIA_BREAKPOINT})` });
    const largeScreen = useMediaQuery({ query: `(min-width: ${LG_MEDIA_BREAKPOINT})` })
      && useMediaQuery({ query: `(max-width: ${XL_MEDIA_BREAKPOINT})` });
    const xLargeScreen = useMediaQuery({ query: `(min-width: ${XL_MEDIA_BREAKPOINT})` });

    if (smallScreen) {
      return smallScreenGroupHomPopoverOptions;
    } if (mediumScreen) {
      return popoverOptions;
    } if (largeScreen) {
      return smallScreenGroupHomPopoverOptions;
    } if (xLargeScreen) {
      return popoverOptions;
    }
    return null;
  };
  const options = handleResponsivePopoverOptions();
  const applyFilter = () => sortVal && key;
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
        sort={(e: React.ChangeEvent<HTMLSelectElement>) => setSortVal(e.target.value)}
        selectedKey={(keyValue: string) => setKey(keyValue)}
        applyFilter={applyFilter}
        groupHomePosts
        key={key}
        clearKeyHandler={clearKeyHandler}
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
          groupHomePosts
          popoverOptions={options!}
          isCommentSection={false}
          onPopoverClick={handlePopoverOption}
        />
      </div>
    </div>
  );
}

export default GroupsHome;
