import React, { useEffect, useState } from 'react';
import {
  Row, Image, Col,
} from 'react-bootstrap';
import styled from 'styled-components';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  Navigate,
  Route, Routes, useNavigate, useParams, useSearchParams,
} from 'react-router-dom';
import RoundButton from '../../../components/ui/RoundButton';
import Switch from '../../../components/ui/Switch';
import ListIcon from './ListIcon';
import AboutDetails from './AboutDetails';
import MovieDetailPoster from '../../../images/movie-detail-poster.jpg';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import MovieOverview from './MovieOverview';
import MovieCasts from './MovieCasts';
import MovieTrailers from './MovieTrailers';
import MovieComments from '../components/MovieComments';
import MovieEdit from '../movie-edit/MovieEdit';
import MoviePosts from '../movie-posts/MoviePosts';

interface MovieIconProps {
  label: string;
  icon: IconDefinition;
  iconColor: string;
  margin?: string;
  width: string;
  height: string;
  addMovie: boolean;
}
const StyledMoviePoster = styled.div`
  aspect-ratio: 0.67;
  img{
    object-fit: cover;
  }
`;
const MovieIconList = [
  {
    label: 'Favorite', icon: solid('heart'), iconColor: '#8F00FF', width: '1.354rem', height: '1.185rem', addMovie: false,
  },
  {
    label: 'Watch', icon: solid('check'), iconColor: '#32D74B', width: '1.354rem', height: '0.968rem', addMovie: false,
  },
  {
    label: 'Watchlist', icon: solid('list-check'), iconColor: '#FF8A00', width: '1.404rem', height: '1.185rem', addMovie: true,
  },
  {
    label: 'Buy', icon: solid('bag-shopping'), iconColor: '#FF1800', width: '1.029rem', height: '1.185rem', addMovie: false,
  },
];
const tabsForSelf = [
  { value: 'details', label: 'Details' },
  { value: 'posts', label: 'Posts' },
  { value: 'edit', label: 'Edit' },
];
const tabsForViewer = [
  { value: 'details', label: 'Details' },
  { value: 'posts', label: 'Posts' },
];
const FollowStyledButton = styled(RoundButton)`
  width: 21.125rem;
  border: 1px solid #3A3B46;
  &:hover, &:focus{
    border: 1px solid #3A3B46;
  }
`;
function AboutMovie() {
  const [searchParams] = useSearchParams();
  const selfView = searchParams.get('view') === 'self';
  const tabs = selfView ? tabsForSelf : tabsForViewer;
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (params.summary === 'edit' && !selfView) { navigate(`/movies/${params.id}/details`); }
  });
  const [bgColor, setBgColor] = useState<boolean>(false);
  const [movieIconListData, setMovieIconListData] = useState(MovieIconList);
  const handleMovieAddRemove = (labelName: string) => {
    const tempMovieIconList = [...movieIconListData];
    tempMovieIconList.map((iconList) => {
      const tempMovieIcon = iconList;
      if (tempMovieIcon.label === labelName) {
        tempMovieIcon.addMovie = !tempMovieIcon.addMovie;
      }
      return tempMovieIcon;
    });
    setMovieIconListData(tempMovieIconList);
  };
  return (
    <div>
      <div className="bg-dark my-3 p-4 pb-0 rounded-2">
        <Row className="justify-content-center">
          <Col xs={6} sm={5} md={4} lg={6} xl={5} className="text-center">
            <StyledMoviePoster className="mx-4">
              <Image src={MovieDetailPoster} className="rounded-3 w-100 h-100" />
            </StyledMoviePoster>
            <div className="d-none d-xl-block mt-3">
              <p className="fs-5">Your lists</p>
              <div className="mt-2 d-flex justify-content-between">
                {movieIconListData.map((iconList: MovieIconProps) => (
                  <ListIcon
                    key={iconList.label}
                    label={iconList.label}
                    icon={iconList.icon}
                    iconColor={iconList.iconColor}
                    width={iconList.width}
                    height={iconList.height}
                    addMovie={iconList.addMovie}
                    onClickIcon={() => handleMovieAddRemove(iconList.label)}
                  />
                ))}
              </div>
            </div>
          </Col>
          <Col xl={7}>
            <AboutDetails />
          </Col>
        </Row>
        <Row className="d-xl-none justify-content-center mt-4 mt-xl-2">
          <Col xs={10} sm={7} md={5} lg={9} className="text-center">
            <span className="fs-5">Your lists</span>
            <div className="mt-2 d-flex justify-content-around">
              {movieIconListData.map((iconList: MovieIconProps) => (
                <ListIcon
                  key={iconList.label}
                  label={iconList.label}
                  icon={iconList.icon}
                  iconColor={iconList.iconColor}
                  width={iconList.width}
                  height={iconList.height}
                  addMovie={iconList.addMovie}
                  onClickIcon={() => handleMovieAddRemove(iconList.label)}
                />
              ))}
            </div>
          </Col>
        </Row>
        <Row className="d-lg-none mt-3 text-center">
          <Col xs={12}>
            <p className="text-center fw-bold">Get updates for this movie</p>
            <FollowStyledButton variant="lg" onClick={() => setBgColor(!bgColor)} className={`rounded-pill ${bgColor ? 'bg-primary border-primary' : 'bg-black'}`}>
              {bgColor ? 'Follow' : 'Unfollow'}
            </FollowStyledButton>
          </Col>
        </Row>
        <Row className="align-items-center justify-content-center mt-4 d-lg-none">
          <Col sm={5}>
            <div className="align-items-center d-flex justify-content-evenly">
              <span className="mb-2">Push notifications</span>
              <Switch id="pushNotificationsSwitch" className="ms-4" />
            </div>
          </Col>
        </Row>
        <Row className="justify-content-center justify-content-xl-start">
          <Col xs={12} md={6} lg={selfView ? 10 : 12} xl={9}>
            <TabLinks tabLink={tabs} toLink={`/movies/${params.id}`} selectedTab={params.summary} params={selfView ? '?view=self' : ''} />
          </Col>
        </Row>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="details" replace />} />
        <Route
          path="details"
          element={(
            <>
              <MovieOverview />
              <MovieCasts />
              <MovieTrailers />
              <MovieComments />
            </>
          )}
        />
        <Route path="posts" element={<MoviePosts />} />
        <Route path="edit" element={<MovieEdit />} />
      </Routes>
    </div>
  );
}

export default AboutMovie;
