import React, { useState } from 'react';
import {
  Col, Image, Row,
} from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
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

const ImageContainer = styled.div`
  aspectRatio: '1.78'
`;
const StyledBorder = styled.div`
  border-top: .063rem solid #3A3B46
`;
const FollowStyledButton = styled(RoundButton)`
width: 21.125rem;
border: 0.063rem solid #3A3B46;
  &: hover, &:focus{
  border: 0.063rem solid #3A3B46;
}
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
  const [isFavorite, setFavorite] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const tabs = queryParam === 'self' ? tabsForSelf : tabsForViewer;
  const navigate = useNavigate();
  const params = useParams();
  const changeTab = (tab: string) => {
    if (!queryParam || queryParam !== 'self') {
      navigate(`/places/1/${tab}`);
    } else {
      navigate(`/places/1/${tab}?view=self`);
    }
  };
  const handleToggle = () => {
    setFavorite(!isFavorite);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="place">
      <RoundButton className="d-lg-none w-100 my-3 fs-3 fw-bold">Add your place</RoundButton>
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
        <StyledBorder className="d-block d-lg-none my-4" />
        <Row className="mt-3 mb-2 text-center d-lg-none">
          <Col xs={12}>
            <p className="text-center fw-bold">Get updates for this book</p>
            <FollowStyledButton onClick={() => setBgColor(!bgColor)} className={`rounded-pill  shadow-none ${bgColor ? 'bg-primary border-primary' : 'bg-black text-white'} `}>
              {bgColor ? 'Follow' : 'Unfollow'}
            </FollowStyledButton>
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
        <Row>
          <Col md={4} lg={12} xl={5}>
            <TabLinks tabLink={tabs} setSelectedTab={changeTab} selectedTab={params.id} className="justify-content-around justify-content-md-start" />
          </Col>
        </Row>
      </div>
      {params.id === 'posts' && <PlacesPosts />}
      {params.id === 'photos' && <PlacesPhotos />}
      {params.id === 'edit' && <PlacesEdit />}
    </AuthenticatedPageWrapper>
  );
}

export default PlacesDetails;
