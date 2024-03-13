/* eslint-disable max-lines */
import React, { useEffect, useState, useCallback } from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Row } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroller';
import styled from 'styled-components';
import BorderButton from '../../../../components/ui/BorderButton';
import { StyledBorder } from '../../../../components/ui/StyledBorder';
import { StyledHastagsCircle } from '../../../search/component/Hashtags';
import FollowingHeader from '../FollowingHeader';
import { followHashtag, getFollowedHashtags, unfollowHashtag } from '../../../../api/users';
import { useAppSelector } from '../../../../redux/hooks';
import LoadingIndicator from '../../../../components/ui/LoadingIndicator';
import { MD_MEDIA_BREAKPOINT } from '../../../../constants';
import ProfileTabContent from '../../../../components/ui/profile/ProfileTabContent';

// const CustomHashTagButton = styled(HashtagButton)`
//   background-color: #383838;
// `;
interface FollowHashtagProps {
  notification: number,
  userId: string,
  _id: string,
  id: string,
  title: string,
  totalPost: number,
  followed: boolean,
}
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
// const hashTags = [
//   { title: 'Trending',
// tags: ['onlinebusiness', 'slasher', 'follow4follow', 'slashershop', 'follow4follow'] },
//   { title: 'Most popular',
//  tags: ['onlinebusiness', 'slasher', 'follow4follow', 'slashershop', 'follow4follow'] },
// ];
function FollowingHashtags() {
  const userData = useAppSelector((state) => state.user);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  // const [errorMessage, setErrorMessage] = useState<string[]>();
  const [followedHashtag, setFollowedHastag] = useState<FollowHashtagProps[]>([]);
  const [additionalHashtag, setAdditionalHashtag] = useState<boolean>(false);
  const [loadingHashtag, setLoadingHashtag] = useState<boolean>(false);

  const fetchMoreTagList = useCallback(() => {
    getFollowedHashtags(userData.user.id, search, page)
      .then((res) => {
        const newHashtags = res.data.map((hashtagDetail: any) => ({
          _id: hashtagDetail.hashTagId._id,
          id: hashtagDetail.hashTagId._id,
          notification: hashtagDetail.notification,
          title: hashtagDetail.hashTagId.name,
          totalPost: hashtagDetail.hashTagId.totalPost,
          followed: true,
        }));
        setFollowedHastag((prev: any) => [...prev, ...newHashtags]);
        setPage(page + 1);
        if (res.data.length === 0) {
          setNoMoreData(true);
          setLoadingHashtag(false);
        }
      })
      .catch((error) => {
        setNoMoreData(true);
        /* eslint-disable no-console */
        console.error(error);
        // setErrorMessage(error.response.data.message);
      })
      .finally(
        // eslint-disable-next-line max-len
        () => { setAdditionalHashtag(false); setLoadingHashtag(false); },
      );
  }, [userData.user, page, search]);

  useEffect(() => {
    if (additionalHashtag && !loadingHashtag) {
      setLoadingHashtag(true);
      fetchMoreTagList();
    }
  }, [additionalHashtag, fetchMoreTagList, loadingHashtag, page, search.length]);

  const renderNoMoreDataMessage = () => {
    const message = followedHashtag.length === 0 && search
      ? 'No results found'
      : 'No hashtags at the moment';
    return (
      <p className="text-center m-0 py-3">
        {
          followedHashtag.length === 0
            ? message
            : 'No more hashtag'
        }
      </p>
    );
  };

  const followUnfollowClick = (hashtagData: any) => {
    if (!hashtagData.followed) {
      followHashtag(hashtagData.title.toLowerCase(), userData.user.id, true).then(() => {
        const updatedHashtag = followedHashtag?.map((hashtag) => {
          if (hashtag.id === hashtagData.id) {
            return {
              ...hashtag,
              followed: true,
              notification: 0,
            };
          }
          return hashtag;
        });
        setFollowedHastag(updatedHashtag);
      });
    } else {
      unfollowHashtag(hashtagData.title.toLowerCase(), userData.user.id).then(() => {
        const updatedHashtag = followedHashtag?.map((hashtag) => {
          if (hashtag.id === hashtagData.id) {
            return {
              ...hashtag,
              followed: false,
              notification: 1,
            };
          }
          return hashtag;
        });
        setFollowedHastag(updatedHashtag);
      });
    }
  };

  const onOffNotificationClick = (hashtagData: any) => {
    if (hashtagData.notification === 0) {
      followHashtag(hashtagData.title.toLowerCase(), userData.user.id, true).then(() => {
        const updatedHashtag = followedHashtag?.map((hashtag) => {
          if (hashtag.id === hashtagData.id) {
            return {
              ...hashtag,
              notification: 1,
            };
          }
          return hashtag;
        });
        setFollowedHastag(updatedHashtag);
      });
    } else {
      followHashtag(hashtagData.title.toLowerCase(), userData.user.id, false).then(() => {
        const updatedHashtag = followedHashtag?.map((hashtag) => {
          if (hashtag.id === hashtagData.id) {
            return {
              ...hashtag,
              notification: 0,
            };
          }
          return hashtag;
        });
        setFollowedHastag(updatedHashtag);
      });
    }
  };
  const handleSearch = (value: string) => {
    setFollowedHastag([]);
    setNoMoreData(false);
    setAdditionalHashtag(true);
    setSearch(value);
    setPage(0);
  };
  return (
    <ProfileTabContent>
      <FollowingHeader
        tabKey="hashtags"
        setSearch={handleSearch}
        search={search}
      />
      <div className="bg-dark p-3 mt-4">
        {/* {enableDevFeatures && (
          <div>
            {hashTags.map((hashtag: any) => (
              <div key={hashtag.title} className="mt-2 d-flex flex-wrap align-items-center">
                <h1 className="h3">
                  {hashtag.title}
                  :
                  {' '}
                </h1>
                {hashtag.tags.map((tag: string) => (
                  <CustomHashTagButton
                    key={`${tag}-1`}
                    as="input"
                    type="button"
                    value={`#${tag}`}
                    className="m-1 px-3 py-1 text-white rounded-pill"
                  />
                ))}
              </div>
            ))}
          </div>
        )} */}
        <InfiniteScroll
          threshold={3000}
          pageStart={0}
          initialLoad
          loadMore={() => { setAdditionalHashtag(true); }}
          hasMore={!noMoreData}
        >
          {followedHashtag
            && followedHashtag.length > 0
            && followedHashtag.map(
              (hashtag: FollowHashtagProps, index: number) => (
                <div key={hashtag.id}>
                  <Row className="align-items-center p-3 mb-0">
                    <Col sm={7} md={8} lg={7} xl={8}>
                      <span className="d-flex align-items-center">
                        <StyledHastagsCircle
                          className="ms-sm-2 me-sm-4 bg-black align-items-center d-flex fs-1 justify-content-around fw-light"
                        >
                          #
                        </StyledHastagsCircle>
                        <div>
                          <p className="fs-3 fw-bold mb-0">
                            #
                            {hashtag.title}
                          </p>
                          <small className="text-light mb-0">
                            {hashtag.totalPost}
                            {' '}
                            posts
                          </small>
                        </div>
                      </span>
                    </Col>
                    <Col sm={5} md={4} lg={5} xl={4} className="mt-4 mt-sm-0">
                      <StyledButtonIcon className="d-flex align-items-center justify-content-center justify-content-sm-end">
                        {hashtag.followed && (
                          <div className="main me-3">
                            <div className="text-center text-md-start d-flex flex-wrap justify-content-center align-items-center align-items-md-start">
                              <Button aria-label="notification bell" size="sm" className="p-0" variant="link" onClick={() => onOffNotificationClick(hashtag)}>
                                <FontAwesomeIcon size="lg" className={`${hashtag.notification ? 'text-success' : 'text-primary'} `} icon={hashtag.notification ? regular('bell') : regular('bell-slash')} />
                              </Button>
                              <p className="fs-6 text-center toggle mt-1 mb-0">{hashtag.notification ? 'On' : 'Off'}</p>
                            </div>
                          </div>
                        )}
                        <BorderButton
                          buttonClass={'hashtag.followed? \'text-white\' : \'text-black\'} py-2 w-100'}
                          variant="sm"
                          toggleBgColor={hashtag.followed}
                          handleClick={() => followUnfollowClick(hashtag)}
                          toggleButton
                        />
                      </StyledButtonIcon>
                    </Col>
                  </Row>
                  {(index !== (followedHashtag.length - 1)) && <StyledBorder />}
                </div>
              ),
            )}
          {(loadingHashtag) && <LoadingIndicator className="py-3" />}
          {noMoreData && renderNoMoreDataMessage()}
          {/* <ErrorMessageList errorMessages={errorMessage}
          divClass="mt-3 text-start" className="m-0" /> */}
        </InfiniteScroll>
      </div>
    </ProfileTabContent>
  );
}

export default FollowingHashtags;
