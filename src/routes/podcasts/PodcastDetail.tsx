import React, { useEffect, useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Image, Row } from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import Switch from '../../components/ui/Switch';
import TabLinks from '../../components/ui/Tabs/TabLinks';
import PodcastPoster from '../../images/podcast-poster.jpg';
import PodcastEpisodes from './PodcastEpisodes';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import PodcastsSidebar from './components/PodcastsSidebar';
import RightSidebarWrapper from '../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import BorderButton from '../../components/ui/BorderButton';
import SticyBannerAdSpaceCompensation from '../../components/SticyBannerAdSpaceCompensation';

const StyledPodcastPoster = styled(Image)`
  aspect-ratio: 1;
`;
const StyledIcons = styled(FontAwesomeIcon)`
  &.star {
    color: var(--bs-orange);
    width: 1.638rem;
    height: 1.563rem;
  }
`;
const episodeData = [
  {
    id: '1',
    userName: 'The No Sleep Podcast',
    podcastImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    podcast: 'NoSleep Podcast S6E25 - Season Finale',
    episodeTimeWise: '22 min',
    message: 'It’s episode 25 – the Season Finale of Season 6. We conclude our season with four tales about otherworldly visions surrounding our reality.',
    likeIcon: false,
  },
  {
    id: '2',
    userName: 'The No Sleep Podcast',
    podcastImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    podcast: 'NoSleep Podcast S6E25 - Season Finale',
    episodeTimeWise: '22 min',
    message: 'It’s episode 25 – the Season Finale of Season 6. We conclude our season with four tales about otherworldly visions surrounding our reality.',
    likeIcon: false,
  },
];
const tabsForSelf = [
  { value: 'episodes', label: 'Episodes' },
  { value: 'posts', label: 'Posts' },
  { value: 'edit', label: 'Edit' },
];
const tabsForViewer = [
  { value: 'episodes', label: 'Episodes' },
  { value: 'posts', label: 'Posts' },
];
function PodcastDetail() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const [bgColor, setBgColor] = useState<boolean>(false);
  const tabs = queryParam === 'self' ? tabsForSelf : tabsForViewer;
  const navigate = useNavigate();
  const params = useParams();
  useEffect(() => {
    if (params.podcastId === 'edit' && queryParam !== 'self') { navigate(`/podcasts/${params.podcastId}/episodes`); }
  }, [params, navigate, queryParam]);
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <div className="bg-dark rounded p-4 pb-0">
          <div className="mb-3 text-center d-xl-flex">
            <div className="me-xl-4">
              <StyledPodcastPoster className="rounded-3" src={PodcastPoster} alt="podcast poster" />
            </div>
            <div className="text-center text-xl-start mt-3 mt-xl-0">
              <h1 className="h2">The No Sleep Podcast</h1>
              <Row className="justify-content-center justify-content-xl-start">
                <Col xs={10} sm={8} md={6} lg={8} xl={10}>
                  <p className="fs-4 text-light">
                    In publishing and graphic design, Lorem ipsum is a placeholder
                    text commonly used to demonstrate the visual form of a document
                    or a typeface without.
                  </p>
                </Col>
              </Row>
              <p className="h4 mb-4">
                <span className="fw-normal text-light">
                  Number of episodes:&nbsp;
                </span>
                2.8K
              </p>
              <p className="fw-bold mb-3 mb-xl-1">Rating</p>
              <Row className="justify-content-center justify-content-xl-between align-items-center">
                <Col xl={8}>
                  <div className="d-flex align-items-center justify-content-center justify-content-xl-start">
                    <span className="fs-3 me-3 me-xxl-2 align-items-center d-flex justify-content-end justify-content-xl-start">
                      <StyledIcons icon={solid('star')} size="xs" className="star mb-2 mt-1" />
                      <div className="d-flex">
                        <p className="fw-bold m-0 mx-2">3.3/5</p>
                        <p className="m-0 text-light me-xxl-2">(10K)</p>
                      </div>
                    </span>
                    <BorderButton
                      buttonClass="d-flex rate-btn px-4"
                      variant="lg"
                      icon={regular('star')}
                      iconClass="mb-1 me-2"
                      iconSize="sm"
                      lable="Rate"
                    />
                  </div>
                </Col>
                <Col xl={4}>
                  <BorderButton
                    buttonClass="mt-4 mt-xl-0 mx-auto me-xl-0 ms-xl-auto d-flex d-xxl-none px-4"
                    variant="lg"
                    icon={solid('share-nodes')}
                    iconClass="me-2"
                    iconSize="sm"
                    lable="Share"
                  />
                </Col>
              </Row>
              <div className="d-lg-none mt-4 text-center">
                <p className="fw-bold m-0">Get updates for this movie</p>
                <Row className="justify-content-center">
                  <Col xs={10} sm={5}>
                    <BorderButton
                      buttonClass="my-3 w-100 shadow-none"
                      toggleBgColor={bgColor}
                      handleClick={setBgColor}
                      toggleButton
                    />
                    <div className="mb-2 lh-lg d-flex justify-content-center">
                      <span>Push notifications</span>
                      <Switch id="pushNotificationSwitch" className="ms-3" />
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
          <Row className="justify-content-center justify-content-xl-start">
            <Col xs={12} md={6} lg={queryParam === 'self' ? 10 : 12} xl={9}>
              <TabLinks tabsClass="start" tabsClassSmall="center" tabLink={tabs} toLink={`/podcasts/${params.id}`} selectedTab={params.summary} params={queryParam === 'self' ? '?view=self' : ''} />
            </Col>
          </Row>
        </div>

        {params.summary === 'episodes' && <PodcastEpisodes episodeData={episodeData} />}
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <PodcastsSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default PodcastDetail;
