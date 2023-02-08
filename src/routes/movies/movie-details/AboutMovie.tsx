/* eslint-disable max-lines */
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
import Switch from '../../../components/ui/Switch';
import AboutDetails from './AboutDetails';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import MovieOverview from './MovieOverview';
import MovieCasts from './MovieCasts';
import MovieTrailers from './MovieTrailers';
import MovieEdit from '../movie-edit/MovieEdit';
import MoviePosts from '../movie-posts/MoviePosts';
import { AdditionalMovieData } from '../../../types';
import RoundButton from '../../../components/ui/RoundButton';
import BorderButton from '../../../components/ui/BorderButton';
import CustomGroupIcons from '../../../components/ui/CustomGroupIcons';
import { StyledBorder } from '../../../components/ui/StyledBorder';
import { MOVIE_INDIE_DIV } from '../../../utils/pubwise-ad-units';
import PubWiseAd from '../../../components/ui/PubWiseAd';

interface MovieIconProps {
  label: string;
  icon: IconDefinition;
  iconColor: string;
  margin?: string;
  width: string;
  height: string;
  addMovie: boolean;
}
interface AboutMovieData {
  aboutMovieData: AdditionalMovieData
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

function AboutMovie({ aboutMovieData }: AboutMovieData) {
  const [searchParams] = useSearchParams();
  const selfView = searchParams.get('view') === 'self';
  const tabs = selfView ? tabsForSelf : tabsForViewer;
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if (params['*'] === 'edit' && !selfView) { navigate(`/movies/${params.id}/details`); }
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
              <Image src={aboutMovieData?.mainData?.poster_path} className="rounded-3 w-100 h-100" />
            </StyledMoviePoster>
          </Col>
          <Col xl={7}>
            <AboutDetails aboutMovieDetail={aboutMovieData as AdditionalMovieData} />
          </Col>
        </Row>
        <Row>
          <Col xs={6} sm={5} md={4} lg={6} xl={5} className="text-center">
            <div className="d-none d-xl-block mt-3">
              <p className="fs-5">Your lists</p>
              <div className="mt-2 d-flex justify-content-between">
                {movieIconListData.map((iconList: MovieIconProps) => (
                  <CustomGroupIcons
                    key={iconList.label}
                    label={iconList.label}
                    icon={iconList.icon}
                    iconColor={iconList.iconColor}
                    width={iconList.width}
                    height={iconList.height}
                    addData={iconList.addMovie}
                    onClickIcon={() => handleMovieAddRemove(iconList.label)}
                  />
                ))}
              </div>
            </div>
            <div className="p-3 d-none d-xl-block">
              <RoundButton variant="black" className="w-100 fs-3">Add to list</RoundButton>
            </div>
          </Col>
        </Row>
        <Row className="d-xl-none justify-content-center mt-3">
          <Col xs={12} sm={7} md={5} lg={9} className="text-center">
            <span className="fs-5">Your lists</span>
            <div className="mt-2 d-flex justify-content-around">
              {movieIconListData.map((iconList: MovieIconProps) => (
                <CustomGroupIcons
                  key={iconList.label}
                  label={iconList.label}
                  icon={iconList.icon}
                  iconColor={iconList.iconColor}
                  width={iconList.width}
                  height={iconList.height}
                  addData={iconList.addMovie}
                  onClickIcon={() => handleMovieAddRemove(iconList.label)}
                />
              ))}
            </div>
            <div className="p-3 d-xl-none justify-content-center mt-xl-2">
              <RoundButton variant="black" className="w-100 fs-3">Add to list</RoundButton>
            </div>
          </Col>
        </Row>
        <Row className="d-lg-none text-center">
          <StyledBorder />
          <Col xs={12}>
            <p className="text-center fw-bold  mt-3">Get updates for this movie</p>
          </Col>
          <Col xs={12} sm={7} md={5} className="m-auto">
            <BorderButton
              customButtonCss="width: 21.125rem !important;"
              buttonClass=""
              variant="lg"
              toggleBgColor={bgColor}
              handleClick={setBgColor}
              toggleButton
            />
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
            <TabLinks tabsClass="start" tabsClassSmall="center" tabLink={tabs} toLink={`/movies/${params.id}`} selectedTab={params['*']} params={selfView ? '?view=self' : ''} />
          </Col>
        </Row>
      </div>

      <Routes>
        <Route path="/" element={<Navigate to="details" replace />} />
        <Route
          path="details"
          element={(
            <>
              <MovieOverview overView={aboutMovieData?.mainData?.overview} />
              <PubWiseAd className="text-center my-3" id={MOVIE_INDIE_DIV} autoSequencer />
              <MovieCasts castList={aboutMovieData?.cast as any} />
              {
                aboutMovieData?.video?.length > 0
                && <MovieTrailers trailerList={aboutMovieData && aboutMovieData.video as any} />
              }
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
