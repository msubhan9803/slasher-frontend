import React, { useState } from 'react';
import { solid, regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Dropdown, Image, Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import postImage from '../../../images/news-post.svg';
import { PostsProps } from '../SearchInterface';

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
const CursorPointer = styled.span`
  cursor:Pointer;
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
function Posts({ post }: PostsProps) {
  const navigate = useNavigate();
  const [like, setLike] = useState(false);
  const [id, setId] = useState<number>();

  const onLikeClick = (ids: number) => {
    setLike(!like);
    setId(ids);
  };
  const onHashtagClick = (hashtag: string) => {
    navigate('/search', { state: hashtag });
  };
  const onProfileDetailClick = () => {
    navigate('/news/partner/1');
  };
  return (
    <Card key={post.id} className="bg-dark my-3">
      <Card.Header className="border-0 ps-1 ps-md-3">
        <Row className="align-items-center">
          <Col xs={11}>
            <Row className="d-flex">
              <Col className="my-auto rounded-circle" xs="auto">
                <div className="rounded-circle">
                  <CursorPointer>
                    <ProfileImage src={post.userImage} className="rounded-circle bg-secondary" onClick={() => { onProfileDetailClick(); }} />
                  </CursorPointer>
                </div>
              </Col>
              <Col xs="auto" className="ps-0 align-self-center">
                <CursorPointer>
                  <h1 className="mb-0 h6">{post.userName}</h1>
                </CursorPointer>
                <CursorPointer>
                  <SmallText className="mb-0">{post.postDate}</SmallText>
                </CursorPointer>
              </Col>
            </Row>
          </Col>
          <Col xs={1} className="d-none d-md-block">
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
              <span className="p">{post?.content}</span>
              {post?.hashTag?.map((hashtag: string) => (
                <CursorPointer key={hashtag} className="text-primary p cursor-pointer" onClick={() => onHashtagClick(hashtag)}>
                  #
                  {hashtag}
                </CursorPointer>
              ))}
              ☠️
            </>
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
            {like && (post.id === id) ? (
              <LinearIcon uniqueId="like-button">
                <FontAwesomeIcon role="button" onClick={() => onLikeClick(post.id)} icon={solid('heart')} size="lg" className="me-2" />
                Like
              </LinearIcon>
            ) : (
              <>
                <FontAwesomeIcon role="button" onClick={() => onLikeClick(post.id)} icon={regular('heart')} size="lg" className="me-2" />
                Like
              </>
            )}
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
  );
}

export default Posts;
