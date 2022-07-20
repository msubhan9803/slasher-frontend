import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';

const StyledRateBorder = styled.div`
border-top: none;
@media (max-width: 75rem) {
  border-top: 0.063rem solid #3A3B46;
}
`;
const StyledWatchBorder = styled.div`
border-top: 0.063rem solid #3A3B46;
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
`;

function AboutDetails() {
  const [liked, setLike] = useState(false);
  const [disLiked, setDisLike] = useState(false);

  return (
    <div className="text-xl-start text-center">
      <h1 className="h2 m-0">
        The Curse of La Patasola | Part 1 Weekend camping trip | English dubbed | 1080p
      </h1>

      <div className="d-block d-xl-flex justify-content-between mt-4">
        <div className="align-items-center d-flex justify-content-center justify-content-xl-between mb-3 mb-xl-0 text-light">
          <small>2022</small>
          <small className="align-items-center border border-primary d-flex justify-content-center mx-3 mx-xl-1 text-primary" style={{ width: '2.063rem', height: '2.063rem' }}>R</small>
          <span className="align-items-center d-flex">
            <p className="my-0">Atlanta</p>
            <FontAwesomeIcon icon={solid('circle')} size="sm" style={{ width: '0.188rem' }} className="mx-1 text-primary" />
            <p className="my-0">1h 30m</p>
          </span>
        </div>

        <StyledRateBorder className="align-items-center d-flex justify-content-center pt-3 pt-xl-0">
          <span className="align-items-center d-flex justify-content-between me-3 me-xl-0">
            <FontAwesomeIcon icon={solid('star')} size="sm" style={{ color: '#FF8A00', width: '1.638rem', height: '1.563rem' }} className="mb-2 me-2 me-xl-0 mt-1" />
            <div className="d-flex">
              <h2 className="h4 m-0">3.3/5</h2>
              <p className="m-0 text-light">(10K)</p>
            </div>
          </span>
          <RoundButton className="bg-black border-0 px-4 py-2">
            <FontAwesomeIcon icon={regular('star')} size="sm" className="me-2" />
            Rate
          </RoundButton>
        </StyledRateBorder>
      </div>

      <StyledWatchBorder className="d-block d-xl-flex justify-content-between pt-4 mt-3">
        <div className="align-items-center d-flex justify-content-center justify-content-xl-between">
          <h2 className="h6 m-0 me-3 me-xl-2">Worth watching?</h2>
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

        <RoundButton className="d-none d-xl-flex align-items-center bg-black px-4 py-2 rounded-pill border-0">
          <FontAwesomeIcon icon={solid('share-nodes')} size="sm" className="me-2" />
          Share
        </RoundButton>
      </StyledWatchBorder>

      <StyledWorth className="align-items-center d-flex justify-content-center justify-content-xl-start my-4">
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
      </StyledWorth>
    </div>
  );
}

export default AboutDetails;
