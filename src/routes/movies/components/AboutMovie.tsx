import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import {
  Row, Image, Col, Tabs, Tab,
} from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import Switch from '../../../components/ui/Switch';

interface LinearIconProps {
  uniqueId?: string
}

const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const StyledMoviePoster = styled(Image)`
  aspect-ratio: 9/11;
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
function AboutMovie() {
  return (
    <div>
      <div className="bg-dark my-3 p-4 pb-0 rounded-2">
        <Row className="justify-content-center">
          <Col xs={8} sm={5} className="text-center">
            <StyledMoviePoster src="https://i.pravatar.cc/300?img=21" className="w-100 rounded-3 mb-2" />
          </Col>
          <Col xl={7}>
            <Row className="justify-content-center text-center text-xl-start">
              <Col md={9} xl={12}>
                <small className="text-light">2022</small>
                <h1 style={{ fontSize: '35px' }}>The Curse of La Patasola</h1>
                <Row className="mt-3">
                  <Col xs={4} xl={1} className="text-end">
                    <small className="m-0 text-primary border border-primary" style={{ padding: '8px 14px' }}>R</small>
                  </Col>
                  <Col xs={8} xl={10}>
                    <div className="d-flex align-items-center">
                      <p className="my-0 ms-4 me-3">Atlanta</p>
                      <FontAwesomeIcon icon={solid('circle')} size="sm" style={{ width: '3px' }} className="text-primary" />
                      <p className="my-0 ms-3">1h 30m</p>
                    </div>
                  </Col>
                </Row>
                <p className="m-0 mt-4">Rating</p>
                <Row className="align-items-center justify-content-center justify-content-xl-start mb-4">
                  <Col xs={5} xl={3}>
                    <div className="d-flex justify-content-end justify-content-xl-start">
                      <FontAwesomeIcon icon={solid('star')} size="sm" style={{ color: '#FF8A00' }} className="me-2 mt-1" />
                      <div>
                        <p className="m-0 fs-6">3.3/5</p>
                        <p className="m-0 text-light small">(256)</p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={6} xl={5} className="text-start text-xl-center">
                    <span className="bg-black fs-5 px-4 py-2 rounded-pill">
                      <FontAwesomeIcon icon={regular('star')} size="sm" className="me-2" />
                      Rate
                    </span>
                  </Col>
                </Row>
                <Row className="justify-content-center justify-content-xl-start">
                  <Col xs={5} xl={3} className="text-end text-xl-start">
                    <p className="m-0">Worth it!</p>
                    <FontAwesomeIcon icon={regular('thumbs-up')} size="lg" style={{ color: '#00FF0A', border: '1px solid #00FF0A' }} className="rounded-circle p-3 mt-2" />
                  </Col>
                  <Col xs={6} xl={5} className="text-start text-xl-center">
                    <p className="m-0">Worth a watch?</p>
                    <div className="mt-3 ms-3">
                      <FontAwesomeIcon icon={regular('thumbs-up')} size="sm" style={{ color: '#00FF0A', border: '1px solid #3A3B46' }} className="rounded-circle p-2 me-2" />
                      <FontAwesomeIcon icon={regular('thumbs-down')} size="sm" style={{ color: ' #FF1800', border: '1px solid #3A3B46', transform: 'rotateY(180deg)' }} className="rounded-circle p-2 me-2" />
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="align-items-center justify-content-center mt-4">
          <Col xs={10} sm={8} md={6} xl={5} className="text-center">
            <h1 className="small">Your lists</h1>
            <div className="d-flex justify-content-between mt-2">
              <LinearIcon uniqueId="like" className="d-flex flex-column">
                <FontAwesomeIcon icon={solid('heart')} size="lg" className="bg-white p-3 rounded-circle" />
                <h6 className="mt-2"> Favorite </h6>
                <svg width="0" height="0">
                  <linearGradient id="like" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#8F00FF', stopOpacity: '1' }} />
                    <stop offset="100%" style={{ stopColor: '#8F00FF', stopOpacity: '0.6' }} />
                  </linearGradient>
                </svg>
              </LinearIcon>
              <LinearIcon uniqueId="watch" className="d-flex flex-column">
                <FontAwesomeIcon icon={solid('eye')} size="lg" className="bg-white p-3 rounded-circle" />
                <small className="mt-2"> Watch </small>
                <svg width="0" height="0">
                  <linearGradient id="watch" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#32D74B', stopOpacity: '1' }} />
                    <stop offset="100%" style={{ stopColor: '#32D74B', stopOpacity: '0.6' }} />
                  </linearGradient>
                </svg>
              </LinearIcon>
              <LinearIcon uniqueId="watchlist" className="d-flex flex-column">
                <FontAwesomeIcon icon={solid('list-check')} size="lg" className="bg-white p-3 rounded-circle" />
                <small className="mt-2"> Watchlist </small>
                <svg width="0" height="0">
                  <linearGradient id="watchlist" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF8A00', stopOpacity: '1' }} />
                    <stop offset="100%" style={{ stopColor: '#FF8A00', stopOpacity: '0.6' }} />
                  </linearGradient>
                </svg>
              </LinearIcon>
              <LinearIcon uniqueId="buy" className="d-flex flex-column">
                <FontAwesomeIcon icon={solid('bag-shopping')} size="lg" className="bg-white p-3 rounded-circle" />
                <small className="mt-2"> Buy </small>
                <svg width="0" height="0">
                  <linearGradient id="buy" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                    <stop offset="100%" style={{ stopColor: '#FF1800', stopOpacity: '0.6' }} />
                  </linearGradient>
                </svg>
              </LinearIcon>
            </div>
          </Col>
          <Col xl={7} className="text-center text-xl-end mt-3 mt-xl-0">
            <RoundButton className="d-xl-none px-4 py-2 rounded-pill border-0 me-2">
              Follow
            </RoundButton>
            <RoundButton className="bg-black px-4 py-2 rounded-pill border-0">
              <FontAwesomeIcon icon={solid('share-nodes')} size="sm" className="me-2" />
              Share
            </RoundButton>
          </Col>
        </Row>
        <Row className=" align-items-center justify-content-center mt-4 d-md-none">
          <Col sm={5}>
            <div className="d-flex justify-content-between">
              <span>Push notifications</span>
              <Switch id="pushNotificationsSwitch" className="ms-0 ms-md-3" />
            </div>
          </Col>
        </Row>
        <StyleTabs className="justify-content-between justify-content-xl-start mt-3 px-2">
          <Tab eventKey="details" title="Details" />
          <Tab eventKey="posts" title="Posts" />
          <Tab eventKey="edit" title="Edit" />
        </StyleTabs>
      </div>
    </div>
  );
}

export default AboutMovie;
