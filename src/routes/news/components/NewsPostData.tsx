import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Card, Col, Dropdown, Image, Row,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { CustomDropDown } from '../../../components/ui/UserMessageList/UserMessageListItem';
import postImage from '../../../images/news-post.jpg';
import NewPostHeader from './NewPostHeader';
import LikeShareModal from '../../../components/ui/LikeShareModal';

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
  border-top: 1px solid #3A3B46
`;
const PostImage = styled(Image)`
  acpect-ratio: 1.9;
`;
const intialPostdata = [
  {
    id: 1, userName: 'Horror Oasis', postDate: '06/11/2022 11:10 PM', content: 'This space is used to help indie creators have a platform to promote their work.', hashTag: ['horror', 'slasher', 'horroroasis'], commentSection: false, likeIcon: true,
  },
  {
    id: 2, userName: 'Horror Oasis1', postDate: '07/10/2022 11:10 PM', content: 'This space is used to help indie creators have a platform to promote their work.', hashTag: ['horrorday', 'slasher', 'horroroasis'], commentSection: false, likeIcon: false,
  },
];

function NewsPostData() {
  const [postData, setPostData] = useState<PostProps[]>(intialPostdata);
  const [openLikeShareModal, setOpenLikeShareModal] = useState<boolean>(false);
  const [buttonClick, setButtonClck] = useState<string>('');

  const openDialogue = (click: string) => {
    setOpenLikeShareModal(true);
    setButtonClck(click);
  };
  const onLikeClick = (likeId: number) => {
    const likeData = postData.map((checkLikeId: any) => {
      if (checkLikeId.id === likeId) {
        return { ...checkLikeId, likeIcon: !checkLikeId.likeIcon };
      }
      return checkLikeId;
    });
    setPostData(likeData);
  };

  return (
    <>
      {postData.map((post: PostProps) => (
        <Card className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 pt-md-3 px-sm-0 px-md-4 my-3" key={post.id}>
          <Card.Header className="border-0 px-0">
            <NewPostHeader userName={post.userName} postDate={post.postDate} />
          </Card.Header>
          <Card.Body className="px-0 pt-3 pb-2">
            <div>
              <p className="mb-0 fs-4">{post.content}</p>
              {post.hashTag?.map((hashtag: string) => (
                <Link key={hashtag} className="fs-4 text-primary me-1" to="/search" state={{ hashtag }}>
                  #
                  {hashtag}
                </Link>
              ))}
              ☠️
            </div>
            <Row className="mt-3">
              <PostImage src={postImage} className="w-100" />
            </Row>
            <Row className="fs-3 d-flex justify-content-evenly ps-1 mt-2">
              <Col className="align-self-center">
                <Button className="bg-transparent text-white border-0 fw-normal fs-3 shadow-none" onClick={() => openDialogue('like')}>
                  <LinearIcon uniqueId="like-button">
                    <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                    12K
                  </LinearIcon>
                </Button>
              </Col>
              <Col className="text-center">
                <Link className="bg-transparent text-white border-0 fw-normal fs-3 shadow-none" to="/news/partner/posts/1">
                  <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                  10
                </Link>
              </Col>
              <Col className="text-end">
                <Button className="bg-transparent text-white border-0 fw-normal fs-3 shadow-none" onClick={() => openDialogue('share')}>
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
            <Row className="fs-3 d-flex justify-content-evenly pt-2">
              <Col>
                <Button className="bg-transparent text-white border-0 fw-normal fs-3 shadow-none" onClick={() => onLikeClick(post.id)}>
                  {post.likeIcon ? (
                    <LinearIcon uniqueId="like-button-footer">
                      <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" role="button" onClick={() => onLikeClick(post.id)} />
                      Like
                    </LinearIcon>
                  )
                    : (
                      <>
                        <FontAwesomeIcon icon={regular('heart')} size="lg" className="me-2" role="button" onClick={() => onLikeClick(post.id)} />
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
              <Col className="text-end">
                <Button className="bg-transparent text-white border-0 fw-normal fs-3 shadow-none">
                  <CustomDropDown>
                    <Dropdown.Toggle className="bg-transparent pt-1 pe-0" variant="link">
                      <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
                      Share
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="bg-black">
                      <Dropdown.Item eventKey="Share as a post" className="text-light">Share as a post</Dropdown.Item>
                      <Dropdown.Item eventKey="Share in a message" className="text-light">Share in a message</Dropdown.Item>
                      <Dropdown.Item eventKey="More options" className="text-light">More options</Dropdown.Item>
                    </Dropdown.Menu>
                  </CustomDropDown>
                </Button>
              </Col>
              <svg width="0" height="0">
                <linearGradient id="like-button-footer" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                  <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
                </linearGradient>
              </svg>
            </Row>
          </CardFooter>
        </Card>
      ))}
      {
        openLikeShareModal
        && (
          <LikeShareModal
            show={openLikeShareModal}
            setShow={setOpenLikeShareModal}
            click={buttonClick}
          />
        )
      }
    </>
  );
}
export default NewsPostData;
