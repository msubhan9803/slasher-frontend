import React, { useEffect, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { DateTime } from 'luxon';
import { useMediaQuery } from 'react-responsive';
import { getSuggestedMovies } from '../../api/users';
import ExperienceListItem from '../../components/layout/right-sidebar-wrapper/components/ExperienceListItem';
import { LG_MEDIA_BREAKPOINT } from '../../constants';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

const StyleMovie = styled(Row)`
  overflow-x: auto;
  overflow-y: hidden;
  .casts-image { aspect-ratio: 1; }
  &::-webkit-scrollbar { display: none; }
`;

const Card = styled.div`
  width: 7.625rem;
  padding-right: 1rem;
`;

const LoadingIndicatorSpacer = styled.div`
  height:12.857rem;
`;

function SuggestedMovie() {
  const [suggestedMovies, setSuggestedMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const isDesktopResponsiveSize = useMediaQuery({ query: `(min-width: ${LG_MEDIA_BREAKPOINT})` });

  useEffect(() => {
    setLoading(true);
    getSuggestedMovies().then((res) => {
      setSuggestedMovies(res.data);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const slideFriendRight = () => {
    const slider = document.getElementById('sliderMovie');
    if (slider !== null) {
      slider.scrollLeft += 300;
    }
  };

  const slideFriendLeft = () => {
    const slider = document.getElementById('sliderMovie');
    if (slider !== null) {
      slider.scrollLeft -= 300;
    }
  };

  const renderNoSuggestionsAvailable = () => (
    <div className="ms-3 ms-md-0" style={{ marginBottom: 50 }}>
      No movie suggestions available right now, but check back later for more!
    </div>
  );

  if (loading) {
    return (
      <div className="p-md-3 pt-md-1 ">
        <LoadingIndicatorSpacer className="d-flex align-items-center justify-content-center">
          <LoadingIndicator />
        </LoadingIndicatorSpacer>
      </div>
    );
  }

  return (
    <div>
      {!suggestedMovies || suggestedMovies.length === 0 ? renderNoSuggestionsAvailable() : (
        <div className="p-md-3 pt-md-1 rounded-2">
          <div className="d-flex align-items-center position-relative">
            <Button tabIndex={0} aria-label="chevron left icon" className="position-absolute d-block p-0 prev bg-transparent border-0" onClick={slideFriendLeft}>
              <FontAwesomeIcon icon={solid('chevron-left')} size="lg" className="text-white" />
            </Button>
            <Button tabIndex={0} aria-label="chevron right icon" style={{ right: 0 }} className="position-absolute d-block p-0 next bg-transparent border-0" onClick={slideFriendRight}>
              <FontAwesomeIcon icon={solid('chevron-right')} size="lg" className="text-white" />
            </Button>
            <StyleMovie
              id="sliderMovie"
              className="d-flex flex-nowrap w-100 mx-4 g-0"
              style={{ maxWidth: isDesktopResponsiveSize ? '50vw' : '' }}
              tabIndex={-1}
            >
              {suggestedMovies?.map((movie: any) => (
                <Card key={movie._id}>
                  <ExperienceListItem
                    image={movie.logo}
                    title={movie.name}
                    year={+DateTime.fromISO(movie.releaseDate).toFormat('yyyy')}
                    numericRating={10}
                    thumbRating={2}
                    id={movie._id}
                  />
                </Card>
              ))}
            </StyleMovie>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuggestedMovie;
