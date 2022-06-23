import React from 'react';
import {
  Col,
  Row,
  Tab,
  Tabs,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';

const StyleTabs = styled(Tabs)`
  border-bottom: 3px solid #1F1F1F;
  overflow-x: auto;
  overflow-y: hidden;
  .nav-link {
    &:hover {
      border-color: transparent;
      color: var(--bs-primary);
    }
    &.active {
      color: var(--bs-primary);
      background-color: transparent;
      border: none;
      border-bottom: 3px solid var(--bs-primary);
      position: relative;
      bottom: -2px;
    }
  }

`;

const StyledHastagsCircle = styled.div`
  border-radius: 50%;
  height:60px;
  width:60px;
`;

function Search() {
  const hastags = [
    'horror',
    'horrorcommunty',
    'horrorfan',
    'horrormovies',
    'horrorgram',
    'horrorlover',
    'horroraddict',
    '80sslasher', 'horrorlife',
    'horrorgirls',
    'horrorvideo',
    'horrorshirt'];
  return (
    <AuthenticatedPageWrapper>
      <h1 className="h3 mb-4">
        Result for&nbsp;
        <span className="text-primary">
          &#34;horror&#34;
        </span>
      </h1>
      <StyleTabs className="justify-content-between flex-nowrap">
        <Tab eventKey="users" title="Users">
          Users
        </Tab>
        <Tab eventKey="hastags" title="Hastags">
          <Row>
            {hastags.map((hastag: string) => (
              <Col md={6} lg={4}>
                <Row className="py-4 align-items-center">
                  <Col xs={3} sm={2} lg={4}>
                    <StyledHastagsCircle className="ms-md-2 align-items-center bg-primary d-flex fs-1 justify-content-around fw-light">#</StyledHastagsCircle>
                  </Col>
                  <Col xs={9} sm={10} md={8} className="ps-0 ps-md-3 ps-xl-0">
                    <h2 className="h5 mb-0">
                      #
                      {hastag}
                    </h2>
                    <p className="small text-light mb-0">24.3M posts</p>
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
        </Tab>
        <Tab eventKey="news" title="News">
          News
        </Tab>
        <Tab eventKey="posts" title="Posts">
          Posts
        </Tab>
        <Tab eventKey="events" title="Events">
          Events
        </Tab>
        <Tab eventKey="movies" title="Movies">
          Movies
        </Tab>
      </StyleTabs>

    </AuthenticatedPageWrapper>
  );
}

export default Search;
