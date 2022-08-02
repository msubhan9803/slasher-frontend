import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import PostHeader from './PostHeader';
import PostFooter from './PostFooter';

interface LinearIconProps {
  uniqueId?: string
}
interface PostProps {
  id: number;
  userName: string;
  postDate: string;
  content: string;
  hashTag: string[];
  likeIcon: boolean;
  postUrl?: string;
  profileImage: string;
}
interface Props {
  postFeedData: PostProps[]
}
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const PostImage = styled(Image)`
  aspectRatio : 1.9;
`;
const PostTopBorder = styled.div`
    border-bottom: .063rem solid #3A3B46
`;

function PostFeed({ postFeedData }: Props) {
  const [postData, setPostData] = useState<PostProps[]>(postFeedData);

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
    <>
      {postData.map((post: PostProps) => (
        <div key={post.id}>
          <PostTopBorder className="d-md-none d-block" />
          <Card className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 pt-md-3 px-sm-0 px-md-4 my-3">
            <Card.Header className="border-0 px-0">
              <PostHeader
                userName={post.userName}
                postDate={post.postDate}
                profileImage={post.profileImage}
              />
            </Card.Header>
            <Card.Body className="px-0 pt-3">
              <div>
                <p className="mb-0 fs-4">{post.content}</p>
                {post.hashTag?.map((hashtag: string) => (
                  <span role="button" key={hashtag} tabIndex={0} className="fs-4 text-primary me-1" aria-hidden="true">
                    #
                    {hashtag}
                  </span>
                ))}
              </div>
              {post?.postUrl && (
                <div className="mt-3">
                  <PostImage src={post?.postUrl} className="w-100" />
                </div>
              )}
              <Row className="pt-3 px-3">
                <Col>
                  <LinearIcon uniqueId="like-button" role="button">
                    <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                    12K
                  </LinearIcon>
                </Col>
                <Col className="text-center" role="button">
                  <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                  10
                </Col>
                <Col className="text-end" role="button">
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
            <PostFooter
              likeIcon={post.likeIcon}
              id={post.id}
              onLikeClick={() => onLikeClick(post.id)}
            />
          </Card>
        </div>
      ))}
    </>
  );
}
export default PostFeed;
