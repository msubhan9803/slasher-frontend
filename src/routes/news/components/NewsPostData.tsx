import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Dropdown, Image, Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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
  border-top: .063rem solid #3A3B46
`;
const PostImage = styled(Image)`
  aspectRatio : 1.9;
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
  const navigate = useNavigate();
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
  const onHashtagClick = (hashtagValue: string) => {
    navigate('/search', { state: { hashtag: hashtagValue } });
  };
  const commentSection = () => {
    navigate('/news/partner/posts/1');
  };
  return (
    <>
      {postData.map((post: PostProps) => (
        <Card className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 pt-md-3 px-sm-0 px-md-4 my-3" key={post.id}>
          <Card.Header className="border-0 px-0">
            <NewPostHeader userName={post.userName} postDate={post.postDate} />
          </Card.Header>
          <Card.Body className="px-0 pt-3">
            <div>
              <p className="mb-0 fs-4">{post.content}</p>
              {post.hashTag?.map((hashtag: string) => (
                <span role="button" tabIndex={0} key={hashtag} className="fs-4 text-primary me-1" aria-hidden="true" onClick={() => onHashtagClick(hashtag)}>
                  #
                  {hashtag}
                </span>
              ))}
              ☠️
            </div>
            <Row className="mt-3">
              <PostImage src={postImage} className="w-100" />
            </Row>
            <Row className="d-flex justify-content-evenly pt-3 px-3">
              <Col>
                <LinearIcon uniqueId="like-button" role="button" onClick={() => openDialogue('like')}>
                  <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                  12K
                </LinearIcon>
              </Col>
              <Col className="text-center" role="button" onClick={() => commentSection()}>
                <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                10
              </Col>
              <Col className="text-end" role="button" onClick={() => openDialogue('share')}>
                <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
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
          <CardFooter className="p-0">
            <Row className=" d-flex justify-content-evenly pt-3 pb-2 px-3">
              <Col role="button" onClick={() => onLikeClick(post.id)}>
                {post.likeIcon ? (
                  <LinearIcon uniqueId="like-button-footer">
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
                <CustomDropDown>
                  <Dropdown.Toggle className=" bg-transparent pt-1 pe-0">
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
