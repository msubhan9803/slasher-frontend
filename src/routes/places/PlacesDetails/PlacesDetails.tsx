import React, { useEffect, useState } from 'react';
import {
  Col, Image, Row,
} from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import postImage from '../../../images/places-post.jpg';
import PlaceAbout from './PlaceAbout';
import PlacesPosts from '../PlacesPosts.tsx/PlacesPosts';
import PlacesPhotos from '../PlacesPhotos/PlacesPhotos';
import PlacesEdit from '../PlacesEdit.tsx/PlacesEdit';
import PlaceDetailSmallScreen from './PlaceDetailSmallScreen';
import PlacesDetailLargeScreen from './PlacesDetailLargeScreen';
import RoundButton from '../../../components/ui/RoundButton';
import Switch from '../../../components/ui/Switch';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import PlaceRightSidebar from '../PlaceRightSidebar';
import BorderButton from '../../../components/ui/BorderButton';
import { StyledBorder } from '../../../components/ui/StyledBorder';
import SticyBannerAdSpaceCompensation from '../../../components/SticyBannerAdSpaceCompensation';

const ImageContainer = styled.div`
  acpect-ratio: '1.78'
`;
const tabsForSelf = [
  { value: 'posts', label: 'Posts' },
  { value: 'photos', label: 'Photos' },
  { value: 'edit', label: 'Edit' },
];
const tabsForViewer = [
  { value: 'posts', label: 'Posts' },
  { value: 'photos', label: 'Photos' },
];

function PlacesDetails() {
  const navigate = useNavigate();
  const [isFavorite, setFavorite] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const tabs = queryParam === 'self' ? tabsForSelf : tabsForViewer;
  const params = useParams();
  const handleToggle = () => {
    setFavorite(!isFavorite);
  };
  useEffect(() => {
    if (params.summary === 'edit' && queryParam !== 'self') { navigate(`/places/${params.id}/posts`); }
  });
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <RoundButton className="d-lg-none w-100 my-3">Add your place</RoundButton>
        <div className="bg-dark rounded p-4 pb-0">
          <ImageContainer>
            <Image src={postImage} alt="Banner image" className="w-100 rounded" />
          </ImageContainer>

          <div className="d-none d-md-block d-lg-none d-xl-block">
            <PlacesDetailLargeScreen
              toggle={isFavorite}
              onToggleClick={handleToggle}
            />
          </div>

          <div className="d-md-none d-lg-block d-xl-none">
            <PlaceDetailSmallScreen
              toggle={isFavorite}
              onToggleClick={handleToggle}
            />
          </div>

          <StyledBorder className="d-md-block d-none d-lg-none d-xl-block my-4" />
          <PlaceAbout />
          {queryParam !== 'self'
            && (
              <>
                <StyledBorder className="d-block d-lg-none my-4" />
                <Row className="mt-3 mb-2 text-center d-lg-none">
                  <Col xs={12}>
                    <p className="text-center fw-bold">Get updates for this book</p>
                    <BorderButton
                      customButtonCss="width: 21.125rem !important;"
                      buttonClass="shadow-none"
                      toggleBgColor={bgColor}
                      handleClick={setBgColor}
                      toggleButton
                    />
                  </Col>
                </Row>
                <Row className="align-items-center justify-content-center mt-4 mb-2 d-lg-none">
                  <Col sm={5}>
                    <div className="align-items-center d-flex justify-content-center">
                      <span className="mb-2">Push notifications</span>
                      <Switch id="pushNotificationsSwitch" className="ms-4" />
                    </div>
                  </Col>
                </Row>
              </>
            )}
          <Row className="justify-content-center justify-content-xl-start">
            <Col md={4} lg={12} xl={5}>
              <TabLinks tabsClass="start" tabsClassSmall="center" tabLink={tabs} toLink={`/places/${params.id}`} selectedTab={params.summary} params={queryParam === 'self' ? '?view=self' : ''} />
            </Col>
          </Row>
        </div>
        {params.summary === 'posts' && <PlacesPosts />}
        {params.summary === 'photos' && <PlacesPhotos />}
        {params.summary === 'edit' && <PlacesEdit />}
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>

      <RightSidebarWrapper>
        <PlaceRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default PlacesDetails;
