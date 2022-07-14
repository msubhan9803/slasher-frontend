import React, { useState } from 'react';
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
import { SearchProps } from './SearchInterface';

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
  const [data, setData] = useState<SearchProps[]>(people);
  const [filtered, setFiltered] = useState<SearchProps[]>(people);
  const [selectedTab, setSelectedTab] = useState('People');
  const [message, setMessage] = useState('');

  const handleTabs = (tab: any) => {
    const setTab = tab.target.innerText;
    setSelectedTab(setTab);
    if (setTab === 'People') { setFiltered(people); setData(people); }
    if (setTab === 'Posts') { setFiltered(posts); setData(posts); }
    if (setTab === 'Hashtags') { setFiltered(hashtags); setData(hashtags); }
    if (setTab === 'News') { setFiltered(posts); setData(posts); }
    if (setTab === 'Events') { setFiltered(events); setData(events); }
    if (setTab === 'Movies') { setFiltered(myMovies); setData(myMovies); }
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <SearchInput
        filtered={filtered}
        setFiltered={setFiltered}
        data={data}
        selectedTab={selectedTab}
        setMessage={setMessage}
      />
      <StyleTabs onClick={handleTabs} onKeyDown={handleTabs} className="justify-content-between flex-nowrap">
        <Tab eventKey="people" title="People">
          <Row>
            {filtered && filtered.length > 0 ? (filtered?.map((peopleDetail) => (
              <Col md={6} lg={4} key={peopleDetail.id}>
                <People
                  id={peopleDetail.id}
                  name={peopleDetail.name}
                  image={peopleDetail.image}
                  email={peopleDetail.email}
                />
              </Col>
            ))) : (
              <h1 className="h4 my-5 text-center">{message}</h1>
            )}
          </Row>
        </Tab>
        <Tab eventKey="posts" title="Posts">
          <Row>
            {filtered && filtered.length > 0 ? (filtered.map((postDetail) => (
              <Col xs={12} key={postDetail.id}>
                <Posts
                  id={postDetail.id}
                  name={postDetail.name}
                  image={postDetail.image}
                  date={postDetail.date}
                  content={postDetail.content}
                  hashTag={postDetail.hashTag}
                />
              </Col>
            ))) : (
              <h1 className="h4 my-5 text-center">{message}</h1>
            )}
          </Row>
        </Tab>
        <Tab eventKey="hashtags" title="Hashtags">
          <Row>
            {filtered && filtered.length > 0 ? (filtered.map((hashtagDetail) => (
              <Col md={6} lg={4} key={hashtagDetail.id}>
                <Hashtags id={hashtagDetail.id} name={hashtagDetail.name} />
              </Col>
            ))) : (
              <h1 className="h4 my-5 text-center">{message}</h1>
            )}
          </Row>
        </Tab>
        <Tab eventKey="news" title="News">
          <Row>
            {filtered && filtered.length > 0 ? (filtered.map((postDetail) => (
              <Col xs={12} key={postDetail.id}>
                <Posts
                  id={postDetail.id}
                  name={postDetail.name}
                  image={postDetail.image}
                  date={postDetail.date}
                  content={postDetail.content}
                  hashTag={postDetail.hashTag}
                />
              </Col>
            ))) : (
              <h1 className="h4 my-5 text-center">{message}</h1>
            )}
          </Row>
        </Tab>
        <Tab eventKey="events" title="Events">
          <Row className="justify-content-evenly mx-3 mx-sm-0">
            {filtered && filtered.length > 0 ? (filtered.map((eventDetail) => (
              <Col sm={5} key={eventDetail.id} className="">
                <Events
                  id={eventDetail.id}
                  name={eventDetail.name}
                  image={eventDetail.image}
                  date={eventDetail.date}
                  address={eventDetail.address}
                />
              </Col>
            ))) : (
              <h1 className="h4 my-5 text-center">{message}</h1>
            )}
          </Row>
        </Tab>
        <Tab eventKey="movies" title="Movies">
          <Row className="my-3 mx-0">
            {filtered && filtered.length > 0 ? (filtered.map((movieDetail) => (
              <Col xs={4} sm={3} lg={3} key={movieDetail.id}>
                <Movies
                  id={movieDetail.id}
                  name={movieDetail.name}
                  image={movieDetail.image}
                  year={movieDetail.year}
                  liked={movieDetail.liked}
                />
              </Col>
            ))) : (
              <h1 className="h4 my-5 text-center">{message}</h1>
            )}
          </Row>
        </Tab>
      </StyleTabs>

    </AuthenticatedPageWrapper>
  );
}

export default Search;
