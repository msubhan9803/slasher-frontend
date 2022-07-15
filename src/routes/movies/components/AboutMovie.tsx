import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Row, Image, Col } from 'react-bootstrap';
import styled from 'styled-components';

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
function AboutMovie() {
  return (
    <div>
      <div className="bg-dark my-3 p-4 rounded-2">
        <Row>
          <Col md={5} className="text-center">
            <Row className="justify-content-center">
              <Col sm={5}>
                <StyledMoviePoster src="https://i.pravatar.cc/300?img=21" className="w-100 rounded-3 mb-2" />
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
            </Row>
          </Col>
          <Col md={7} className="position-relative">
            <Row className="justify-content-center text-center">
              <Col xs={8} md={12}>
                <small className="text-light">2022</small>
                <h1 style={{ fontSize: '35px' }}>The Curse of La Patasola</h1>
                <div className="d-flex align-items-center mt-3">
                  <small className="m-0 text-primary border border-primary" style={{ padding: '8px 14px' }}>R</small>
                  <p className="my-0 ms-4 me-3">Atlanta</p>
                  <FontAwesomeIcon icon={solid('circle')} size="sm" style={{ width: '3px' }} className="text-primary" />
                  <p className="my-0 ms-3">1h 30m</p>
                </div>
                <Row className="align-items-center my-4 text-center">
                  <Col xs={3}>
                    <p className="m-0">Rating</p>
                    <span className="fs-5">
                      <FontAwesomeIcon icon={solid('star')} size="sm" style={{ color: '#FF8A00' }} className="me-2" />
                      3.3/5
                    </span>
                  </Col>
                  <Col xs={4}>
                    <span className="bg-black fs-5 px-4 py-2 rounded-pill">
                      <FontAwesomeIcon icon={regular('star')} size="sm" className="me-2" />
                      Rate
                    </span>
                  </Col>
                </Row>
                <Row className="text-center">
                  <Col xs={3}>
                    <p className="m-0">Worth it!</p>
                    <FontAwesomeIcon icon={regular('thumbs-up')} size="lg" style={{ color: '#00FF0A', border: '1px solid #00FF0A' }} className="rounded-circle p-3 mt-2" />
                  </Col>
                  <Col xs={4}>
                    <p className="">Worth a watch?</p>
                    <span>
                      <FontAwesomeIcon icon={regular('thumbs-up')} size="sm" style={{ color: '#00FF0A', border: '1px solid #3A3B46' }} className="rounded-circle p-2 me-2" />
                      <FontAwesomeIcon icon={regular('thumbs-down')} size="sm" style={{ color: ' #FF1800', border: '1px solid #3A3B46', transform: 'rotateY(180deg)' }} className="rounded-circle p-2 me-2" />
                    </span>
                  </Col>
                </Row>
                <div className="bg-black fs-4 px-4 py-2 rounded-pill position-absolute" style={{ bottom: '18px', right: '20px' }}>
                  <FontAwesomeIcon icon={solid('share-nodes')} size="sm" className="me-2" />
                  Share
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AboutMovie;
