import React, { useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card, Col, Dropdown, Image, Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import BlockDialog from '../../../components/ui/BlockDialog';
import ReportDialog from '../../../components/ui/Reportdialog';
import { CustomDropDown } from '../../../components/ui/UserMessageList/UserMessageListItem';
import userImage from '../../../placeholder-images/placeholder-user.jpg';
import postImage from '../../../images/news-post.svg';

interface LinearIconProps {
  uniqueId?: string
}

const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const SmallText = styled.p`
  font-size: small;
  color: #CCCCCC;
`;
const ProfileImage = styled(Image)`
  height:3.313rem;
  width:3.313rem;
`;
const CardFooter = styled(Card.Footer)`
  border-top: .063rem solid #242424
`;
const CursorPointer = styled.span`
  cursor:Pointer;
`;

const postData = [
  {
    id: 1, userName: 'Horror Oasis', postDate: '06/11/2022 11:10 PM', content: 'This space is used to help indie creators have a platform to promote their work.', hashTag: ['horrorday', 'slasher', 'horroroasis'],
  },
  {
    id: 2, userName: 'Horror Oasis1', postDate: '07/10/2022 11:10 PM', content: 'This space is used to help indie creators have a platform to promote their work.', hashTag: ['horrorday', 'slasher', 'horroroasis'],
  },
  {
    id: 3, userName: 'Horror Oasis2', postDate: '08/09/2022 11:10 PM', content: 'This space is used to help indie creators have a platform to promote their work.', hashTag: ['horrorday', 'slasher', 'horroroasis'],
  },
  {
    id: 4, userName: 'Horror Oasis3', postDate: '09/12/2022 11:10 PM', content: 'This space is used to help indie creators have a platform to promote their work.', hashTag: ['horrorday', 'slasher', 'horroroasis'],
  },
];

function NewsPostData() {
  const navigate = useNavigate();
  const [like, setLike] = useState(false);
  const [id, setId] = useState<number>();
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');

  const onLikeClick = (likeId: number) => {
    setLike(!like);
    setId(likeId);
  };

  const handleNewsOption = (newsValue: string) => {
    setShow(true);
    setDropDownValue(newsValue);
  };

  const onHashtagClick = (hashtag: string) => {
    navigate('/search', { state: hashtag });
  };

  const onProfileDetailClick = () => {
    navigate('/news/partner/1');
  };
  return (
    <>
      {
        postData.map((post) => (
          <Card key={post.id} className="bg-dark mb-5 my-3">
            <Card.Header className="border-0 ps-1 ps-md-3">
              <Row className="align-items-center">
                <Col xs={11}>
                  <Row className="d-flex">
                    <Col className="my-auto rounded-circle" xs="auto">
                      <div className="rounded-circle">
                        <CursorPointer><ProfileImage src={userImage} className="rounded-circle bg-secondary" onClick={() => { onProfileDetailClick(); }} /></CursorPointer>
                      </div>
                    </Col>
                    <Col xs="auto" className="ps-0 align-self-center">
                      <CursorPointer><h1 className="mb-0 h6" onClick={() => { onProfileDetailClick(); }}>{post.userName}</h1></CursorPointer>
                      <CursorPointer><SmallText className="mb-0" onClick={() => { onProfileDetailClick(); }}>{post.postDate}</SmallText></CursorPointer>
                    </Col>
                  </Row>
                </Col>
                <Col xs={1} className="d-none d-md-block">
                  <CustomDropDown onSelect={handleNewsOption}>
                    <Dropdown.Toggle className="d-flex justify-content-end bg-transparent pt-1">
                      <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="bg-black">
                      <Dropdown.Item eventKey="block" className="text-light">Block</Dropdown.Item>
                      <Dropdown.Item eventKey="report" className="text-light">Report</Dropdown.Item>
                    </Dropdown.Menu>
                  </CustomDropDown>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="ps-1 ps-md-3 pt-1">
              <Row>
                <Col xs={12}>
                  <>
                    <span className="p">{post.content}</span>
                    {post.hashTag?.map((hashtag) => (
                      <CursorPointer key={hashtag} className="text-primary p cursor-pointer" onClick={() => onHashtagClick(hashtag)}>
                        {' '}
                        #
                        {hashtag}
                      </CursorPointer>
                    ))}
                    ☠️
                  </>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col className="">
                  <Image src={postImage} className="w-100" />
                </Col>
              </Row>
              <Row className="justify-content-between d-flex m-2">
                <Col>
                  <LinearIcon uniqueId="like-button">
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
                  <linearGradient id="like-button" x1="00%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                    <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
                  </linearGradient>
                </svg>
              </Row>
            </Card.Body>
            <CardFooter>
              <Row className="justify-content-between d-flex m-2">
                <Col className="p-0">
                  {like && (post.id === id)
                    ? (
                      <LinearIcon uniqueId="like-button">
                        <FontAwesomeIcon role="button" onClick={() => onLikeClick(post.id)} icon={solid('heart')} size="lg" className="me-2" />
                        Like
                      </LinearIcon>
                    )
                    : (
                      <>
                        <FontAwesomeIcon role="button" onClick={() => onLikeClick(post.id)} icon={regular('heart')} size="lg" className="me-2" />
                        Like
                      </>
                    )}
                </Col>
                <Col className="text-center p-0">
                  <FontAwesomeIcon role="button" icon={regular('comment-dots')} size="lg" className="me-2" />
                  Comment
                </Col>
                <Col className="text-end p-0">
                  <FontAwesomeIcon role="button" icon={solid('share-nodes')} size="lg" className="me-2" />
                  Share
                </Col>
              </Row>
            </CardFooter>
          </Card>
        ))
      }
      {dropDownValue === 'report'
        && <ReportDialog show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />}
      {dropDownValue === 'block'
        && <BlockDialog show={show} setShow={setShow} slectedMessageDropdownValue={dropDownValue} />}
    </>
  );
}
export default NewsPostData;
