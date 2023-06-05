import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Card, Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { useLocation, Link } from 'react-router-dom';
import ShareLinkButton from '../../ShareLinkButton';
import { LikeShareModalResourceName, LikeShareModalTabName } from '../../../../types';
import { urlForNewsPost, urlForUserPost } from '../../../../utils/url-utils';

interface LinearIconProps {
  uniqueId?: string
}
interface PostFooterProps {
  likeIcon: boolean;
  postId: string;
  userName: string;
  rssfeedProviderId?: string;
  onLikeClick: (id: string) => void
  onSelect?: (value: string) => void
  likeCount?: number;
  commentCount?: string;
  postType?: string;
  handleLikeModal?: (
    modalTabNameValue: LikeShareModalTabName,
    modaResourceNameValue: LikeShareModalResourceName | null,
    modalResourceIdValue: string,
    modalLikeCountValue: number,
  ) => void;
  movieId?: string;
  detailsPage?: boolean;
  onCommentClick?: () => void
}
const StyleDot = styled(FontAwesomeIcon)`
  width: 0.267rem;
  height: 0.267rem;
`;
const LinearIcon = styled.span<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
function PostFooter({
  likeIcon, postId, userName, rssfeedProviderId, onLikeClick, onSelect,
  likeCount, commentCount, handleLikeModal, postType, movieId, detailsPage, onCommentClick,
}: PostFooterProps) {
  const { pathname } = useLocation();
  return (
    <Card.Footer className="p-0">
      <Row className="justify-content-start pt-3">
        <Col
          xs={4}
        >
          <div className="d-flex align-items-center">
            <Button className="p-0" variant="link" onClick={() => onLikeClick(postId)}>
              {likeIcon ? (
                <LinearIcon uniqueId="like-button-footer">
                  <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                  <span className="fs-3 d-none d-md-inline me-2">Like</span>
                </LinearIcon>
              ) : (
                <>
                  <FontAwesomeIcon icon={regular('heart')} size="lg" className="me-2" />
                  <span className="fs-3 d-none d-md-inline d-lg-none d-xl-inline me-2">Like</span>
                </>
              )}
            </Button>
            <StyleDot icon={solid('circle')} size="xs" className="py-1 me-2" />
            {Number(likeCount) === 0 ? <span className="fs-3">{likeCount}</span>
              : (
                <Button
                  className="bg-transparent border-0 btn btn-primary p-0 text-white"
                  onClick={() => handleLikeModal?.('like', 'feedpost', postId, Number(likeCount))}
                >
                  <span className="fs-3">{likeCount}</span>
                </Button>
              )}
          </div>
        </Col>
        <Col
          xs={4}
          /* eslint-disable no-nested-ternary */
          className="text-center"
        >
          {!detailsPage
            ? (
              <Link
                onClick={() => (postType !== 'review' && onSelect!(rssfeedProviderId || postId))}
                to={
                  (postType === 'review' && movieId && `/app/movies/${movieId}/reviews/${postId}`)
                  || (rssfeedProviderId
                    ? `/app/news/partner/${rssfeedProviderId}/posts/${postId}`
                    : `/${userName}/posts/${postId}`)
                }
                state={pathname}
                className="d-inline-block text-decoration-none rounded"
              >
                <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                <span className="fs-3 d-none d-md-inline d-lg-none d-xl-inline me-2">Comment</span>
                <StyleDot icon={solid('circle')} size="xs" className="py-1 me-2" />
                <span className="fs-3">{commentCount}</span>
              </Link>
            )
            : (
              <Button variant="link" onClick={onCommentClick}>
                <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                <span className="fs-3 d-none d-md-inline d-lg-none d-xl-inline me-2">Comment</span>
                <StyleDot icon={solid('circle')} size="xs" className="py-1 me-2" />
                <span className="fs-3">{commentCount}</span>
              </Button>
            )}
        </Col>
        <Col xs={4} className={'text-end \'d-inline\'}'}>
          <ShareLinkButton text textClass={postType === 'group-post' ? 'd-none d-md-inline d-lg-none d-xl-inline' : 'd-none d-md-inline d-lg-none d-xl-inline'} copyLinkUrl={rssfeedProviderId ? urlForNewsPost(rssfeedProviderId!, postId!) : urlForUserPost(userName!, postId!)} />
        </Col>
        <svg width="0" height="0">
          <linearGradient id="like-button-footer" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
          </linearGradient>
        </svg>
      </Row>
    </Card.Footer>
  );
}

PostFooter.defaultProps = {
  rssfeedProviderId: '',
  onSelect: undefined,
  likeCount: '',
  commentCount: '',
  handleLikeModal: () => { },
  postType: '',
  movieId: '',
  detailsPage: false,
  onCommentClick: () => { },
};
export default PostFooter;
