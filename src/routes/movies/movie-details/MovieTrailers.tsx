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
  margin-left: -2.75em;
  margin-top: -2.5em;
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
        <Button variant="link" aria-label="chevron left icon" className="prev p-1 me-3" onClick={slideTrailerLeft}>
          <FontAwesomeIcon icon={solid('chevron-left')} size="lg" />
        </Button>
        <StyledMovieTrailer
          id="slideTrailer"
          className="d-flex flex-nowrap w-100"
        >
          {trailerList && trailerList.map((trailer: Video, index: number) => (

            <Col sm={5} md={4} lg={6} xl={4} key={trailer.key}>
              <div className="trailer-image position-relative">
                <div>
                  <img
                    src={`https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`}
                    className="w-100 h-100"
                    alt="user uploaded content"
                  />
                </div>
                <StyledYouTubeButton
                  variant="link"
                  aria-label="youtube"
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
        <Button aria-label="chevron right icon" variant="link" className="next p-1 ms-3" onClick={slideTrailerRight}>
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
