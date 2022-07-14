import React, { useState } from 'react';
import { solid, regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Dropdown, Image, Row,
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
const CustomDropDown = styled(Dropdown)`
  .dropdown-toggle {
    border: none;
    &:hover {
      box-shadow: none;
    }
    &:focus {
      box-shadow: none;
    }
    &:active {
      box-shadow: none;
    }
    &:after {
      display: none;
    }
  }
  .dropdown-toggle[aria-expanded="true"] {
    svg {
      color: var(--bs-primary);
    }
  }
  .dropdown-menu {
    inset: -1.875rem 2.5rem auto auto !important;
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
function Posts({
  id, name, image, date, content, hashTag,
}: SearchProps) {
  const [like, setLike] = useState(false);
  const [iD, setID] = useState<number>();

  const onLikeClick = (likedID: number) => {
    setLike(!like);
    setID(likedID);
  };

  return (
    <Card key={id} className="bg-dark my-3">
      <Card.Header className="border-0 ps-1 ps-md-3">
        <Row className="align-items-center">
          <Col xs={11}>
            <Row>
              <Col className="my-auto rounded-circle" xs="auto">
                <div className="rounded-circle">
                  <Link to="/news/partner/1">
                    <ProfileImage src={image} className="rounded-circle bg-secondary" />
                  </Link>
                </div>
              </Col>
              <Col xs="auto" className="align-self-center">
                <Link to="/news/partner/1">
                  <h1 className="mb-0 h6">{name}</h1>
                </Link>
                <Link to="/news/partner/1">
                  <SmallText className="mb-0">{date}</SmallText>
                </Link>
              </Col>
            </Row>
          </Col>
          <Col xs={1}>
            <CustomDropDown>
              <Dropdown.Toggle className="d-flex justify-content-end bg-transparent pt-1">
                <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
              </Dropdown.Toggle>
              <Dropdown.Menu className="bg-black">
                <Dropdown.Item eventKey="block" className="text-light">Block</Dropdown.Item>
                <Dropdown.Item eventKey="report" className="text-light">Report</Dropdown.Item>
              </Dropdown.Menu>
            </CustomDropDown>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="ps-1 ps-md-3 pt-1">
        <Row>
          <Col xs={12}>
            <>
              <span>{content}</span>
              {hashTag?.map((hashtag: string) => (
                <Link to="/search" key={hashtag} className="text-primary cursor-pointer">
                  #
                  {hashtag}
                </Link>
              ))}
              ☠️
            </>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col>
            <Image src={postImage} className="w-100" />
          </Col>
        </Row>
        <Row className="justify-content-between m-2">
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
        <div className="justify-content-between d-flex m-2">
          <div className="p-0">
            {like && (id === iD)
              ? (
                <LinearIcon uniqueId="like-button">
                  <FontAwesomeIcon role="button" onClick={() => onLikeClick(id)} icon={solid('heart')} size="lg" className="me-2" />
                  Like
                </LinearIcon>
              ) : (
                <>
                  <FontAwesomeIcon role="button" onClick={() => onLikeClick(id)} icon={regular('heart')} size="lg" className="me-2" />
                  Like
                </>
              )}
          </div>
          <div className="p-0 text-center">
            <FontAwesomeIcon role="button" icon={regular('comment-dots')} size="lg" className="me-2" />
            Comment
          </div>
          <div className="p-0 text-end">
            <FontAwesomeIcon role="button" icon={solid('share-nodes')} size="lg" className="me-2" />
            Share
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default Posts;
