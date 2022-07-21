import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';

const StyledRateBorder = styled(Row)`
  border-top: 0.063rem solid #3A3B46;
  border-bottom: 0.063rem solid #3A3B46;
`;
const StyledOnLikedIcon = styled(RoundButton)`
  color: #00FF0A;
  border: 0.063rem solid #00FF0A;
  &:hover {
    color: #00FF0A;
    border: 0.063rem solid #00FF0A;
  }
`;
const StyledLikeIcon = styled(RoundButton)`
  color: #00FF0A;
  border: 0.063rem solid #3A3B46;
  &:hover {
    color: #00FF0A;
    border: 0.063rem solid #3A3B46;
  }
`;

const StyledOnDisLikeIcon = styled(RoundButton)`
  color: #FF1800;
  border: 0.063rem solid #FF1800;
  transform: rotateY(180deg);
  &:hover {
    color: #FF1800;
    border: 0.063rem solid #FF1800;
  }
`;
const StyledDisLikeIcon = styled(RoundButton)`
  color: #FF1800;
  border: 0.063rem solid #3A3B46;
  transform: rotateY(180deg);
  &:hover {
    color: #FF1800;
    border: 0.063rem solid #3A3B46;
  }
`;
const StyledWorth = styled.div`
  color: #00FF0A;
  div {
    width: 2.5rem;
    height: 2.5rem;
    border: 0.063rem solid #3A3B46;
    background: #1F1F1F;
  }
  FontAwesomeIcon {
    width: 1.326rem;
    height: 1.391rem;
  }
`;

const AboutMovieDetails = styled.div`
  .small-initial {
    width: 2.063rem;
    height: 2.063rem;
  }
  .circle {
    width: 0.188rem;
  }
  .star {
    color: #FF8A00;
    width: 1.638rem;
    height: 1.563rem;
  }
  .rate-btn {
    padding: 0 1.219rem;
  }
`;
function AboutDetails() {
  const [liked, setLike] = useState(false);
  const [disLiked, setDisLike] = useState(false);

  return (
    <AboutMovieDetails className="text-xl-start">
      <Row className="justify-content-center mt-2 mt-xl-0">
        <Col sm={10} md={8} lg={9} xl={12}>
          <h1 className="h2 m-0 text-center">
            The Curse of La Patasola | Part 1 Weekend camping trip | English dubbed | 1080p
          </h1>
        </Col>
      </Row>

      <Row className="py-4 justify-content-center">
        <Col>
          <div className="align-items-center d-flex justify-content-center text-light">
            <small>2022</small>
            <small className="small-initial ms-3 me-4 align-items-center border border-primary d-flex justify-content-center text-primary">R</small>
            <span className="align-items-center d-flex">
              <p className="my-0">Atlanta</p>
              <FontAwesomeIcon icon={solid('circle')} size="sm" className="circle mx-2 text-primary" />
              <p className="my-0">1h 30m</p>
            </span>
          </div>
        </Col>
      </Row>

      <StyledRateBorder className="py-3 justify-content-center align-items-center">
        <Col xs={5} xl={5}>
          <span className="align-items-center d-flex justify-content-end pe-xs-3 pe-xl-2">
            <FontAwesomeIcon icon={solid('star')} size="xs" className="star mb-2 mt-1" />
            <div className="d-flex">
              <h2 className="h4 m-0 ms-2 me-1">3.3/5</h2>
              <p className="m-0 text-light">(10K)</p>
            </div>
          </span>
        </Col>
        <Col xs={5} xl={5}>
          <RoundButton className="rate-btn bg-black border-0 py-2" variant="lg">
            <FontAwesomeIcon icon={regular('star')} size="sm" className="me-2" />
            Rate
          </RoundButton>
        </Col>
      </StyledRateBorder>

      <Row className="justify-content-center py-3">
        <Col xl={10}>
          <div className="align-items-center d-flex justify-content-center">
            <p className="m-0 me-3">Worth watching?</p>
            <div className="d-flex align-items-center justify-content-between">
              <span className="align-items-center d-flex me-xl-0">
                {liked ? (
                  <StyledOnLikedIcon onClick={() => setLike(false)} className="shadow-none bg-transparent me-1 px-2 py-1 rounded-circle">
                    <FontAwesomeIcon icon={regular('thumbs-up')} size="sm" />
                  </StyledOnLikedIcon>
                ) : (
                  <StyledLikeIcon onClick={() => { setLike(true); setDisLike(false); }} className="shadow-none bg-transparent me-1 px-2 py-1 rounded-circle">
                    <FontAwesomeIcon icon={regular('thumbs-up')} size="sm" />
                  </StyledLikeIcon>
                )}
                <p className="m-0 text-light">(10K)</p>
              </span>
              <span className="align-items-center d-flex ms-3">
                {disLiked ? (
                  <StyledOnDisLikeIcon onClick={() => setDisLike(false)} className="shadow-none bg-transparent me-1 px-2 py-1 rounded-circle">
                    <FontAwesomeIcon icon={regular('thumbs-down')} size="sm" />
                  </StyledOnDisLikeIcon>
                ) : (
                  <StyledDisLikeIcon onClick={() => { setDisLike(true); setLike(false); }} className="shadow-none bg-transparent me-1 px-2 py-1 rounded-circle">
                    <FontAwesomeIcon icon={regular('thumbs-down')} size="sm" />
                  </StyledDisLikeIcon>
                )}
                <p className="m-0 text-light">(2K)</p>
              </span>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col xs={5} xl={5}>
          <StyledWorth className="align-items-center justify-content-end justify-content-xl-center d-flex me-4 me-xl-0">
            <div className="rounded-circle p-3 me-2 d-flex align-items-center justify-content-center">
              <FontAwesomeIcon icon={regular('thumbs-up')} size="lg" />
            </div>
            <p className="m-0">Worth it!</p>
          </StyledWorth>
        </Col>
        <Col xs={5} xl={5}>
          <RoundButton className="bg-black py-2 rounded-pill border-0" variant="lg">
            <FontAwesomeIcon icon={solid('share-nodes')} size="sm" className="me-2" />
            Share
          </RoundButton>
        </Col>
      </Row>
    </AboutMovieDetails>
  );
}

export default AboutDetails;
