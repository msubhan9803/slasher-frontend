import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Container, FormControl, InputGroup, Row, Tab, Tabs,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../components/ui/RoundButton';
import MoviesRightSideNav from './components/MoviesRightSideNav';
import MoviesFilterOptions from './components/MoviesFilterOptions';
import MoviesData from './components/MoviesData';

const StyledInputGroup = styled(InputGroup)`
  .form-control {
    border-left: 1px solid var(--bs-input-border-color);
    border-bottom-right-radius: 30px;
    border-top-right-radius: 30px;
  }
  .input-group-text {
    background-color: rgb(31, 31, 31);
    border-color: #3a3b46;
    border-radius: 30px;
  }
  svg {
    color: var(--bs-primary);
    min-width: 30px;
  }
`;
const StyleTabs = styled(Tabs)`
  overflow-x: auto;
  overflow-y: hidden;
  .nav-link {
    border: none;
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

function Movies() {
  const tabs = [
    { value: 'myMovies', label: 'My Movies' },
    { value: 'slasherIndie', label: 'Slasher Indie' },
    { value: 'favoritesList', label: 'Favorites list' },
    { value: 'watchList', label: 'Watch list' },
    { value: 'watchedList', label: 'Watched list' },
    { value: 'buyList', label: 'Buy list' },
  ];
  const myMovies = [
    {
      id: 1, image: 'https://i.pravatar.cc/300?img=19', name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
    {
      id: 2, image: 'https://i.pravatar.cc/300?img=13', name: 'The Djinn', year: '2022', liked: false,
    },
    {
      id: 3, image: 'https://i.pravatar.cc/300?img=15', name: 'Ghost Lab', year: '2022', liked: true,
    },
    {
      id: 4, image: 'https://i.pravatar.cc/300?img=15', name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
    {
      id: 5, image: 'https://i.pravatar.cc/300?img=15', name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
    {
      id: 6, image: 'https://i.pravatar.cc/300?img=13', name: 'The Djinn', year: '2022', liked: false,
    },
    {
      id: 7, image: 'https://i.pravatar.cc/300?img=15', name: 'Ghost Lab', year: '2022', liked: true,
    },
    {
      id: 8, image: 'https://i.pravatar.cc/300?img=15', name: 'Dreamcatcher: Get ready for a killer night out', year: '2022', liked: true,
    },
  ];
  const [selectedTab, setSelectedTab] = useState(tabs[0].value);
  return (
    <AuthenticatedPageWrapper>
      <Container fluid>
        <Row>
          <Col md={8}>
            <Row className="justify-content-between align-items-start mb-4">
              <Col md={2}>
                <h1 className="h4 text-center mb-0">Movies</h1>
              </Col>
              <Col md={7} lg={5} className="d-none d-md-block">
                <RoundButton className="w-100">Add your movie</RoundButton>
              </Col>
            </Row>
            <Row className="bg-dark pb-0 pt-3 px-2 rounded-3">
              <Col xs={12}>
                <StyledInputGroup>
                  <InputGroup.Text id="addon-label" className="pe-0">
                    <FontAwesomeIcon icon={solid('magnifying-glass')} className="text-white" size="lg" />
                  </InputGroup.Text>
                  <FormControl
                    placeholder="Search here..."
                    addon-label="Search here..."
                    aria-describedby="addon-label"
                    type="text"
                  />
                </StyledInputGroup>
                <StyleTabs
                  className="justify-content-between flex-nowrap mt-3 border-0"
                  onSelect={(e: any) => setSelectedTab(e)}
                >
                  {tabs.map(({ value, label }) => (
                    <Tab key={value} eventKey={value} title={label} />
                  ))}
                </StyleTabs>
              </Col>
            </Row>
            <MoviesFilterOptions />
            <MoviesData selectedTab={selectedTab} myMovies={myMovies} />
          </Col>
          <Col md={4} className="d-none d-md-block">
            <MoviesRightSideNav />
          </Col>
        </Row>
      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default Movies;
