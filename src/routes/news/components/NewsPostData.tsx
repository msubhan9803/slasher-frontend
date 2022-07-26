import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Dropdown, Form, Image, InputGroup, Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { CustomDropDown } from '../../../components/ui/UserMessageList/UserMessageListItem';
import postImage from '../../../images/news-post.svg';
import NewPostHeader from './NewPostHeader';

interface LinearIconProps {
  uniqueId?: string
}
interface PostProps {
  id: number;
  userName: string;
  postDate: string;
  content: string;
  hashTag: string[];
  commentSection: boolean;
  likeIcon: boolean;
}

const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const CardFooter = styled(Card.Footer)`
  border-top: .063rem solid #3A3B46
`;
const StyledCommentInputGroup = styled(InputGroup)`
  .form-control {
    border-radius: 1.875rem;
    border-bottom-right-radius: 0rem;
    border-top-right-radius: 0rem;
  }
  .input-group-text {
    background-color: rgb(31, 31, 31);
    border-color: #3a3b46;
    border-radius: 1.875rem;
  }
  svg {
    min-width: 1.875rem;
  }
`;
const intialPostdata = [
  {
    id: 1, userName: 'Horror Oasis', postDate: '06/11/2022 11:10 PM', content: 'This space is used to help indie creators have a platform to promote their work.', hashTag: ['horrorday', 'slasher', 'horroroasis'], commentSection: false, likeIcon: true,
  },
  {
    id: 2, userName: 'Horror Oasis1', postDate: '07/10/2022 11:10 PM', content: 'This space is used to help indie creators have a platform to promote their work.', hashTag: ['horrorday', 'slasher', 'horroroasis'], commentSection: false, likeIcon: false,
  },
  {
    id: 3, userName: 'Horror Oasis2', postDate: '08/09/2022 11:10 PM', content: 'This space is used to help indie creators have a platform to promote their work.', hashTag: ['horrorday', 'slasher', 'horroroasis'], commentSection: false, likeIcon: false,
  },
  {
    id: 4, userName: 'Horror Oasis3', postDate: '09/12/2022 11:10 PM', content: 'This space is used to help indie creators have a platform to promote their work.', hashTag: ['horrorday', 'slasher', 'horroroasis'], commentSection: false, likeIcon: false,
  },
];

function NewsPostData() {
  const navigate = useNavigate();
  const [postData, setPostData] = useState<PostProps[]>(intialPostdata);
  const onLikeClick = (likeId: number) => {
    const likeData = postData.map((checkLikeId: any) => {
      if (checkLikeId.id === likeId) {
        return { ...checkLikeId, likeIcon: !checkLikeId.likeIcon };
      }
      return checkLikeId;
    });
    setPostData(likeData);
  };
  const handleCommmentBox = (commentsId: any) => {
    const commentData = postData.map((checkCommentId: any) => {
      if (checkCommentId.id === commentsId) {
        return { ...checkCommentId, commentSection: !checkCommentId.commentSection };
      }
      return checkCommentId;
    });
    setPostData(commentData);
  };
  const onHashtagClick = (hashtagValue: string) => {
    navigate('/search', { state: { hashtag: hashtagValue } });
  };
  return (
    <>
      {postData.map((post: PostProps) => (
        <Card className="rounded-3 bg-dark mb-0 pt-3 px-sm-0 px-md-4 my-4" key={post.id}>
          <Card.Header className="border-0 px-sm-3 px-md-0">
            <NewPostHeader userName={post.userName} postDate={post.postDate} />
          </Card.Header>
          <Card.Body className="px-0 pt-3">
            <Row>
              <Col xs={12}>
                <>
                  <p className="mb-0">{post.content}</p>
                  {post.hashTag?.map((hashtag: string) => (
                    <span role="button" tabIndex={0} key={hashtag} className="text-primary mx-1" aria-hidden="true" onClick={() => onHashtagClick(hashtag)}>
                      #
                      {hashtag}
                    </span>
                  ))}
                  ☠️
                </>
              </Col>
            </Row>
            <Row className="mt-3">
              <Image src={postImage} className="w-100" />
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
          <CardFooter className="px-2">
            <div className="justify-content-between d-flex m-2">
              <div className="p-0" role="button" aria-hidden="true" onClick={() => onLikeClick(post.id)}>
                {
                  post.likeIcon
                    ? (
                      <LinearIcon uniqueId="like-button">
                        <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                        Like
                      </LinearIcon>
                    )
                    : (
                      <>
                        <FontAwesomeIcon icon={regular('heart')} size="lg" className="me-2" />
                        Like
                      </>
                    )
                }
              </div>
              <div className="p-0 text-center" role="button" aria-hidden="true" onClick={() => handleCommmentBox(post.id)}>
                <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                Comment
              </div>
              <div className="p-0 text-end" role="button">
                <Col xs={1} className=" d-block">
                  <CustomDropDown>
                    <Dropdown.Toggle className="d-flex justify-content-end bg-transparent pt-1 pe-0">
                      <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
                      Share
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="bg-black">
                      <Dropdown.Item eventKey="Share as a post" className="text-light">Share as a post</Dropdown.Item>
                      <Dropdown.Item eventKey="Share in a message" className="text-light">Share in a message</Dropdown.Item>
                      <Dropdown.Item eventKey="More options" className="text-light">More options</Dropdown.Item>
                    </Dropdown.Menu>
                  </CustomDropDown>
                </Col>
              </div>

            </div>
            {post.commentSection
              && (
                <Col className="bg-dark ps-0 pe-4 mt-4">
                  <StyledCommentInputGroup className="mb-3">
                    <Form.Control
                      placeholder="Write a comment ..."
                      className="border-end-0"
                    />
                    <InputGroup.Text>
                      <FontAwesomeIcon role="button" icon={solid('camera')} size="lg" className="pe-3" />
                    </InputGroup.Text>
                  </StyledCommentInputGroup>
                </Col>
              )}
          </CardFooter>
        </Card>
      ))}
    </>
  );
}
export default NewsPostData;
