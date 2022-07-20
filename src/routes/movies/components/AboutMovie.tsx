import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import {
  Row, Image, Col, Tabs, Tab,
} from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import Switch from '../../../components/ui/Switch';
import ListIcon from './ListIcon';

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
      <div className="bg-dark my-3 p-3 pb-0 rounded-2">
        <Row className="justify-content-center">
          <Col xs={8} sm={5} className="text-center">
            <StyledMoviePoster src="https://i.pravatar.cc/300?img=21" className="w-100 rounded-3 mb-2" />
          </Col>
          <Col xl={7}>
            <Row className="justify-content-center text-center text-xl-start">
              <Col md={9} xl={12}>
                <h1 className="h2">
                  The Curse of La Patasola | Part 1 Weekend camping trip | English dubbed | 1080p
                </h1>
                <Row className="mt-3 pb-3 align-items-center" style={{ borderBottom: '0.063rem solid #282828' }}>
                  <Col xl={6}>
                    <div className="align-items-center d-flex justify-content-evenly justify-content-xl-between text-light  ">
                      <small>2022</small>
                      <small className="align-items-center border border-primary d-flex justify-content-center m-0 text-primary" style={{ width: '2.063rem', height: '2.063rem' }}>R</small>
                      <span className="d-flex align-items-center">
                        <p className="my-0">Atlanta</p>
                        <FontAwesomeIcon icon={solid('circle')} size="sm" style={{ width: '0.188rem' }} className="mx-2 text-primary" />
                        <p className="my-0">1h 30m</p>
                      </span>
                    </div>
                  </Col>
                  <Col xl={6}>
                    <div className="align-items-center d-flex justify-content-evenly py-4 py-xl-0">
                      <span className="d-flex align-items-center justify-content-between">
                        <FontAwesomeIcon icon={solid('star')} size="sm" style={{ color: '#FF8A00', width: '1.638rem', height: '1.563rem' }} className="mb-2 mt-1" />
                        <div className="d-flex">
                          <h2 className="h4 m-0">3.3/5</h2>
                          <p className="m-0 text-light">(10K)</p>
                        </div>
                      </span>
                      <RoundButton className="bg-black border-0">
                        <FontAwesomeIcon icon={regular('star')} size="sm" className="me-2" />
                        Rate
                      </RoundButton>
                    </div>
                  </Col>
                </Row>
                <Row className="mt-3 pb-3 align-items-center" style={{ borderBottom: '0.063rem solid #282828' }}>
                  <Col xl={8}>
                    <div className="align-items-center d-flex justify-content-evenly justify-content-xl-between">
                      <h2 className="m-0 h6">Worth watching?</h2>
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="align-items-center d-flex me-3 me-xl-0">
                          <FontAwesomeIcon icon={regular('thumbs-up')} size="sm" style={{ color: '#00FF0A', border: '0.063rem solid #3A3B46' }} className="rounded-circle p-2" />
                          <p className="m-0 text-light">(10K)</p>
                        </span>
                        <span className="align-items-center d-flex">
                          <FontAwesomeIcon icon={regular('thumbs-down')} size="sm" style={{ color: ' #FF1800', border: '0.063rem solid #3A3B46', transform: 'rotateY(180deg)' }} className="rounded-circle p-2" />
                          <p className="m-0 text-light">(2K)</p>
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col xl={4} className="d-none d-xl-block text-end">
                    <RoundButton className="bg-black px-4 py-2 rounded-pill border-0">
                      <FontAwesomeIcon icon={solid('share-nodes')} size="sm" className="me-2" />
                      Share
                    </RoundButton>
                  </Col>
                </Row>
                <div className="align-items-center d-flex justify-content-center justify-content-xl-start py-3" style={{ color: '#00FF0A' }}>
                  <div
                    className="rounded-circle p-3 me-2 d-flex align-items-center justify-content-center"
                    style={{
                      width: '2.5rem',
                      height: '2.5rem',
                      border: '0.063rem solid #3A3B46',
                      background: '#1F1F1F',
                    }}
                  >
                    <FontAwesomeIcon icon={regular('thumbs-up')} size="lg" style={{ width: '1.326rem', height: '1.391rem' }} />
                  </div>
                  <p className="m-0">Worth it!</p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="align-items-center justify-content-center justify-content-xl-start mt-4">
          <Col xs={10} sm={8} md={6} xl={5} className="text-center">
            <h1 className="small">Your lists</h1>
            <ListIcon />
          </Col>
          <Col xl={7} className="d-xl-none text-center text-xl-end mt-3 mt-xl-0">
            <RoundButton className="px-4 py-2 rounded-pill border-0 me-2">
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
