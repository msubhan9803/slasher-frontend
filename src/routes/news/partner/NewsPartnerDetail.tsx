import React, { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../../components/ui/RoundButton';
import Switch from '../../../components/ui/Switch';
import UserCircleImage from '../../../components/ui/UserCircleImage';
import userImage from '../../../images/placeholder-user.jpg';
import NewsPostData from '../components/NewsPostData';

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
  const [following, setFollowing] = useState(true);

  return (
    <AuthenticatedPageWrapper rightSidebarType="news">
      <Row>
        <Col>
          <Row className="bg-dark rounded-3 mx-0">
            <Col md="auto" className="d-flex justify-content-center p-4 pb-md-4 pb-0">
              <UserCircleImage size="11.25rem" src={userImage} className="rounded-4" />
            </Col>
            <Col md={7} lg={6} xl={7} className="pt-md-4 pt-md-2 pt-0 pb-lg-4">
              <h2 className="text-center text-md-start mt-3 mt-lg-0 mt-xl-3">Horror Oasis</h2>
              <p className="text-center text-md-start m-2 m-md-0 fs-4 text-light">
                Take a deep dive and try our list of over 40 unique generators,
                find placeholder images for your next design,
                or add a lorem ipsum plugin to the CMS or text editor of your choice.
              </p>
            </Col>
            <Col className="d-md-none">
              <div className="mt-3 mb-4">
                <CustomButton
                  variant={following ? 'black' : 'primary'}
                  onClick={() => setFollowing(!following)}
                  className="w-100 rounded-pill shadow-none"
                >
                  {following ? 'Unfollow' : 'Follow'}
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
