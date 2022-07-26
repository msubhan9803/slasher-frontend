import React from 'react';
import {
  Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
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

function NewsPartnerDetail() {
  return (
    <AuthenticatedPageWrapper rightSidebarType="news">
      <Row className="mb-5">
        <Col>
          <Row className="bg-dark rounded-2 mx-0">
            <Col md="auto" className="d-flex justify-content-center p-4 pb-3">
              <HeaderProfileImage src={userImage} className="rounded-2" />
            </Col>
            <Col md={7} className="pt-4 ps-0">
              <h2 className="text-center text-md-start h3 mt-3 mt-md-0">Horror Oasis</h2>
              <SmallText className="text-center text-md-start">
                Take a deep dive and try our list of over 40 unique generators,
                find placeholder images for your next design,
                or add a lorem ipsum plugin to the CMS or text editor of your choice.
              </SmallText>
            </Col>
          </Row>
          <NewsPostData />
        </Col>
      </Row>
    </AuthenticatedPageWrapper>
  );
}
export default NewsPartnerDetail;
