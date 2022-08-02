import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, Col, Row } from 'react-bootstrap';
import styled from 'styled-components';

interface LinearIconProps {
  uniqueId?: string
}
interface PostFooterProps {
  likeIcon: boolean;
  id: number;
  onLikeClick: (id: number) => void
}
const CardFooter = styled(Card.Footer)`
  border-top: .063rem solid  #3A3B46
`;
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
function PostFooter({ likeIcon, id, onLikeClick }: PostFooterProps) {
  return (
    <CardFooter className="p-0">
      <Row className=" d-flex justify-content-evenly py-3 px-3">
        <Col role="button" onClick={() => onLikeClick(id)}>
          {likeIcon ? (
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
          <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
          Share
        </Col>
        <svg width="0" height="0">
          <linearGradient id="like-button-footer" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
          </linearGradient>
        </svg>
      </Row>
    </CardFooter>
  );
}

export default PostFooter;
