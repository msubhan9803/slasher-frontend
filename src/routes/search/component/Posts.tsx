import React, { useState } from 'react';
import { solid, regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Image, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { SearchProps } from '../SearchInterface';
import postImage from '../../../images/news-post.svg';
import CustomPopover from '../../../components/ui/CustomPopover';
import ReportModal from '../../../components/ui/ReportModal';
import UserCircleImage from '../../../components/ui/UserCircleImage';

interface LinearIconProps {
  uniqueId?: string
}
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const CardFooter = styled(Card.Footer)`
  border-top: .063rem solid #242424
`;
const StyledPostImage = styled(Row)`
  aspect-ratio: 1.64;
  img {
    object-fit: cover;
  }
`;

function Posts({
  id, name, image, date, content, hashTag,
}: SearchProps) {
  const [like, setLike] = useState(false);
  const [iD, setID] = useState<number>();
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const popoverOption = ['Report'];

  const handlePopover = (selectedOption: string) => {
    setShow(true);
    setDropDownValue(selectedOption);
  };
  const onLikeClick = (likedID: number) => {
    setLike(!like);
    setID(likedID);
  };

  return (
    <>
      <Row className="my-3 px-2">
        <Col className="p-0">
          <Card className="rounded-3 bg-mobile-transparent bg-dark mb-0 pt-3 px-sm-0 px-md-4" key={id}>
            <Card.Header className="d-flex justify-content-between border-0 px-0 bg-mobile-transparent bg-dark">
              <div className="d-flex align-items-center">
                <UserCircleImage src={image} className="rounded-circle bg-secondary" />
                <div className="ms-3">
                  <h1 className="mb-0 h3 fw-bold">{name}</h1>
                  <span className="mb-0 text-light fs-6">{date}</span>
                </div>
              </div>
              <CustomPopover popoverOptions={popoverOption} onPopoverClick={handlePopover} />
            </Card.Header>
            <Card.Body className="px-0 pt-2">
              <Row>
                <Col>
                  <span className="fs-4">
                    {content}
                  </span>
                  <br />
                  {hashTag?.map((hashtag: string) => (
                    <span key={hashtag} className="fs-4 text-primary cursor-pointer">
                      #
                      {hashtag}
                      &nbsp;
                    </span>
                  ))}
                  ☠️
                </Col>
              </Row>
              <StyledPostImage className="mt-3">
                <Image src={postImage} className="w-100 h-100" />
              </StyledPostImage>
              <Row className="d-flex justify-content-evenly pt-3 px-3">
                <Col>
                  <LinearIcon uniqueId="like-button-post">
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
                  <linearGradient id="like-button-post" x1="00%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                    <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
                  </linearGradient>
                </svg>
              </Row>
            </Card.Body>
            <CardFooter className="p-0">
              <Row className=" d-flex justify-content-evenly py-3 px-3">
                <Col role="button" onClick={() => onLikeClick(id)}>
                  {like && (id === iD) ? (
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
          </Card>
        </Col>
      </Row>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </>
  );
}

export default Posts;
