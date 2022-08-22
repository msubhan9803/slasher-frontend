import React, { useState } from 'react';
import { solid, regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Card, Col, Image, OverlayTrigger, Popover, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { SearchProps } from '../SearchInterface';
import postImage from '../../../images/news-post.svg';

interface LinearIconProps {
  uniqueId?: string
}

const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const ProfileImage = styled(Image)`
  height: 3.125rem;
  width: 3.125rem;
`;
const CardFooter = styled(Card.Footer)`
  border-top: .063rem solid #242424
`;
const CustomPopover = styled(Popover)`
  z-index: 1;
  background: rgb(27,24,24);
  border: 0.063rem solid rgb(56,56,56);
  .popover-arrow {
    &:after {
      border-left-color: rgb(56,56,56);
    }
  }
`;
const PopoverText = styled.p`
  &:hover {
    background: var(--bs-primary);
  }
`;

const StyledPopover = styled.div`
  .btn[aria-describedby="popover-basic"]{
    svg{
      color: var(--bs-primary);
    }
  }
`;
const StyledPostImage = styled(Row)`
  aspect-ratio: 1.64;
  img {
    object-fit: cover;
  }
`;

function Posts({
  id, name, image, date, content, hashTag,
}: SearchProps) {
  const [like, setLike] = useState(false);
  const [iD, setID] = useState<number>();

  const onLikeClick = (likedID: number) => {
    setLike(!like);
    setID(likedID);
  };
  const popover = (
    <CustomPopover id="popover-basic" className="py-2 rounded-2 fs-5">
      <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0" role="button">Report</PopoverText>
    </CustomPopover>
  );
  return (
    <Row className="my-3 px-2">
      <Col className="p-0">
        <Card className="rounded-3 bg-mobile-transparent bg-dark mb-0 pt-3 px-sm-0 px-md-4" key={id}>
          <Card.Header className="d-flex justify-content-between border-0 px-0 bg-mobile-transparent bg-dark">
            <div className="d-flex align-items-center">
              <ProfileImage src={image} className="rounded-circle bg-secondary" />
              <div className="ms-3">
                <h1 className="mb-0 h3 fw-bold">{name}</h1>
                <span className="mb-0 text-light fs-6">{date}</span>
              </div>
            </div>
            <StyledPopover className="position-relative">
              <OverlayTrigger trigger="click" placement="left" rootClose overlay={popover}>
                <Button className="bg-transparent shadow-none border-0 pe-1">
                  <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                </Button>
              </OverlayTrigger>
            </StyledPopover>
          </Card.Header>
          <Card.Body className="px-0 pt-3 pb-2">
            <Row>
              <Col>
                <span className="fs-4">
                  {content}
                </span>
                <br />
                {hashTag?.map((hashtag: string) => (
                  <span key={hashtag} className="fs-4 text-primary cursor-pointer">
                    #
                    {hashtag}
                    &nbsp;
                  </span>
                ))}
                ☠️
              </Col>
            </Row>
            <StyledPostImage className="mt-3">
              <Image src={postImage} className="w-100 h-100" />
            </StyledPostImage>
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
          <CardFooter className="p-0 ps-1">
            <Row className=" d-flex justify-content-evenly py-2">
              <Col>
                <Button className="bg-transparent text-white border-0 fw-normal fs-3 shadow-none" onClick={() => onLikeClick(id)}>
                  {like && (id === iD) ? (
                    <LinearIcon uniqueId="like-news-button-footer">
                      <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                      Like
                    </LinearIcon>
                  )
                    : (
                      <>
                        <FontAwesomeIcon icon={regular('heart')} size="lg" className="me-2" />
                        Like
                      </>
                    )}
                </Button>
              </Col>
              <Col className="text-center">
                <Button className="bg-transparent text-white border-0 fw-normal fs-3 shadow-none">
                  <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                  Comment
                </Button>
              </Col>
              <Col className="text-end" role="button">
                <Button className="bg-transparent text-white border-0 fw-normal fs-3 shadow-none">
                  <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
                  Share
                </Button>
              </Col>
              <svg width="0" height="0">
                <linearGradient id="like-news-button-footer" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                  <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
                </linearGradient>
              </svg>
            </Row>
          </CardFooter>
        </Card>
      </Col>
    </Row>
  );
}

export default Posts;
