import React, { useState } from 'react';
import {
  Button, Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import userImage from '../../../placeholder-images/placeholder-user.jpg';
import Switch from '../../../components/ui/Switch';
import NewsRightSideNav from '../components/NewsRightSideNav';
import NewsPostData from '../components/NewsPostData';

const HeaderProfileImage = styled.img`
  height: 9.37rem;
  width: 9.37rem;
`;
const SmallText = styled.p`
  font-size: small;
  color: #CCCCCC;
`;

function NewsPartnerDetail() {
  const [bgColor, setBgColor] = useState<boolean>(false);
  const followBtnClick = () => {
    setBgColor(!bgColor);
  };

  return (
    <AuthenticatedPageWrapper>
      <Row className="mb-5 p-2">
        <Col md={8}>
          <Row>
            <Col xs={12} md="auto" className="d-flex justify-content-center">
              <HeaderProfileImage src={userImage} className="me-3 rounded-circle" />
            </Col>
            <Col md={5} className="align-self-center">
              <h2 className="text-center text-md-start h3 mt-3 mt-md-0">Horror Oasis</h2>
              <SmallText className="text-center text-md-start">
                It is a long established fact that a reader will be by the
                readable content of a page when looking at its layout.
              </SmallText>
            </Col>
          </Row>
          <Row className=" d-flex d-md-none justify-content-center">
            <Col xs={6}>
              <Button as="input" type="button" value={bgColor ? 'Follow' : 'Unfollow'} onClick={followBtnClick} className={`mb-4 mx-1 border-0 rounded-pill px-5 shadow-none ${bgColor ? 'bg-success' : 'bg-primary'}`} />
            </Col>
          </Row>
          <Row className="d-md-none bg-dark mt-2">
            <Col>
              <p className="mt-4 fw-bold">Notifications settings</p>
              <div className="mt-4 mb-2 lh-lg d-flex justify-content-between justify-content-md-start">
                <span>Push notifications</span>
                <Switch id="pushNotificationSwitch" className="ms-0 ms-md-3" />
              </div>
            </Col>
          </Row>
          <NewsPostData />
        </Col>
        <Col md={4} className="d-none d-md-block">
          <NewsRightSideNav />
        </Col>
      </Row>
    </AuthenticatedPageWrapper>
  );
}
export default NewsPartnerDetail;
