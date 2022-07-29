import React, { useState } from 'react';
import {
  Row, Image, Col, Tabs, Tab,
} from 'react-bootstrap';
import styled from 'styled-components';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import RoundButton from '../../../components/ui/RoundButton';
import Switch from '../../../components/ui/Switch';
import ListIcon from './ListIcon';
import AboutDetails from './AboutDetails';
import MoviePoster from '../../../images/movies-poster.svg';

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
const FollowStyledButton = styled(RoundButton)`
  width: 21.125rem;
  border: 0.063rem solid #3A3B46;
  &:hover, &:focus{
    border: 0.063rem solid #3A3B46;
  }
`;
function AboutMovie() {
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
      <div className="bg-dark my-3 p-3 pb-0 rounded-2">
        <Row className="justify-content-center">
          <Col xs={6} sm={5} md={4} lg={6} xl={5} className="text-center">
            <StyledMoviePoster className="mx-4">
              <Image src={MoviePoster} className="rounded-3 w-100 h-100" />
            </StyledMoviePoster>
            <div className="d-none d-xl-block mt-3">
              <small>Your lists</small>
              <div className="mt-2 d-flex justify-content-center">
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
            <div className="d-none d-xl-block">
              <StyleTabs className="justify-content-between px-2 border-0">
                <Tab eventKey="details" title="Details" />
                <Tab eventKey="posts" title="Posts" />
                <Tab eventKey="edit" title="Edit" />
              </StyleTabs>
            </div>
          </Col>
          <Col xl={7}>
            <AboutDetails />
          </Col>
        </Row>
        <Row className="d-xl-none justify-content-center mt-4 mt-xl-2">
          <Col xs={10} sm={7} md={5} lg={9} className="text-center">
            <small>Your lists</small>
            <div className="mt-2 d-flex justify-content-center">
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
            <FollowStyledButton variant="lg" onClick={() => setBgColor(!bgColor)} className={`rounded-pill shadow-none ${bgColor ? 'bg-primary border-primary' : 'bg-black'}`}>
              {bgColor ? 'Follow' : 'Unfollow'}
            </FollowStyledButton>
          </Col>
        </Row>
        <Row className="align-items-center justify-content-center mt-4 d-lg-none">
          <Col sm={5}>
            <div className="align-items-center d-flex justify-content-center">
              <span className="mb-2">Push notifications</span>
              <Switch id="pushNotificationsSwitch" className="ms-4" />
            </div>
          </Col>
        </Row>
        <Row className="d-xl-none">
          <Col xl={5}>
            <StyleTabs className="justify-content-between mt-3 px-2 border-0">
              <Tab eventKey="details" title="Details" />
              <Tab eventKey="posts" title="Posts" />
              <Tab eventKey="edit" title="Edit" />
            </StyleTabs>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AboutMovie;
