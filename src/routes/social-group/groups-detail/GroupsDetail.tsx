import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import CustomCreatePost from '../../../components/ui/CustomCreatePost';
import PostFeed from '../../../components/ui/post/PostFeed/PostFeed';
import RoundButton from '../../../components/ui/RoundButton';
import { MD_MEDIA_BREAKPOINT, LG_MEDIA_BREAKPOINT, XL_MEDIA_BREAKPOINT } from '../../../constants';
import { groupDetailPost } from '../SocialGroupListItem';
import SocialGroupsHeader from '../SocialGroupsHeader';

const popoverOptions = ['Hide post', 'Report post'];
const smallScreenGroupHomPopoverOptions = ['Follow post', 'Unsaved post', 'Hide post', 'Report post'];
function GroupsDetail() {
  const [search, setSearch] = useState<string>('');
  const [showKeys, setShowKeys] = useState(false);
  const [sortVal, setSortVal] = useState<string>('recent-activity');
  const [key, setKey] = useState<string>('');
  const posts = groupDetailPost;
  const groupData = {
    _id: 'list01',
    contentHeading: 'Black Horror World',
    content: 'Horror in the world of black cinema',
    ljGroup: false,
    pinned: false,
  };
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
        tabKey=""
        showKeys={showKeys}
        setShowKeys={setShowKeys}
        setSearch={setSearch}
        search={search}
        sort={(value: string) => setSortVal(value)}
        selectedKey={key}
        applyFilter={applyFilter}
        postType="group-post"
        key={key}
        clearKeyHandler={clearKeyHandler}
        data={groupData}
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
      <CustomCreatePost linkParams={`?type=group-post&groupId=${groupData._id}`} />
      <div className="mt-3">
        <PostFeed
          postFeedData={posts}
          postType="group-post"
          popoverOptions={options!}
          isCommentSection={false}
          onPopoverClick={handlePopoverOption}
        />
      </div>
    </div>
  );
}

export default GroupsDetail;
