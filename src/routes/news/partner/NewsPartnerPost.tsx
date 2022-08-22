import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Card, Col, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import NewsPartnerComments from './NewsPartnerComments';
import NewsPartnerPostFooter from './NewsPartnerPostFooter';
import postImage from '../../../images/news-partner-detail.jpg';
import CustomPopover from '../../../components/ui/CustomPopover';
import ReportModal from '../../../components/ui/ReportModal';

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
const ProfileImage = styled(Image)`
  height:3.125rem;
  width:3.125rem;
`;
const ImageContainer = styled(Row)`
  aspect-ratio: 1.9
  svg {
    object-fit: cover;
  }
`;
const data = [
  {
    id: 1, userName: 'Horror Oasis', postDate: '06/11/2022 11:10 PM', likeIcon: false,
  },
];
function NewsPartnerPost() {
  const [postData, setPostData] = useState<PostProps[]>(data);
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const popoverOption = ['Report'];

  const handlePopover = (selectedOption: string) => {
    setShow(true);
    setDropDownValue(selectedOption);
  };

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
      <Row className="mb-5 px-2">
        <Col className="p-0">
          {postData.map((post: PostProps) => (
            <Card className="rounded-3 bg-mobile-transparent bg-dark mb-0 pt-3 px-sm-0 px-md-4" key={post.id}>
              <Card.Header className="border-0 px-sm-3 px-md-0">
                <Row className="justify-content-between">
                  <Col xs="auto">
                    <Row className="d-flex">
                      <Col className="my-auto rounded-circle" xs="auto">
                        <div className="rounded-circle">
                          <ProfileImage src="https://i.pravatar.cc/300?img=11" className="rounded-circle bg-secondary" />
                        </div>
                      </Col>
                      <Col xs="auto" className="ps-0 align-self-center">
                        <h3 className="mb-0">{post.userName}</h3>
                        <p className="fs-6 text-light mb-0">{post.postDate}</p>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs="auto" className="d-block">
                    <CustomPopover popoverOptions={popoverOption} onPopoverClick={handlePopover} />
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body className="px-0 py-3">
                <Row>
                  <Col className="px-4 px-md-2 ms-md-1">
                    <p className="fs-4 mb-0">
                      This space is used to help indie creators have a platform to
                      promote their work.
                    </p>
                    <p className="text-primary fs-4 mb-0"> #horrorday #slasher #horroroasis ☠️</p>
                  </Col>
                </Row>
                <ImageContainer className="mt-3">
                  <Image src={postImage} className="w-100 h-100" />
                </ImageContainer>
                <Row className="fs-3 d-flex justify-content-evenly ps-1 mt-2">
                  <Col className="align-self-center">
                    <Button className="bg-transparent text-white border-0 fw-normal fs-3 shadow-none">
                      <LinearIcon uniqueId="like-button">
                        <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                        12K
                      </LinearIcon>
                    </Button>
                  </Col>
                  <Col className="text-center">
                    <Button className="bg-transparent text-white border-0 fw-normal fs-3 shadow-none">
                      <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                      10
                    </Button>
                  </Col>
                  <Col className="text-end">
                    <Button className="bg-transparent text-white border-0 fw-normal fs-3 shadow-none">
                      <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
                      25
                    </Button>
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
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}
export default NewsPartnerPost;
