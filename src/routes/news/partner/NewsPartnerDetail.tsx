import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Card, Col, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import userImage from '../../../placeholder-images/placeholder-user.jpg';
import postImage from '../../../images/news-post.svg';
import Switch from '../../../components/ui/Switch';

interface LinearIconProps {
  uniqueId?: string
}

const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const HeaderProfileImage = styled.img`
  height: 9.37rem;
  width: 9.37rem;
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

const postData = [
  { id: 1, userName: 'Horror Oasis', postDate: '06/11/2022 11:10 PM' },
  { id: 2, userName: 'Horror Oasis1', postDate: '07/10/2022 11:10 PM' },
  { id: 3, userName: 'Horror Oasis2', postDate: '08/09/2022 11:10 PM' },
  { id: 4, userName: 'Horror Oasis3', postDate: '09/12/2022 11:10 PM' },
];
function NewsPartnerDetail() {
  // TODO: Delete the eslint ignore line below once we use this
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { partnerId } = useParams();

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <Row>
        <Col xs={12} md="auto" className="d-flex justify-content-center">
          <HeaderProfileImage src={userImage} className="me-3 rounded-circle" />
        </Col>
        <Col md={8} className="align-self-center">
          <h2 className="text-center text-md-start h3 mt-3 mt-md-0">Horror Oasis</h2>
          <SmallText className="text-center text-md-start">
            It is a long established fact that a reader will be by the
            readable content of a page when looking at its layout.
          </SmallText>
        </Col>
      </Row>
      <Row className=" d-flex d-md-none justify-content-center">
        <Col xs={6}>
          <Button as="input" type="button" value="Follow" className="mb-4 mx-1 rounded-pill px-5" />
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
      {postData.map((post) => (
        <Card key={post.id} className="bg-dark mb-5 my-3">
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
                <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
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
                <Image src={postImage} className="w-100" />
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
        </Card>
      ))}
    </AuthenticatedPageWrapper>
  );
}
export default NewsPartnerDetail;
