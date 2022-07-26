import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Card, Col, Image, OverlayTrigger, Popover, Row,
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
  font-size: .75rem;
  color: #CCCCCC;
`;
const ProfileImage = styled(Image)`
  height:3.125rem;
  width:3.125rem;
`;
const CustomPopover = styled(Popover)`
  z-index :1;
  background:rgb(27,24,24);
  border: 1px solid rgb(56,56,56);
  position:absolute;
  top: 0px !important;
  .popover-arrow{
    &:after{
      border-left-color:rgb(56,56,56);
    }
  }
`;
const PopoverText = styled.p`
  &:hover {
    background: red;
  }
`;
const CustomButton = styled(Button)`
  background: var(--bs-dark) !important;
  border : 0 !important;
    &:focus {
      color :red !important;
      box-shadow: none !important;
  }
  &:active{
    color :var(--bs-primary) !important;
    box-shadow: none !important;
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

  const popover = (
    <CustomPopover id="popover-basic" className="py-2 rounded-2">
      <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0" role="button">Report</PopoverText>
    </CustomPopover>
  );
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <Row className="d-md-none bg-dark">
        <Col xs="auto" className="ms-2"><FontAwesomeIcon role="button" icon={solid('arrow-left-long')} size="2x" /></Col>
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
                    <OverlayTrigger trigger="click" placement="left" rootClose overlay={popover}>
                      <CustomButton>
                        <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                      </CustomButton>
                    </OverlayTrigger>
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body className="px-0 py-3">
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
