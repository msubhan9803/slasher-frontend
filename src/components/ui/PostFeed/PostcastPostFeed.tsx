import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Row, Col } from 'react-bootstrap';
import styled from 'styled-components';
import RoundButton from '../RoundButton';
import PostFooter from './PostFooter';
import PostHeader from './PostHeader';

interface LinearIconProps {
  uniqueId?: string
}
interface Props {
  episode: EpisodeProps
}
interface EpisodeProps {
  id: string,
  userName: string,
  podcastImage: string,
  postDate: string,
  podcast: string,
  episodeTimeWise: string,
  content: string,
  likeIcon: boolean,
}
const LinearIcon = styled.div<LinearIconProps>`
    svg * {
      fill: url(#${(props) => props.uniqueId});
    }
  `;
const StylePlayButton = styled(RoundButton)`
    width: 2.667rem;
    height: 2.667rem;
  `;
const StyledPodcastPlay = styled.div`
    background: #0F0F0F;;
  `;
function PostcastPostFeed({ episode }: Props) {
  const [postData, setPostData] = useState<EpisodeProps>(episode);

  const onLikeClick = (likeId: string) => {
    let checkLikeId = postData;
    if (checkLikeId.id === likeId) {
      checkLikeId = { ...checkLikeId, likeIcon: !checkLikeId.likeIcon };
    }
    setPostData(checkLikeId);
  };

  return (
    <Card className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 pt-md-3 px-sm-0 px-md-4">
      <Card.Header className="border-0 px-0">
        <PostHeader
          // userName={postData?.userName}
          // postDate={postData.postDate}
          // profileImage={postData.podcastImage}
          detailPage={false}
          id={postData.id}
          userName={postData.userName}
          postDate={postData.postDate}
          profileImage={postData.podcastImage}
          // popoverOptions={[]}
          // onPopoverClick={undefined}
          content={postData.content}
        />
      </Card.Header>
      <Card.Body className="px-0 mt-2">
        <StyledPodcastPlay className="d-flex align-items-center p-3 mb-4 rounded">
          <StylePlayButton className="me-3">
            <FontAwesomeIcon icon={solid('play')} size="lg" />
          </StylePlayButton>
          <div>
            <h1 className="h3 fw-bold m-0">{postData.podcast}</h1>
            <p className="m-0 fs-3 text-light">{postData.episodeTimeWise}</p>
          </div>
        </StyledPodcastPlay>
        {postData.content}
        <Row className="pt-3 px-md-3">
          <Col>
            <LinearIcon uniqueId="like-button" role="button">
              <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
              <span className="fs-3">12K</span>
            </LinearIcon>
          </Col>
          <Col className="text-center" role="button">
            <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
            <span className="fs-3">10</span>
          </Col>
          <Col className="text-end" role="button">
            <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
            <span className="fs-3">25</span>
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
        likeIcon={postData.likeIcon}
        postId={postData.id}
        userName={postData.userName}
        onLikeClick={() => { if (onLikeClick) onLikeClick(postData.id); }}
      />
    </Card>
  );
}

PostcastPostFeed.default = {
  hastags: [],
};

export default PostcastPostFeed;
