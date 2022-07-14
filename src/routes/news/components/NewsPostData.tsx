import React, { useEffect, useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Dropdown, Form, Image, InputGroup, Row,
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BlockDialog from '../../../components/ui/BlockDialog';
import ReportDialog from '../../../components/ui/Reportdialog';
import { CustomDropDown } from '../../../components/ui/UserMessageList/UserMessageListItem';
import userImage from '../../../placeholder-images/placeholder-user.jpg';
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
  height:3.313rem;
  width:3.313rem;
`;
const CardFooter = styled(Card.Footer)`
  border-top: .063rem solid #242424
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
  const [like, setLike] = useState(false);
  const [id, setId] = useState<number>();
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [postData, setPostData] = useState(intialPostdata);

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

  const handleNewsOption = (newsValue: string) => {
    setShow(true);
    setDropDownValue(newsValue);
  };

  const onHashtagClick = (hashtagValue: string) => {
    navigate('/search', { state: { hashtag: hashtagValue } });
  };

  const onProfileDetailClick = () => {
    navigate('/news/partner/1');
  };
  return (
    <>
      {
        postData.map((post: any) => (
          <Card key={post.id} className="bg-dark mb-5 my-3">
            <Card.Header className="border-0 ps-1 ps-md-3">
              <Row className="align-items-center">
                <Col xs={11}>
                  <Row>
                    <Col className="my-auto rounded-circle" xs="auto">
                      <Link className="text-white d-flex align-items-center" to="/news/partner/1">
                        <div className="rounded-circle">
                          <ProfileImage src={userImage} className="rounded-circle bg-secondary" onClick={() => { onProfileDetailClick(); }} />
                        </div>
                        <div className="ps-3">
                          <h1 className="mb-0 h6">{post?.userName}</h1>
                          <small className="mb-0 text-light">{post?.postDate}</small>
                        </div>
                      </Link>
                    </Col>
                  </Row>
                </Col>
                <Col xs={1} className="d-none d-md-block">
                  <CustomDropDown onSelect={handleNewsOption}>
                    <Dropdown.Toggle className="d-flex justify-content-end bg-transparent pt-1">
                      <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="bg-black">
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
                    <span>{post.content}</span>
                    {post.hashTag?.map((hashtag: any) => (
                      <span role="button" tabIndex={0} key={hashtag} className="text-primary" aria-hidden="true" onClick={() => onHashtagClick(hashtag)}>
                        #
                        {hashtag}
                      </span>
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
                  <Col xs={1} className="d-none d-md-block">
                    <CustomDropDown>
                      <Dropdown.Toggle className="d-flex justify-content-end bg-transparent pt-1">
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
        ))
      }
      {
        dropDownValue === 'report'
        && <ReportDialog show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
      }
      {
        dropDownValue === 'block'
        && <BlockDialog show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
      }
    </>
  );
}
export default NewsPostData;
