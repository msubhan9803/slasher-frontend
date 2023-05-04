/* eslint-disable max-lines */
import React, { useEffect, useState, useCallback } from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Row } from 'react-bootstrap';
import BorderButton from '../../../../components/ui/BorderButton';
import { StyledBorder } from '../../../../components/ui/StyledBorder';
import { StyledHastagsCircle } from '../../../search/component/Hashtags';
import FollowingHeader from '../FollowingHeader';
import { followHashtag, getFollowedHashtags, unfollowHashtag } from '../../../../api/users';
import { useAppSelector } from '../../../../redux/hooks';

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

// const hashTags = [
//   { title: 'Trending',
// tags: ['onlinebusiness', 'slasher', 'follow4follow', 'slashershop', 'follow4follow'] },
//   { title: 'Most popular',
//  tags: ['onlinebusiness', 'slasher', 'follow4follow', 'slashershop', 'follow4follow'] },
// ];
function FollowingHashtags() {
  const userData = useAppSelector((state) => state.user);
  const [search, setSearch] = useState<string>('');
  const [followedHashtag, setFollowedHastag] = useState<FollowHashtagProps[]>();

  const getFollowingHashtags = useCallback(() => {
    if (userData.user) {
      getFollowedHashtags(userData.user.id).then((res: any) => {
        const newHashtags = res.data.map((hashtagDetail: any) => (
          {
            _id: hashtagDetail.hashTagId._id,
            id: hashtagDetail.hashTagId._id,
            notification: hashtagDetail.notification,
            title: hashtagDetail.hashTagId.name,
            totalPost: hashtagDetail.hashTagId.totalPost,
            followed: true,
          }
        ));
        setFollowedHastag(newHashtags);
      });
    }
  }, [userData.user]);
  useEffect(() => {
    getFollowingHashtags();
  }, [getFollowingHashtags]);

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

  return (
    <div>
      <FollowingHeader
        tabKey="hashtags"
        setSearch={setSearch}
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
                    <div className="d-flex align-items-center justify-content-center justify-content-sm-end">
                      {hashtag.followed && (
                        <Button aria-label="notificatio bell" size="sm" className="me-2 pe-2" variant="link" onClick={() => onOffNotificationClick(hashtag)}>
                          <FontAwesomeIcon size="lg" className={`${hashtag.notification === 1 ? 'me-0' : 'me-1'} `} icon={hashtag.notification === 1 ? regular('bell-slash') : regular('bell')} />
                        </Button>
                      )}
                      <BorderButton
                        buttonClass={'hashtag.followed? \'text-white\' : \'text-black\'} py-2 w-100'}
                        variant="sm"
                        toggleBgColor={hashtag.followed}
                        handleClick={() => followUnfollowClick(hashtag)}
                        toggleButton
                      />
                    </div>
                  </Col>
                </Row>
                {(index !== (followedHashtag.length - 1)) && <StyledBorder />}
              </div>
            ),
          )}
      </div>
    </div>
  );
}

export default FollowingHashtags;
