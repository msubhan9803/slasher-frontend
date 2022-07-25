import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Row, Image, Col, Tabs, Tab,
} from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import Switch from '../../../components/ui/Switch';
import ListIcon from './ListIcon';
import AboutDetails from './AboutDetails';

const StyledMoviePoster = styled.div`
  aspect-ratio: 5/6;
  img {
    object-fit: cover;
  }
`;
const StyleTabs = styled(Tabs)`
border-bottom: 0.188rem solid var(--bs-dark);
overflow-x: auto;
overflow-y: hidden;
.nav-link {
  border: none;
  color: white;
  &:hover {
    border-color: transparent;
    color: var(--bs-primary);
  }
  &.active {
    color: var(--bs-primary);
    background-color: transparent;
    border-bottom:  0.188rem solid var(--bs-primary);
  }
}
`;
const FollowStyledButton = styled(RoundButton)`
  width: 9.938rem;
`;
function AboutMovie() {
  const [bgColor, setBgColor] = useState<boolean>(false);
  return (
    <div>
      <div className="bg-dark my-3 p-3 pb-0 rounded-2">
        <Row className="justify-content-center">
          <Col xs={6} sm={5} md={4} lg={6} xl={5}>
            <StyledMoviePoster className="w-100 h-100">
              <Image src="https://i.pravatar.cc/300?img=21" className="w-100 h-100 rounded-3" />
            </StyledMoviePoster>
          </Col>
          <Col xl={7}>
            <AboutDetails />
          </Col>
        </Row>
        <Row className="justify-content-center justify-content-xl-start mt-2">
          <Col xs={10} sm={7} md={5} lg={9} xl={5} className="text-center">
            <small>Your lists</small>
            <ListIcon />
          </Col>
          <Col xl={7} className="mt-3 mt-xl-0">
            <div className="d-flex align-items-baseline justify-content-center justify-content-xl-start">
              <FollowStyledButton variant="lg" onClick={() => setBgColor(!bgColor)} className={` d-lg-none me-2 border-0 rounded-pill shadow-none ${bgColor ? 'bg-primary' : 'bg-black'}`}>
                {bgColor ? 'Follow' : 'Unfollow'}
              </FollowStyledButton>
              <RoundButton className="mt-3 px-3 bg-black rounded-pill border-0" variant="lg">
                <FontAwesomeIcon icon={solid('share-nodes')} size="sm" className="me-2" />
                Share
              </RoundButton>
            </div>
          </Col>
        </Row>
        <Row className="align-items-center justify-content-center mt-4 d-lg-none">
          <Col sm={5}>
            <div className="align-items-center d-flex justify-content-evenly">
              <span>Push notifications</span>
              <Switch id="pushNotificationsSwitch" className="ms-0 ms-md-3" />
            </div>
          </Col>
        </Row>
        <Row>
          <Col xl={5}>
            <StyleTabs className="justify-content-between mt-3 px-2 border-0">
              <Tab eventKey="details" title="Details" />
              <Tab eventKey="posts" title="Posts" />
              <Tab eventKey="edit" title="Edit" />
            </StyleTabs>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AboutMovie;
