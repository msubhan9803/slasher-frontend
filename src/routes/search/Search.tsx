import React from 'react';
import {
  Col, Row, Tab, Tabs,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import SearchInput from './SearchInput';
import Hashtags from './component/Hashtags';
import {
  events, hashtags, myMovies, people, posts,
} from './SearchResult';
import People from './component/People';
import Movies from './component/Movies';
import Events from './component/Events';
import Posts from './component/Posts';

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

function Search() {
  return (
    <AuthenticatedPageWrapper>
      <Row>
        <Col md={8}>
          <SearchInput />
          <StyleTabs className="justify-content-between flex-nowrap">
            <Tab eventKey="users" title="People">
              <Row>
                {people.length > 0 && (people.map((ppl: any) => (
                  <Col md={6} lg={4} key={ppl.name}>
                    <People people={ppl} />
                  </Col>
                )))}
              </Row>
            </Tab>
            <Tab eventKey="posts" title="Posts">
              <Row>
                {posts.length > 0 && (posts.map((post) => (
                  <Col xs={12} key={post.id}>
                    <Posts post={post} />
                  </Col>
                )))}
              </Row>
            </Tab>
            <Tab eventKey="hashtags" title="Hashtags">
              <Row>
                {hashtags.length > 0 && (hashtags.map((hashtag: any) => (
                  <Col md={6} lg={4} key={hashtag.name}>
                    <Hashtags hashtag={hashtag} />
                  </Col>
                )))}
              </Row>
            </Tab>
            <Tab eventKey="news" title="News">
              News
            </Tab>
            <Tab eventKey="events" title="Events">
              <Row className="justify-content-evenly mx-3 mx-sm-0">
                {events.length > 0 && (events.map((event: any) => (
                  <Col sm={5} key={event.id} className="bg-dark my-3 p-4 rounded-3">
                    <Events event={event} />
                  </Col>
                )))}
              </Row>
            </Tab>
            <Tab eventKey="movies" title="Movies">
              <Row>
                {myMovies.length > 0 && (myMovies.map((movie: any) => (
                  <Col xs={6} sm={4} lg={3} key={movie.id}>
                    <Movies movie={movie} />
                  </Col>
                )))}
              </Row>
            </Tab>
          </StyleTabs>
        </Col>
      </Row>

    </AuthenticatedPageWrapper>
  );
}

export default Search;
