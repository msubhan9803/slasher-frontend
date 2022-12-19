/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ReportModal from '../../../components/ui/ReportModal';
import { feedPostDetail } from '../../../api/feed-posts';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import { NewsPartnerPostProps } from '../../../types';
import {
  likeFeedComment, likeFeedPost, likeFeedReply, unlikeFeedComment, unlikeFeedPost, unlikeFeedReply,
} from '../../../api/feed-likes';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import {
  addFeedComments, addFeedReplyComments, getFeedComments, removeFeedCommentReply,
  removeFeedComments, updateFeedCommentReply, updateFeedComments,
} from '../../../api/feed-comments';

function NewsPartnerPost() {
  const { newsPartnerId, postId } = useParams<string>();
  const [postData, setPostData] = useState<NewsPartnerPostProps[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const navigate = useNavigate();
  const popoverOption = ['Report'];
  const loginUserId = Cookies.get('userId');
  const [commentData, setCommentData] = useState<any>([]);
  const [noMoreData, setNoMoreData] = useState<boolean>(false);
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [commentValue, setCommentValue] = useState('');
  const [feedImageArray, setfeedImageArray] = useState<any>([]);
  const [deleteComment, setDeleteComment] = useState<boolean>(false);
  const [commentID, setCommentID] = useState<string>('');
  const [commentReplyID, setCommentReplyID] = useState<string>('');
  const [isEdit, setIsEdit] = useState<boolean>(false);

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
      setPostData([newsPost]);
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

  const feedComments = (feedPostId: string, comment: any) => {
    setNoMoreData(false);
    setCommentData(comment);
    const data = comment.length > 1 ? comment[comment.length - 1]._id : undefined;
    getFeedComments(
      feedPostId,
      data,
    ).then((res) => {
      const comments = res.data;
      setCommentData((prev: any) => [
        ...prev,
        ...comments,
      ]);
      if (res.data.length === 0) { setNoMoreData(true); }
    }).catch(
      (error) => {
        setNoMoreData(true);
        setErrorMessage(error.response.data.message);
      },
    ).finally(
      () => { setRequestAdditionalPosts(false); setLoadingPosts(false); },
    );
  };

  useEffect(() => {
    if (requestAdditionalPosts && !loadingPosts && postId) {
      setLoadingPosts(true);
      feedComments(postId, commentData);
    }
  }, [postId, requestAdditionalPosts, loadingPosts, commentData]);

  useEffect(() => {
    setNoMoreData(false);
    if (commentValue && postId) {
      setLoadingPosts(true);
      if (!isEdit) {
        if (!commentID) {
          addFeedComments(postId, commentValue, feedImageArray)
            .then(() => {
              feedComments(postId, []);
              setErrorMessage([]);
              setCommentValue('');
            })
            .catch((error) => {
              setErrorMessage(error.response.data.message);
            });
        } else {
          addFeedReplyComments(postId, commentValue, feedImageArray, commentID).then(() => {
            feedComments(postId, []);
            setErrorMessage([]);
            setCommentValue('');
            setCommentID('');
          }).catch((error) => {
            setErrorMessage(error.response.data.message);
          });
        }
      } else {
        if (commentID) {
          updateFeedComments(postId, commentValue, commentID)
            .then(() => {
              feedComments(postId, []);
              setErrorMessage([]);
              setCommentValue('');
              setCommentID('');
              setIsEdit(false);
            })
            .catch((error) => {
              setErrorMessage(error.response.data.message);
            });
        }
        if (commentReplyID) {
          updateFeedCommentReply(postId, commentValue, commentReplyID).then(() => {
            feedComments(postId, []);
            setErrorMessage([]);
            setCommentValue('');
            setCommentReplyID('');
            setIsEdit(false);
          }).catch((error) => {
            setErrorMessage(error.response.data.message);
          });
        }
      }
    }
  }, [commentValue, postId, feedImageArray, commentID, commentReplyID, isEdit]);

  const removeComment = () => {
    if (commentID) {
      removeFeedComments(commentID).then(() => {
        setCommentID('');
      });
    }
    if (commentReplyID) {
      removeFeedCommentReply(commentReplyID).then(() => {
        setCommentReplyID('');
      });
    }
    setDeleteComment(false);
    setDeleteComment(false);
    setfeedImageArray([]);
    if (postId) feedComments(postId, []);
  };

  useEffect(() => {
    if (deleteComment) {
      removeComment();
    }
  }, [deleteComment, commentID, commentReplyID]);

  const callLatestFeedComments = (feedPostId: string) => {
    getFeedComments(feedPostId).then((res) => {
      const comments = res.data;
      setCommentData(comments);
    });
  };
  const onPostLikeClick = (feedPostId: string) => {
    const checkLike = postData.some((post) => post.id === feedPostId
      && post.likes?.includes(loginUserId!));

    if (checkLike) {
      unlikeFeedPost(feedPostId).then((res) => {
        if (res.status === 200) getFeedPostDetail(postId!);
      });
    } else {
      likeFeedPost(feedPostId).then((res) => {
        if (res.status === 201) getFeedPostDetail(postId!);
      });
    }
  };

  const onCommentLike = (feedCommentId: string) => {
    const checkCommentId = commentData.find((comment: any) => comment._id === feedCommentId);
    const checkReplyId = commentData.map(
      (comment: any) => comment.replies.find((reply: any) => reply._id === feedCommentId),
    ).filter(Boolean);
    if (feedCommentId === checkCommentId?._id) {
      const checkCommentLike = checkCommentId?.likedByUser;
      if (checkCommentLike) {
        unlikeFeedComment(feedCommentId).then((res) => {
          if (res.status === 200) callLatestFeedComments(postId!);
        });
      } else {
        likeFeedComment(feedCommentId).then((res) => {
          if (res.status === 201) callLatestFeedComments(postId!);
        });
      }
    }
    if (feedCommentId === checkReplyId[0]?._id) {
      const checkReplyLike = checkReplyId[0].likedByUser;
      if (checkReplyLike) {
        unlikeFeedReply(feedCommentId).then((res) => {
          if (res.status === 200) callLatestFeedComments(postId!);
        });
      } else {
        likeFeedReply(feedCommentId).then((res) => {
          if (res.status === 201) callLatestFeedComments(postId!);
        });
      }
    }
  };

  const onLikeClick = (feedId: string) => {
    if (feedId === postId) {
      onPostLikeClick(feedId);
    } else {
      onCommentLike(feedId);
    }
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
          <PostFeed
            detailPage
            postFeedData={postData}
            popoverOptions={popoverOption}
            onPopoverClick={handlePopover}
            isCommentSection
            setCommentValue={setCommentValue}
            commentsData={commentData}
            setfeedImageArray={setfeedImageArray}
            setDeleteComment={setDeleteComment}
            setCommentID={setCommentID}
            setCommentReplyID={setCommentReplyID}
            commentID={commentID}
            commentReplyID={commentReplyID}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            setRequestAdditionalPosts={setRequestAdditionalPosts}
            noMoreData={noMoreData}
            loadingPosts={loadingPosts}
            onLikeClick={onLikeClick}
          />
        </Col>
      </Row>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}
export default NewsPartnerPost;
