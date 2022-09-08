import React from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Card, Col, Row,
} from 'react-bootstrap';
import styled from 'styled-components';

interface LinearIconProps {
  uniqueId?: string
}
interface Props {
  likeIcon: boolean;
  id: number;
  onLikeClick: (val: number) => void
}
const CardFooter = styled(Card.Footer)`
  border-top: 1px solid #3A3B46;
`;
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;

function NewsPartnerPostFooter({ likeIcon, id, onLikeClick }: Props) {
  return (
    <CardFooter className="p-0 ps-1 pb-md-4">
      <Row className="fs-3 d-flex justify-content-evenly py-2">
        <Col>
          <Button variant="link" className="shadow-none fw-normal fs-3" onClick={() => onLikeClick(id)}>
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
          </Button>
        </Col>
        <Col className="text-center" role="button">
          <Button variant="link" className="shadow-none fw-normal fs-3">
            <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
            Comment
          </Button>
        </Col>
        <Col className="text-end" role="button">
          <Button variant="link" className="shadow-none fw-normal fs-3">
            <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
            Share
          </Button>
        </Col>
        <svg width="0" height="0">
          <linearGradient id="like-button-footer" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
            <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
          </linearGradient>
        </svg>
      </Row>
      <CardFooter className="p-0 d-none d-md-flex" />
    </CardFooter>
  );
}

export default NewsPartnerPostFooter;
