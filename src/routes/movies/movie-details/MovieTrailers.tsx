import React, { useState } from 'react';
import { brands, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { Video } from '../../../types';
import CustomYoutubeModal from '../../../components/ui/CustomYoutubeModal';

interface MovieTrailerList {
  trailerList: Video[]
}

const StyledMovieTrailer = styled(Row)`
  overflow-x: auto;
  overflow-y: hidden;

  .trailer-image {
    aspect-ratio: 1.78;
  }
  &::-webkit-scrollbar {
    display: none;
  } 
  -ms-overflow-style: none;
  scrollbar-width: none;

`;
const StyledYouTubeButton = styled(Button)`
  position: absolute;
  top: 50%;
  left: 50%;
  border-radius: 10px;
  margin-left: -2em;
  margin-top: -2em;
`;
function MovieTrailers({ trailerList }: MovieTrailerList) {
  const [showVideoPlayerModal, setShowYouTubeModal] = useState(false);
  const [videoKey, setVideoKey] = useState('');

  const slideTrailerLeft = () => {
    const slider = document.getElementById('slideTrailer');
    if (slider !== null) {
      slider.scrollLeft -= 300;
    }
  };

  const slideTrailerRight = () => {
    const slider = document.getElementById('slideTrailer');
    if (slider !== null) {
      slider.scrollLeft += 300;
    }
  };
  const handleYoutubeDialog = (key: string) => {
    setShowYouTubeModal(true);
    setVideoKey(key);
  };
  return (
    <div className="bg-dark p-3 pb-4 rounded-2 mt-3">
      <h1 className="h2 fw-bold">Trailers</h1>
      <div className="d-flex align-items-center mt-3">
        <Button variant="link" className="prev shadow-none" onClick={slideTrailerLeft}>
          <FontAwesomeIcon icon={solid('chevron-left')} size="lg" />
        </Button>
        <StyledMovieTrailer
          id="slideTrailer"
          className="d-flex flex-nowrap w-100"
        >
          {trailerList && trailerList.map((trailer: Video) => (

            <Col sm={5} md={4} lg={6} xl={4} key={trailer.key}>
              <div className="trailer-image position-relative">
                <img
                  src={`https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`}
                  className="w-100 h-100"
                  alt="user uploaded content"
                />
                <StyledYouTubeButton
                  variant="link"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    handleYoutubeDialog(trailer.key);
                  }}
                >
                  <FontAwesomeIcon icon={brands('youtube')} size="4x" />
                </StyledYouTubeButton>
              </div>
            </Col>
          ))}
        </StyledMovieTrailer>
        <Button variant="link" className="next shadow-none" onClick={slideTrailerRight}>
          <FontAwesomeIcon icon={solid('chevron-right')} size="lg" />
        </Button>
      </div>
      <CustomYoutubeModal
        show={showVideoPlayerModal}
        setShow={setShowYouTubeModal}
        videokey={videoKey}
      />
    </div>
  );
}

export default MovieTrailers;
