import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import Switch from '../../../components/ui/Switch';
import userImage from '../../../placeholder-images/placeholder-user.jpg';
import NewsPostData from '../components/NewsPostData';

const HeaderProfileImage = styled.img`
  height: 11.25rem;
  width: 11.25rem;
`;
const SmallText = styled.p`
  font-size: .938rem;
  color: #CCCCCC;
`;
const CustomButton = styled(RoundButton)`
  border: 0.063rem solid #3A3B46;
  &:focus {
    border: 0.063rem solid #3A3B46;
  }
  &:hover {
    border: 0.063rem solid #3A3B46;
  }
`;
function NewsPartnerDetail() {
  const [bgColor, setBgColor] = useState(false);

  return (
    <AuthenticatedPageWrapper rightSidebarType="news">
      <Row className="d-md-none">
        <Col xs={1}>
          <FontAwesomeIcon icon={solid('arrow-left')} size="2x" />
        </Col>
        <Col xs={11} md={12} className="text-center text-md-start">
          <h1 className="h3 mb-3">News Partner Detail</h1>
        </Col>
      </Row>
      <Row className="mb-5">
        <Col>
          <Row className="bg-dark rounded-3 mx-0">
            <Col md="auto" className="d-flex justify-content-center p-4 pb-3">
              <HeaderProfileImage src={userImage} className="rounded-2" />
            </Col>
            <Col md={7} className="pt-md-4 pt-md-2  pt-0 ps-md-0">
              <h2 className="text-center text-md-start h3 mt-md-3 mt-2  mt-md-0">Horror Oasis</h2>
              <SmallText className="text-center text-md-start m-2 m-md-0">
                Take a deep dive and try our list of over 40 unique generators,
                find placeholder images for your next design,
                or add a lorem ipsum plugin to the CMS or text editor of your choice.
              </SmallText>
            </Col>
            <Col className="d-md-none">
              <p className="fw-bold text-center my-3">Get updates for this movie</p>
              <div className="mt-3 mb-4">
                <CustomButton
                  onClick={() => setBgColor(!bgColor)}
                  className={`w-100  rounded-pill shadow-none ${bgColor ? 'bg-primary' : 'bg-black'}`}
                >
                  {bgColor ? 'Follow' : 'Unfollow'}
                </CustomButton>
              </div>
              <div className="my-4 lh-lg d-flex justify-content-center">
                <span>Push notifications</span>
                <Switch id="pushNotificationSwitches" className="ms-3" />
              </div>
            </Col>
          </Row>
          <NewsPostData />
        </Col>
      </Row>
    </AuthenticatedPageWrapper>
  );
}
export default NewsPartnerDetail;
