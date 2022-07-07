import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Dropdown, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import userImage from '../../../placeholder-images/placeholder-user.jpg';
import NewsPartnerRightSideNav from './NewsPartnerRightSideNav';
import NewsPartnerComments from './NewsPartnerComments';

interface LinearIconProps {
  uniqueId?: string
}

const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const SmallText = styled.p`
  font-size: small;
  color: #CCCCCC;
`;
const ProfileImage = styled(Image)`
  height:3.313rem;
  width:3.313rem;
`;
const CardFooter = styled(Card.Footer)`
  border-top: .063rem solid #242424
`;

const dropdownBgColor = 'rgb(19,17,17)';

const CustomDropDown = styled(Dropdown)`
  .dropdown-toggle {
    background-color: ${dropdownBgColor};
    border: none;
    &:hover {
      background-color: ${dropdownBgColor};
      box-shadow: none
    }
    &:focus {
      color:red;
      background-color: ${dropdownBgColor};
      box-shadow: none
    }
    &:active&:focus {
      box-shadow: none
    }
    &:after {
      display: none;
    }
  }

  .dropdown-menu {
    background-color: ${dropdownBgColor};
  }

  .dropdown-item {
    &:hover {
      background-color: var(--bs-primary) !important;
    }
    &:active {
      background-color: var(--bs-primary) !important;
    }
  }
`;
const postData = [
  { id: 1, userName: 'Horror Oasis', postDate: '06/11/2022 11:10 PM' },
];
function NewsPartnerPost() {
  return (
    <AuthenticatedPageWrapper>
      <Row className="d-md-none">
        <Col xs="auto">
          <FontAwesomeIcon role="button" icon={solid('arrow-left-long')} size="lg" />
        </Col>
        <Col>
          <h1 className="h4 text-center">Horror Oasis</h1>
        </Col>
      </Row>
      <Row className="mb-5">
        <Col>
          {postData.map((post) => (
            <div key={post.id}>
              <Card className="bg-dark mt-3 mb-0">
                <Card.Header className="border-0 ps-1 ps-md-3">
                  <Row className="align-items-center">
                    <Col xs={11}>
                      <Row className="d-flex">
                        <Col className="my-auto rounded-circle" xs="auto">
                          <div className="rounded-circle">
                            <ProfileImage src={userImage} className="rounded-circle bg-secondary" />
                          </div>
                        </Col>
                        <Col xs="auto" className="ps-0 align-self-center">
                          <h6 className="mb-0 ">{post.userName}</h6>
                          <SmallText className="mb-0">{post.postDate}</SmallText>
                        </Col>
                      </Row>
                    </Col>
                    <Col xs={1} className="d-none d-md-block">
                      <CustomDropDown>
                        <Dropdown.Toggle className="d-flex justify-content-end">
                          <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item eventKey="1" className="text-light">Report</Dropdown.Item>
                        </Dropdown.Menu>
                      </CustomDropDown>
                    </Col>
                  </Row>
                </Card.Header>
                <Card.Body className="ps-1 ps-md-3 pt-1">
                  <Row>
                    <Col xs={12}>
                      <span className="p">This space is used to help indie creators have a platform to promote their work.</span>
                      <span className="text-primary p"> #horrorday #slasher #horroroasis ☠️</span>
                    </Col>
                  </Row>
                  <Row className="mt-3">
                    <Col className="">
                      <Image src="https://i.pravatar.cc/500?img=10" className="w-100" />
                    </Col>
                  </Row>
                  <Row className="justify-content-between d-flex m-2">
                    <Col>
                      <LinearIcon uniqueId="like-button">
                        <FontAwesomeIcon role="button" icon={solid('heart')} size="lg" className="me-2" />
                        12K
                      </LinearIcon>
                    </Col>
                    <Col className="text-center">
                      <FontAwesomeIcon role="button" icon={regular('comment-dots')} size="lg" className="me-2" />
                      10
                    </Col>
                    <Col className="text-end">
                      <FontAwesomeIcon role="button" icon={solid('share-nodes')} size="lg" className="me-2" />
                      25
                    </Col>
                    <svg width="0" height="0">
                      <linearGradient id="like-button" x1="00%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                        <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
                      </linearGradient>
                    </svg>
                  </Row>
                </Card.Body>
                <CardFooter>
                  <Row className="justify-content-between d-flex m-2">
                    <Col className="p-0">
                      <FontAwesomeIcon role="button" icon={regular('heart')} size="lg" className="me-2" />
                      Like
                    </Col>
                    <Col className="text-center p-0">
                      <FontAwesomeIcon role="button" icon={regular('comment-dots')} size="lg" className="me-2" />
                      Comment
                    </Col>
                    <Col className="text-end p-0">
                      <FontAwesomeIcon role="button" icon={solid('share-nodes')} size="lg" className="me-2" />
                      Share
                    </Col>
                  </Row>
                </CardFooter>
                <NewsPartnerComments />
              </Card>
            </div>
          ))}
        </Col>
        <Col md={4} className="d-none d-md-block">
          <NewsPartnerRightSideNav />
        </Col>
      </Row>
    </AuthenticatedPageWrapper>
  );
}
export default NewsPartnerPost;
