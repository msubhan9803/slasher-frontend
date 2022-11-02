import React, { useState, useEffect } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Row,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import linkifyHtml from 'linkify-html';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper';
import PostFooter from './PostFooter';
import { Post } from '../../../types';
import LikeShareModal from '../LikeShareModal';
import PostCommentSection from '../PostCommentSection/PostCommentSection';
import PostHeader from './PostHeader';
import 'linkify-plugin-mention';
import 'swiper/css';
import 'swiper/css/pagination';

interface LinearIconProps {
  uniqueId?: string
}
interface Props {
  popoverOptions: string[],
  postFeedData: any[],
  isCommentSection?: boolean,
  onPopoverClick: (value: string) => void,
}
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const PostImage = styled.div`
  aspect-ratio : 1.9;
`;
const Content = styled.div`
  white-space: pre-line;
`;
const StyledBorder = styled.div`
  border-top: 1px solid #3A3B46
`;
const StyledPostFeed = styled.div`
  @media(max-width: 767px) {
    .post {
      border-bottom: 1px solid #3A3B46;
    }
    .post:last-of-type {
      border-bottom: none;
    }
  }
`;
const CustomSwiper = styled(Swiper)`
  width: 100%;
  height: 100%;
  z-index: 0 !important;
  
.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #fff;

  /* Center slide text vertically */
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
}

.swiper-slide img {
  display: block;
  height: 100%;
  object-fit: cover;
}
.swiper-pagination {
  position: revert !important;
}
.swiper-pagination-bullet {
  border:1px solid !important;
}
.swiper-pagination-bullet-active{
  background: white !important;
}
`;
const decryptMessage = (content: string) => {
  const found = content.replace(/##LINK_ID##[a-fA-F0-9]{24}|##LINK_END##/g, '');
  return found;
};

function PostFeed({
  postFeedData, popoverOptions, isCommentSection, onPopoverClick,
}: Props) {
  const [postData, setPostData] = useState<Post[]>(postFeedData);
  const [openLikeShareModal, setOpenLikeShareModal] = useState<boolean>(false);
  const [buttonClick, setButtonClck] = useState<string>('');

  useEffect(() => {
    setPostData(postFeedData);
  }, [postFeedData]);

  const openDialogue = (click: string) => {
    setOpenLikeShareModal(true);
    setButtonClck(click);
  };
  const onLikeClick = (likeId: string) => {
    const likeData = postData.map((checkLikeId: Post) => {
      if (checkLikeId.id === likeId) {
        return { ...checkLikeId, likeIcon: !checkLikeId.likeIcon };
      }
      return checkLikeId;
    });
    setPostData(likeData);
  };

  return (
    <StyledPostFeed>
      {postData.map((post: any) => (
        <div key={post.id} className="post">
          <Card className="bg-mobile-transparent border-0 rounded-3 mb-md-4 bg-dark mb-0 pt-md-3 px-sm-0 px-md-4">
            <Card.Header className="border-0 px-0 bg-transparent">
              <PostHeader
                userName={post.userName}
                postDate={post.postDate}
                profileImage={post.profileImage}
                popoverOptions={popoverOptions}
                onPopoverClick={onPopoverClick}
              />
            </Card.Header>
            <Card.Body className="px-0 pt-3">
              <div>
                <Content dangerouslySetInnerHTML={
                  { __html: linkifyHtml(decryptMessage(post.content)) }
                }
                />
                {post.hashTag?.map((hashtag: string) => (
                  <span role="button" key={hashtag} tabIndex={0} className="fs-4 text-primary me-1" aria-hidden="true">
                    #
                    {hashtag}
                  </span>
                ))}
              </div>
              <CustomSwiper pagination modules={[Pagination]} className="mySwiper swiper-container">
                {
                  post?.images.map((images: any) => (
                    <SwiperSlide key={images.image_path}>
                      <Link to={`/${post.userName}/posts/${post.id}`}>
                        <PostImage>
                          <img src={images.image_path} className="w-100" alt="not found" />
                        </PostImage>
                      </Link>
                    </SwiperSlide>
                  ))
                }
              </CustomSwiper>
              <Row className="pt-3 px-md-3">
                <Col>
                  <LinearIcon uniqueId="like-button" role="button" onClick={() => openDialogue('like')}>
                    <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                    <span className="fs-3">{post.likeCount}</span>
                  </LinearIcon>
                </Col>
                <Col className="text-center" role="button">
                  <Link to={`/${post.userName}/posts/${post.id}`} className="text-decoration-none">
                    <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                    <span className="fs-3">{post.commentCount}</span>
                  </Link>
                </Col>
                <Col className="text-end" role="button" onClick={() => openDialogue('share')}>
                  <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
                  <span className="fs-3">{post.sharedList}</span>
                </Col>
                <svg width="0" height="0">
                  <linearGradient id="like-button" x1="00%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                    <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
                  </linearGradient>
                </svg>
              </Row>
            </Card.Body>
            <PostFooter
              likeIcon={post.likeIcon}
              id={post.id}
              onLikeClick={() => onLikeClick(post.id)}
            />
            {
              isCommentSection
              && (
                <>
                  <StyledBorder className="d-md-block d-none mb-4" />
                  <PostCommentSection
                    commentSectionData={post.comment}
                    commentImage={post.profileImage}
                    popoverOption={popoverOptions}
                  />
                </>
              )
            }
          </Card>
        </div>
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
    </StyledPostFeed>
  );
}
PostFeed.defaultProps = {
  isCommentSection: false,
};
export default PostFeed;
