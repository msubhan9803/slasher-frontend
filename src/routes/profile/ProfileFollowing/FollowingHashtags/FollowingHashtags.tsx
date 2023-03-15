import React, { useState } from 'react';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Row } from 'react-bootstrap';
import BorderButton from '../../../../components/ui/BorderButton';
import { StyledBorder } from '../../../../components/ui/StyledBorder';
import { StyledHastagsCircle } from '../../../search/component/Hashtags';
import FollowingHeader from '../FollowingHeader';

const followHashtags = [
  { id: 'hashtag01', title: 'horrortrickortreat', notify: true },
  { id: 'hashtag02', title: 'horrorgothicbook', notify: true },
  { id: 'hashtag03', title: 'slasherhorrormovies', notify: true },
  { id: 'hashtag04', title: 'americanhorrorstory', notify: false },
];

function FollowingHashtags() {
  const [search, setSearch] = useState<string>('');
  const [notificationOn, setNotificationOn] = useState(false);
  const [bgColor, setBgColor] = useState<boolean>(false);

  return (
    <div>
      <FollowingHeader
        tabKey="hashtags"
        setSearch={setSearch}
        search={search}
      />

      <div className="bg-dark p-3 mt-4">
        {followHashtags.map((hashtag: any, index: number) => (
          <div key={hashtag.id}>
            <Row className="align-items-center p-3 mb-0">
              <Col sm={7} md={8} lg={7} xl={8}>
                <span className="d-flex align-items-center">
                  <StyledHastagsCircle className="ms-sm-2 me-sm-4 bg-black align-items-center d-flex fs-1 justify-content-around fw-light">#</StyledHastagsCircle>
                  <div>
                    <p className="fs-3 fw-bold mb-0">
                      #
                      {hashtag.title}
                    </p>
                    <small className="text-light mb-0">24.3M posts</small>
                  </div>
                </span>
              </Col>
              <Col sm={5} md={4} lg={5} xl={4} className="mt-4 mt-sm-0">
                <div className="d-flex align-items-center justify-content-center justify-content-sm-end">
                  <Button aria-label="notificatio bell" size="sm" className="me-2 pe-2" variant="link" onClick={() => setNotificationOn(!notificationOn)}>
                    <FontAwesomeIcon size="lg" className={`${notificationOn ? 'me-0' : 'me-1'} `} icon={notificationOn ? regular('bell-slash') : regular('bell')} />
                  </Button>
                  <BorderButton
                    buttonClass={`${bgColor ? 'text-black' : 'text-white'} py-2 w-100`}
                    variant="sm"
                    toggleBgColor={bgColor}
                    handleClick={() => setBgColor(!bgColor)}
                    toggleButton
                  />
                </div>
              </Col>
            </Row>
            {(index !== (followHashtags.length - 1)) && <StyledBorder />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FollowingHashtags;
