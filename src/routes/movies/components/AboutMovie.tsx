import React, { useState } from 'react';
import {
  Row, Image, Col, Tabs, Tab,
} from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import Switch from '../../../components/ui/Switch';
import ListIcon from './ListIcon';
import AboutDetails from './AboutDetails';
import MoviePoster from '../../../images/movies-poster.svg';

const StyledMoviePoster = styled.div`
  aspect-ratio: 0.83;
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
  width: 21.125rem;
`;
function AboutMovie() {
  const [bgColor, setBgColor] = useState<boolean>(false);
  return (
    <div>
      <div className="bg-dark my-3 p-3 pb-0 rounded-2">
        <Row className="justify-content-center">
          <Col xs={6} sm={5} md={4} lg={6} xl={5} className="text-center">
            <StyledMoviePoster>
              <Image src={MoviePoster} className="rounded-3 w-100 h-100" />
            </StyledMoviePoster>
            <div className="d-none d-xl-block">
              <small>Your lists</small>
              <ListIcon like="likeXL" watch="watchXL" watchlist="watchlistXL" buy="buyXL" />
            </div>
          </Col>
          <Col xl={7}>
            <AboutDetails />
          </Col>
        </Row>
        <Row className="d-xl-none justify-content-center mt-4 mt-lg-2">
          <Col xs={10} sm={7} md={5} lg={9} className="text-center">
            <small>Your lists</small>
            <ListIcon like="like" watch="watch" watchlist="watchlist" buy="buy" />
          </Col>
        </Row>
        <Row className="d-lg-none mt-3 text-center">
          <Col xs={12}>
            <p className="text-center fw-bold">Get updates for this movie</p>
            <FollowStyledButton variant="lg" onClick={() => setBgColor(!bgColor)} className={`border-0 rounded-pill shadow-none ${bgColor ? 'bg-primary' : 'bg-black'}`}>
              {bgColor ? 'Follow' : 'Unfollow'}
            </FollowStyledButton>
          </Col>
        </Row>
        <Row className="align-items-center justify-content-center mt-4 d-lg-none">
          <Col sm={5}>
            <div className="align-items-center d-flex justify-content-center">
              <span className="mb-2">Push notifications</span>
              <Switch id="pushNotificationsSwitch" className="ms-4" />
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
