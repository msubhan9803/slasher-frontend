import React, { useEffect, useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Card, Col, Row,
} from 'react-bootstrap';
import { DateTime } from 'luxon';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import Cookies from 'js-cookie';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import NewsPartnerPostFooter from './NewsPartnerPostFooter';
import CustomPopover from '../../../components/ui/CustomPopover';
import ReportModal from '../../../components/ui/ReportModal';
import UserCircleImage from '../../../components/ui/UserCircleImage';
import { feedPostDetail } from '../../../api/feed-posts';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import { NewsPartnerPostProps } from '../../../types';
import CustomSwiper from '../../../components/ui/CustomSwiper';
import { likeFeedPost, unlikeFeedPost } from '../../../api/feed-likes';

interface LinearIconProps {
  uniqueId?: string
}
const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;

function NewsPartnerPost() {
  const { newsPartnerId, postId } = useParams<string>();
  const [postData, setPostData] = useState<NewsPartnerPostProps>();
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const navigate = useNavigate();
  const popoverOption = ['Report'];
  const loginUserId = Cookies.get('userId');

  const getFeedPostDetail = (feedPostId: string) => {
    feedPostDetail(feedPostId).then((res) => {
      /* eslint no-underscore-dangle: 0 */
      if (newsPartnerId !== res.data.rssfeedProviderId?._id) {
        navigate(`/news/partner/${res.data.rssfeedProviderId?._id}/posts/${postId}`);
      }
      const newsPost: any = {
        /* eslint no-underscore-dangle: 0 */
        _id: res.data._id,
        id: res.data._id,
        postDate: res.data.createdAt,
        title: res.data.rssfeedProviderId?.title,
        content: res.data.message,
        images: res.data.images,
        rssFeedProviderLogo: res.data.rssfeedProviderId?.logo,
        commentCount: res.data.commentCount,
        likeCount: res.data.likeCount,
        sharedList: res.data.sharedList,
        likes: res.data.likes,
        likeIcon: res.data.likes.includes(loginUserId),
      };
      setPostData(newsPost);
    }).catch(
      (error) => {
        setErrorMessage(error.response.data.message);
      },
    );
  };

  useEffect(() => {
    if (postId) {
      getFeedPostDetail(postId);
    }
  }, [postId]);

  const handlePopover = (selectedOption: string) => {
    setShow(true);
    setDropDownValue(selectedOption);
  };

  const onLikeClick = (likeId: string) => {
    const checkLike = postData?.likes?.includes(loginUserId!);
    if (postId) {
      if (checkLike) {
        unlikeFeedPost(likeId).then((res) => {
          if (res.status === 200) getFeedPostDetail(postId);
        });
      } else {
        likeFeedPost(likeId).then((res) => {
          if (res.status === 201) getFeedPostDetail(postId);
        });
      }
    }
    // let checkLikeId = postData;
    // if (checkLikeId && checkLikeId.id === likeId) {
    //   checkLikeId = { ...checkLikeId, likeIcon: !checkLikeId.likeIcon };
    // }
    // setPostData(checkLikeId);
  };

  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      <Row className="mb-5 px-2">
        <Col className="p-0">
          {errorMessage && errorMessage.length > 0 && (
            <div className="mt-3 text-start">
              <ErrorMessageList errorMessages={errorMessage} className="m-0" />
            </div>
          )}
          {postData && (
            <Card className="rounded-3 bg-mobile-transparent bg-dark mb-0 pt-3 px-sm-0 px-md-4" key={postData.id}>
              <Card.Header className="border-0 px-sm-3 px-md-0">
                <Row className="justify-content-between">
                  <Col xs="auto">
                    <Row className="d-flex">
                      <Col className="my-auto rounded-circle" xs="auto">
                        <div className="rounded-circle">
                          <UserCircleImage src={postData.rssFeedProviderLogo} className="bg-secondary" />
                        </div>
                      </Col>
                      <Col xs="auto" className="ps-0 align-self-center">
                        <h3 className="mb-0">{postData.title}</h3>
                        <p className="fs-6 text-light mb-0">
                          {DateTime.fromISO(postData.postDate).toFormat('MM/dd/yyyy t')}
                        </p>
                      </Col>
                    </Row>
                  </Col>
                  <Col xs="auto" className="d-block">
                    <CustomPopover popoverOptions={popoverOption} onPopoverClick={handlePopover} />
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body className="px-0 py-3">
                <Row>
                  <Col className="px-4 px-md-2 ms-md-1">
                    <p className="fs-4 mb-0">
                      {postData.content}
                    </p>
                  </Col>
                </Row>
                {postData.images && (
                  <CustomSwiper
                    images={
                      postData.images.map((imageData: any) => ({
                        imageUrl: imageData.image_path,
                        postId: postData.id,
                        imageId: imageData._id,
                      }))
                    }
                  />
                )}
                <Row className="fs-3 d-flex justify-content-evenly ps-1 mt-2">
                  <Col className="align-self-center">
                    <Button variant="link" className="shadow-none fw-normal fs-3">
                      <LinearIcon uniqueId="like-button">
                        <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                        {postData.likeCount}
                      </LinearIcon>
                    </Button>
                  </Col>
                  <Col className="text-center">
                    <Button variant="link" className="shadow-none fw-normal fs-3">
                      <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                      {postData.commentCount}
                    </Button>
                  </Col>
                  <Col className="text-end">
                    <Button variant="link" className="shadow-none fw-normal fs-3">
                      <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
                      {postData.sharedList}
                    </Button>
                  </Col>
                  <svg width="0" height="0">
                    <linearGradient id="like-button" x1="00%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#FF1800', stopOpacity: '1' }} />
                      <stop offset="100%" style={{ stopColor: '#FB6363', stopOpacity: '1' }} />
                    </linearGradient>
                  </svg>
                </Row>
              </Card.Body>
              <NewsPartnerPostFooter
                likeIcon={postData.likeIcon}
                id={postData.id}
                onLikeClick={() => onLikeClick(postData.id)}
                isComment={false}
              />
            </Card>
          )}
        </Col>
      </Row>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}
export default NewsPartnerPost;
