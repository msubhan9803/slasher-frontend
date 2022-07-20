import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Dropdown, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import userImage from '../../../placeholder-images/placeholder-user.jpg';
import NewsPartnerComments from './NewsPartnerComments';
import NewsPartnerPostFooter from './NewsPartnerPostFooter';

interface LinearIconProps {
  uniqueId?: string
}
interface PostProps {
  id: number;
  userName: string;
  postDate: string;
  likeIcon: boolean
}
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const SmallText = styled.p`
  font-size: .875rem;
  color: #CCCCCC;
`;
const ProfileImage = styled(Image)`
  height:2.5rem;
  width:2.5rem;
`;
const dropdownBgColor = 'rgb(27,24,24)';
const CustomDropDown = styled(Dropdown)`
  .dropdown-toggle {
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
const data = [
  {
    id: 1, userName: 'Horror Oasis', postDate: '06/11/2022 11:10 PM', likeIcon: false,
  },
];
function NewsPartnerPost() {
  const [postData, setPostData] = useState<PostProps[]>(data);
  const onLikeClick = (likeId: number) => {
    const likeData = postData.map((checkLikeId: PostProps) => {
      if (checkLikeId.id === likeId) {
        return { ...checkLikeId, likeIcon: !checkLikeId.likeIcon };
      }
      return checkLikeId;
    });
    setPostData(likeData);
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <Row className="d-md-none bg-dark">
        <Col xs="auto"><FontAwesomeIcon role="button" icon={solid('arrow-left-long')} size="lg" /></Col>
        <Col><h1 className="h4 text-center">Horror Oasis</h1></Col>
      </Row>
      <Row className="mb-5">
        <Col className="p-0">
          {postData.map((post: PostProps) => (
            <Card className="rounded-3 bg-dark mb-0 pt-3 px-sm-0 px-md-4" key={post.id}>
              <Card.Header className="border-0 px-sm-3 px-md-0">
                <Row className="justify-content-between">
                  <Col xs="auto">
                    <Row className="d-flex">
                      <Col className="my-auto rounded-circle" xs="auto">
                        <div className="rounded-circle">
                          <ProfileImage src={userImage} className="rounded-circle bg-secondary" />
                        </div>
                      </Col>
                      <Col xs="auto" className="ps-0 align-self-center">
                        <h1 className="mb-0 h6">{post.userName}</h1>
                        <SmallText className="mb-0">{post.postDate}</SmallText>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs="auto" className="d-block">
                    <CustomDropDown>
                      <Dropdown.Toggle className="d-flex justify-content-end pt-0 pe-0 bg-dark">
                        <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item eventKey="1" className="text-light">Report</Dropdown.Item>
                      </Dropdown.Menu>
                    </CustomDropDown>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body className="px-0 pt-3">
                <Row>
                  <Col className="px-4 px-md-3">
                    <span>
                      This space is used to help indie creators have a platform to
                      promote their work.
                    </span>
                    <span className="text-primary"> #horrorday #slasher #horroroasis ☠️</span>
                  </Col>
                </Row>
                <Row className="mt-3 mt-md-4">
                  <Image src="https://i.pravatar.cc/500?img=10" className="w-100" />
                </Row>
                <Row className="d-flex justify-content-evenly pt-3 px-3">
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
              <NewsPartnerPostFooter
                likeIcon={post.likeIcon}
                id={post.id}
                onLikeClick={() => onLikeClick(post.id)}
              />
              <NewsPartnerComments />
            </Card>
          ))}
        </Col>
      </Row>
    </AuthenticatedPageWrapper>
  );
}
export default NewsPartnerPost;
