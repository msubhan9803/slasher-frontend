/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Card, Col, Dropdown, Row,
} from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import InfiniteScroll from 'react-infinite-scroller';
import Cookies from 'js-cookie';
import { CustomDropDown } from '../../../components/ui/UserMessageList/UserMessageListItem';
import NewPostHeader from './NewPostHeader';
import LikeShareModal from '../../../components/ui/LikeShareModal';
import { getRssFeedProviderPosts } from '../../../api/rss-feed';
import { NewsPartnerPostProps } from '../../../types';
import CustomSwiper from '../../../components/ui/CustomSwiper';
import { likeFeedPost, unlikeFeedPost } from '../../../api/feed-likes';

interface Props {
  partnerId: string;
}

interface LinearIconProps {
  uniqueId?: string
}

const LinearIcon = styled.div<LinearIconProps>`
  svg * {
    fill: url(#${(props) => props.uniqueId});
  }
`;
const CardFooter = styled(Card.Footer)`
  border-top: 1px solid #3A3B46
`;

function NewsPostData({ partnerId }: Props) {
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<Boolean>(false);
  const [postData, setPostData] = useState<any>([]);
  const [openLikeShareModal, setOpenLikeShareModal] = useState<boolean>(false);
  const [buttonClick, setButtonClck] = useState<string>('');
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('imageId');
  const loginUserId = Cookies.get('userId');

  const openDialogue = (click: string) => {
    setOpenLikeShareModal(true);
    setButtonClck(click);
  };

  useEffect(() => {
    if (partnerId && requestAdditionalPosts && !loadingPosts) {
      setLoadingPosts(true);
      getRssFeedProviderPosts(
        partnerId,
        postData.length > 1 ? postData[postData.length - 1]._id : undefined,
      ).then((res) => {
        const newPosts = res.data.map((data: any) => ({
          /* eslint no-underscore-dangle: 0 */
          _id: data._id,
          id: data._id,
          postDate: data.createdAt,
          content: data.message,
          images: data.images,
          userName: data.rssfeedProviderId?.title,
          rssFeedProviderLogo: data.rssfeedProviderId?.logo,
          likes: data.likes,
          likeIcon: data.likes.includes(loginUserId),
          likeCount: data.likeCount,
          commentCount: data.commentCount,
        }));
        setPostData((prev: NewsPartnerPostProps[]) => [
          ...prev,
          ...newPosts,
        ]);
        if (res.data.length === 0) { setNoMoreData(true); }
      }).catch(
        () => {
          setNoMoreData(true);
        },
      ).finally(
        () => { setRequestAdditionalPosts(false); setLoadingPosts(false); },
      );
    }
  }, [partnerId, requestAdditionalPosts, loadingPosts]);

  const renderLoadingIndicator = () => (
    <p className="text-center">Loading...</p>
  );

  const renderNoMoreDataMessage = () => (
    <p className="text-center">
      {
        postData.length === 0
          ? 'No posts available'
          : 'No more posts'
      }
    </p>
  );

  const callLatestFeedPost = () => {
    getRssFeedProviderPosts(partnerId).then((res) => {
      const newPosts = res.data.map((data: any) => ({
        _id: data._id,
        id: data._id,
        postDate: data.createdAt,
        content: data.message,
        images: data.images,
        userName: data.rssfeedProviderId?.title,
        rssFeedProviderLogo: data.rssfeedProviderId?.logo,
        likes: data.likes,
        likeIcon: data.likes.includes(loginUserId),
        likeCount: data.likeCount,
        commentCount: data.commentCount,
      }));
      setPostData(newPosts);
    });
  };

  const onLikeClick = (likeId: string) => {
    const checkLike = postData.some((post: any) => post.id === likeId
      && post.likes?.includes(loginUserId!));

    if (checkLike) {
      unlikeFeedPost(likeId).then((res) => {
        if (res.status === 200) callLatestFeedPost();
      });
    } else {
      likeFeedPost(likeId).then((res) => {
        if (res.status === 201) callLatestFeedPost();
      });
    }
  };

  return (
    <>
      <InfiniteScroll
        pageStart={0}
        initialLoad
        loadMore={() => { setRequestAdditionalPosts(true); }}
        hasMore={!noMoreData}
      >
        {postData.map((post: NewsPartnerPostProps) => (
          <Card className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 pt-md-3 px-sm-0 px-md-4 my-3" key={post.id}>
            <Card.Header className="border-0 px-0">
              <NewPostHeader
                partnerId={partnerId}
                postId={post._id}
                logo={post.rssFeedProviderLogo}
                userName={post.title}
                postDate={post.postDate}
              />
            </Card.Header>
            <Card.Body className="px-0 pt-3 pb-2">
              <div>
                <p className="mb-0 fs-4">{post.content}</p>
              </div>
              <Row className="mt-3">
                {post?.images && (
                  <CustomSwiper
                    images={
                      post.images.map((imageData: any) => ({
                        imageUrl: imageData.image_path,
                        linkUrl: `/news/partner/${partnerId}/posts/${post.id}`,
                        postId: post.id,
                        imageId: imageData._id,
                      }))
                    }
                    /* eslint no-underscore-dangle: 0 */
                    initialSlide={post.images.findIndex((image: any) => image._id === queryParam)}
                  />
                )}
              </Row>
              <Row className="fs-3 d-flex justify-content-evenly ps-1 mt-2">
                <Col className="align-self-center">
                  <Button variant="link" className="shadow-none fw-normal fs-3" onClick={() => openDialogue('like')}>
                    <LinearIcon uniqueId="like-button">
                      <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" />
                      {post.likeCount}
                    </LinearIcon>
                  </Button>
                </Col>
                <Col className="text-center">
                  <Link className="bg-transparent text-decoration-none text-white border-0 fw-normal fs-3 shadow-none" to="/news/partner/posts/1">
                    <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                    {post.commentCount}
                  </Link>
                </Col>
                <Col className="text-end">
                  <Button variant="link" className="shadow-none fw-normal fs-3" onClick={() => openDialogue('share')}>
                    <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
                    {post.sharedList}
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
            <CardFooter className="p-0 ps-1">
              <Row className="fs-3 d-flex justify-content-evenly pt-2">
                <Col>
                  <Button variant="link" className="shadow-none fw-normal fs-3" onClick={() => onLikeClick(post.id)}>
                    {post.likeIcon ? (
                      <LinearIcon uniqueId="like-button-footer">
                        <FontAwesomeIcon icon={solid('heart')} size="lg" className="me-2" role="button" onClick={() => onLikeClick(post.id)} />
                        Like
                      </LinearIcon>
                    )
                      : (
                        <>
                          <FontAwesomeIcon icon={regular('heart')} size="lg" className="me-2" role="button" onClick={() => onLikeClick(post.id)} />
                          Like
                        </>
                      )}
                  </Button>
                </Col>
                <Col className="text-center">
                  <Button variant="link" className="shadow-none fw-normal fs-3">
                    <FontAwesomeIcon icon={regular('comment-dots')} size="lg" className="me-2" />
                    Comment
                  </Button>
                </Col>
                <Col className="text-end">
                  <CustomDropDown>
                    <Dropdown.Toggle className="bg-transparent pt-1" variant="link">
                      <FontAwesomeIcon icon={solid('share-nodes')} size="lg" className="me-2" />
                      Share
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="bg-black">
                      <Dropdown.Item eventKey="Share as a post" className="text-light">Share as a post</Dropdown.Item>
                      <Dropdown.Item eventKey="Share in a message" className="text-light">Share in a message</Dropdown.Item>
                      <Dropdown.Item eventKey="More options" className="text-light">More options</Dropdown.Item>
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
            </CardFooter>
          </Card>
        ))}
      </InfiniteScroll>
      {loadingPosts && renderLoadingIndicator()}
      {noMoreData && renderNoMoreDataMessage()}
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
    </>
  );
}
export default NewsPostData;
