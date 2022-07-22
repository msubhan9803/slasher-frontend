import React, { useState } from 'react';
import { solid, regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Image, OverlayTrigger, Popover, Row,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
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
  height: 2.5rem;
  width: 2.5rem;
`;
const CardFooter = styled(Card.Footer)`
  border-top: .063rem solid #242424
`;
const CustomPopover = styled(Popover)`
z-index :1;
background:rgb(27,24,24);
border: 0.063rem solid rgb(56,56,56);
position:absolute;
top: 0rem !important;
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
function NewsList({
  id, name, image, date, content, hashTag,
}: SearchProps) {
  const [like, setLike] = useState(false);
  const [iD, setID] = useState<number>();

  const onLikeClick = (likedID: number) => {
    setLike(!like);
    setID(likedID);
  };
  const popover = (
    <CustomPopover id="popover-basic" className="py-2 rounded-2">
      <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0" role="button">Report</PopoverText>
    </CustomPopover>
  );
  return (
    <Card className="bg-dark my-3 p-3">
      <Card.Header className="border-0 ps-1 ps-md-3 align-items-center d-flex justify-content-between">
        <Link to="/news/partner/1" className="text-white align-items-center d-flex">
          <ProfileImage src={image} className="rounded-circle bg-secondary" />
          <div className="mx-3">
            <h1 className="mb-0 h6">{name}</h1>
            <small className="text-light">{date}</small>
          </div>
        </Link>
        <OverlayTrigger trigger="click" placement="left" rootClose overlay={popover}>
          <div>
            <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
          </div>
        </OverlayTrigger>
      </Card.Header>
      <Card.Body className="ps-1 ps-md-3 pt-1">
        <Card.Text>
          {content}
          <br />
          {hashTag?.map((hashtag: string) => (
            <Link to="/search" key={hashtag} className="text-primary cursor-pointer">
              #
              {hashtag}
            </Link>
          ))}
          ☠️
        </Card.Text>
        <Card.Img src={postImage} />
        <Row className="justify-content-between mx-1 mt-3">
          <Col>
            <LinearIcon uniqueId="like-button-news">
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
            <linearGradient id="like-button-news" x1="00%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
              <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
            </linearGradient>
          </svg>
        </Row>
      </Card.Body>
      <CardFooter>
        <Row className=" d-flex justify-content-evenly py-3 px-3">
          <Col role="button" onClick={() => onLikeClick(id)}>
            {like && (id === iD) ? (
              <LinearIcon uniqueId="like-button-news">
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
          </Col>
          <Col className="text-center" role="button">
            <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
            Comment
          </Col>
          <Col className="text-end" role="button">
            <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
            Share
          </Col>
          <svg width="0" height="0">
            <linearGradient id="like-button-news" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
              <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
            </linearGradient>
          </svg>
        </Row>
      </CardFooter>
    </Card>
  );
}

export default NewsList;
