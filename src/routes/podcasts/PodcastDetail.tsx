import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import {
  Col, Image, Row, Tab, Tabs,
} from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../components/ui/RoundButton';
import Switch from '../../components/ui/Switch';
import PodcastPoster from '../../images/podcast-poster.jpg';
import PodcastEpisodes from './PodcastEpisodes';

interface QueryParamProps {
  queryParam: boolean
}
const StyledPodcastPoster = styled(Image)`
  aspect-ratio: 1;
`;
const StyleBorderButton = styled(RoundButton)`
  border: 0.063rem solid #3A3B46;
  &:hover {
    border: 0.063rem solid #3A3B46;
  }
`;
const StyledIcons = styled(FontAwesomeIcon)`
  &.star {
    color: #FF8A00;
    width: 1.638rem;
    height: 1.563rem;
  }
`;
const StyleTabs = styled(Tabs) <QueryParamProps>`
  border-bottom: 0.2rem solid var(--bs-dark);
  overflow-x: auto;
  overflow-y: hidden;
  .nav-item {
    ${(props) => !props.queryParam && 'margin-right: 2rem; flex-grow: 0;'};
    .nav-link {
      padding-bottom: 1rem !important;
      border: none;
      color: #ffffff;
      &:hover {
        border-color: transparent;
        color: var(--bs-primary);
      }
      &.active {
        color: var(--bs-primary);
        background-color: transparent;
        border-bottom:  0.222rem solid var(--bs-primary);
      }
      .btn {
        ${(props) => !props.queryParam && 'width: max-content;'};
      }
    }
  }

  @media (max-width: 992px) {
    .nav-item {
      ${(props) => !props.queryParam && 'margin-right: 0; flex-grow: 1;'};
      .btn {
        ${(props) => (!props.queryParam ? 'width: 100%;' : 'width: 75%')};
      } 
    }
  }

`;
const episodeData = [
  {
    id: 1,
    userName: 'The No Sleep Podcast',
    podcastImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    podcast: 'NoSleep Podcast S6E25 - Season Finale',
    episodeTimeWise: '22 min',
    content: 'It’s episode 25 – the Season Finale of Season 6. We conclude our season with four tales about otherworldly visions surrounding our reality.',
    likeIcon: false,
  },
  {
    id: 2,
    userName: 'The No Sleep Podcast',
    podcastImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    podcast: 'NoSleep Podcast S6E25 - Season Finale',
    episodeTimeWise: '22 min',
    content: 'It’s episode 25 – the Season Finale of Season 6. We conclude our season with four tales about otherworldly visions surrounding our reality.',
    likeIcon: false,
  },
];

function PodcastDetail() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const [bgColor, setBgColor] = useState<boolean>(false);
  return (
    <AuthenticatedPageWrapper rightSidebarType="podcast">
      <div className="bg-dark rounded p-4 pb-0">
        <Row className="mb-3">
          <Col xl={4} xxl={3} className="text-center">
            <StyledPodcastPoster className="rounded-3 me-xl-4" src={PodcastPoster} alt="podcast poster" />
          </Col>
          <Col xl={8} xxl={9} className="text-center text-xl-start mt-3 mt-xl-0">
            <h1 className="h2">The No Sleep Podcast</h1>
            <p className="fs-4 text-light px-5 mx-5 me-xl-5 pe-xl-5 text-center text-xl-start">
              In publishing and graphic design, Lorem ipsum is a placeholder
              text commonly used to demonstrate the visual form of a document
              or a typeface without.
            </p>
            <p className="h4 mb-4">
              <span className="fw-normal text-light">
                Number of episodes:&nbsp;
              </span>
              2.8K
            </p>
            <p className="fs-3 fw-bold mb-2 mb-xl-1">Rating</p>
            <div className="d-block d-xl-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center justify-content-center">
                <span className="fs-3 me-3 me-xxl-2 align-items-center d-flex justify-content-end justify-content-xl-start">
                  <StyledIcons icon={solid('star')} size="xs" className="star mb-2 mt-1" />
                  <div className="d-flex">
                    <p className="fw-bold m-0 mx-2">3.3/5</p>
                    <p className="m-0 text-light me-xxl-2">(10K)</p>
                  </div>
                </span>
                <StyleBorderButton className="d-flex align-items-center rate-btn bg-black py-2 px-4" variant="lg">
                  <FontAwesomeIcon icon={regular('star')} size="sm" className="mb-1 me-2" />
                  <p className="fs-3 fw-bold m-0">Rate</p>
                </StyleBorderButton>
              </div>
              <StyleBorderButton className="mx-auto mb-2 mt-4 mt-xl-0 d-flex d-xxl-none align-items-center share-btn bg-black px-4 py-2" variant="lg">
                <FontAwesomeIcon icon={solid('share-nodes')} size="sm" className="me-2" />
                <p className="fs-3 fw-bold m-0">Share</p>
              </StyleBorderButton>
            </div>
            <div className="d-lg-none mt-4 text-center">
              <p className="fw-bold m-0 ">Get updates for this movie</p>
              <Row className="justify-content-center">
                <Col xs={10} sm={5}>
                  <StyleBorderButton onClick={() => setBgColor(!bgColor)} className={`my-3 w-100 rounded-pill shadow-none ${bgColor ? 'bg-primary border-primary' : 'bg-black'}`}>
                    {bgColor ? 'Follow' : 'Unfollow'}
                  </StyleBorderButton>
                  <div className="mb-2 lh-lg d-flex justify-content-center">
                    <span>Push notifications</span>
                    <Switch id="pushNotificationSwitch" className="ms-3" />
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
        <StyleTabs justify queryParam={queryParam === 'self'} className={`${queryParam === 'self' ? 'justify-content-between mx-3' : 'justify-content-center justify-content-xl-start'} fs-3 border-0`}>
          <Tab eventKey="episodes" title="Episodes" />
          <Tab eventKey="posts" title="Posts" />
        </StyleTabs>
      </div>

      <PodcastEpisodes episodeData={episodeData} />
    </AuthenticatedPageWrapper>
  );
}

export default PodcastDetail;
