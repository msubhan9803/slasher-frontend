import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Card, Col, Dropdown, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { HashLink } from 'react-router-hash-link';
import { CustomDropDown } from '../UserMessageList/UserMessageListItem';
import { scrollWithOffset } from '../../../utils/scrollFunctions';
import ShareLinksModal from '../ShareLinksModal';

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
}
const CardFooter = styled(Card.Footer)`
  border-top: .063rem solid  #3A3B46
`;
const LinearIcon = styled.span<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
function PostFooter({
  likeIcon, postId, userName, rssfeedProviderId, onLikeClick, onSelect,
}: PostFooterProps) {
  const [showShareLinks, setShowShareLinks] = useState(false);
  const handleShowShareLinks = () => setShowShareLinks(true);
  return (
    <CardFooter className="p-0">
      <Row className="justify-content-evenly py-3 px-md-3">
        <Col>
          <Button className="p-0" variant="link" onClick={() => onLikeClick(postId)}>
            {likeIcon ? (
              <LinearIcon uniqueId="like-button-footer">
                <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                <span className="fs-3">Like</span>
              </LinearIcon>
            )
              : (
                <>
                  <FontAwesomeIcon icon={regular('heart')} size="lg" className="me-2" />
                  <span className="fs-3">Like</span>
                </>
              )}
          </Button>
        </Col>
        <Col className="text-center">
          <HashLink
            onClick={() => onSelect!(rssfeedProviderId || postId)}
            to={rssfeedProviderId
              ? `/app/news/partner/${rssfeedProviderId}/posts/${postId}#comments`
              : `/${userName}/posts/${postId}#comments`}
            className="text-decoration-none"
            scroll={scrollWithOffset}
          >
            <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
            <span className="fs-3">Comment</span>
          </HashLink>
        </Col>
        <Col className="text-end">
          <CustomDropDown>
            <Dropdown.Toggle onClick={handleShowShareLinks} className="cursor-pointer bg-transparent p-0 text-white">
              <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
              <span className="fs-3">Share</span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="bg-black">
              <Dropdown.Item eventKey="Share as a post" className="text-light">Unavailable in Beta.</Dropdown.Item>
              {/*
                <Dropdown.Item eventKey="Share as a post" className="text-light">
                Share as a post
                </Dropdown.Item>
                <Dropdown.Item eventKey="Share in a message" className="text-light">
                Share in a message
                </Dropdown.Item>
                <Dropdown.Item eventKey="More options" className="text-light">
                More options
                </Dropdown.Item>
              */}
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
      {showShareLinks && <ShareLinksModal show={showShareLinks} setShow={setShowShareLinks} />}
    </CardFooter>
  );
}

PostFooter.defaultProps = {
  rssfeedProviderId: '',
  onSelect: undefined,
};

export default PostFooter;
