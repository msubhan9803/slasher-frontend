import React, { useEffect, useState } from 'react';
import {
  Col, Image, Row,
} from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import bannerImage from '../../../images/shopping-about.png';
import RoundButton from '../../../components/ui/RoundButton';
import Switch from '../../../components/ui/Switch';
import ShoppingDetailLargeScreen from './ShoppingDetailLargeScreen';
import ShoppingAbout from './ShoppingAbout';
import ShoppingPosts from '../ShoppingPosts/ShoppingPosts';
import ShoppingPhotos from '../ShoppingPhotos/ShoppingPhotos';
import ShoppingEdit from '../ShoppingEdit/ShoppingEdit';
import ShoppingSpecialOffer from '../ShoppingSpecialOffer/ShoppingSpecialOffer';
import ShoppingDetailSmallScreen from './ShoppingDetailSmallScreen';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import ShoppingRightSidebar from '../ShoppingRightSidebar';
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
  { value: 'shopping-offer', label: 'Special offer' },
];
const tabsForViewer = [
  { value: 'posts', label: 'Posts' },
  { value: 'photos', label: 'Photos' },
];

function ShoppingDetails() {
  const [isFavorite, setFavorite] = useState<boolean>(false);
  const [bgColor, setBgColor] = useState<boolean>(false);

  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const tabs = queryParam === 'self' ? tabsForSelf : tabsForViewer;
  const navigate = useNavigate();
  const params = useParams();
  useEffect(() => {
    if ((params.summary === 'edit' || params.summary === 'shopping-offer') && queryParam !== 'self') {
      navigate(`/shopping/${params.id}/posts`);
    }
  }, [params, queryParam, navigate]);

  const handleToggle = () => {
    setFavorite(!isFavorite);
  };
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        <RoundButton className="d-lg-none w-100 my-3">Become a vendor</RoundButton>
        <div className="bg-dark rounded p-4 pb-0">
          <ImageContainer>
            <Image src={bannerImage} alt="Banner image" className="w-100 rounded" />
          </ImageContainer>

          <div className="d-none d-md-block d-lg-none d-xl-block">
            <ShoppingDetailLargeScreen
              toggle={isFavorite}
              onToggleClick={handleToggle}
            />
          </div>

          <div className="d-md-none d-lg-block d-xl-none">
            <ShoppingDetailSmallScreen
              toggle={isFavorite}
              onToggleClick={handleToggle}
            />
          </div>
          <StyledBorder className="d-block mt-3 mb-4" />
          <h1 className="h2 mb-3">Special offer</h1>
          <div className="d-block d-md-flex d-lg-block d-xl-flex justify-content-between">
            <div className="d-flex">
              <FontAwesomeIcon icon={solid('tag')} size="lg" className="me-2 text-primary" />
              <h1 className="text-primary h4 mb-0">50% discount on new orders / buy now this is!</h1>
            </div>
            <div className="d-flex">
              <div className="mx-2 pe-2" />
              <p className="fs-4 mb-0">Offer code: T48VZHMLD3RV94</p>
            </div>
            <div className="d-flex">
              <div className="mx-2 pe-2" />
              <p className="fs-4 mb-0">Expires: 05/06/2022</p>
            </div>
          </div>
          <StyledBorder className=" my-4" />
          <ShoppingAbout />
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
              </>
            )}
          {queryParam !== 'self'
            && (
              <Row className="align-items-center justify-content-center mt-4 mb-2 d-lg-none">
                <Col sm={5}>
                  <div className="align-items-center d-flex justify-content-center">
                    <span className="mb-2">Push notifications</span>
                    <Switch id="pushNotificationsSwitch" className="ms-4" />
                  </div>
                </Col>
              </Row>
            )}
          <Row className="justify-content-center justify-content-xl-start">
            <Col md={5} lg={12} xl={6}>
              <TabLinks tabsClass="start" tabsClassSmall="center" tabLink={tabs} toLink={`/shopping/${params.id}`} selectedTab={params.summary} params={queryParam === 'self' ? '?view=self' : ''} />
            </Col>
          </Row>
        </div>
        {params.summary === 'posts' && <ShoppingPosts />}
        {params.summary === 'photos' && <ShoppingPhotos />}
        {params.summary === 'edit' && <ShoppingEdit />}
        {params.summary === 'shopping-offer' && <ShoppingSpecialOffer />}
        <SticyBannerAdSpaceCompensation />
      </ContentPageWrapper>

      <RightSidebarWrapper>
        <ShoppingRightSidebar />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}

export default ShoppingDetails;
