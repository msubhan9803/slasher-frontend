/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ReportModal from '../../../components/ui/ReportModal';
import { feedPostDetail } from '../../../api/feed-posts';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import { CommentValue, NewsPartnerPostProps } from '../../../types';
import {
  likeFeedComment, likeFeedPost, likeFeedReply, unlikeFeedComment, unlikeFeedPost, unlikeFeedReply,
} from '../../../api/feed-likes';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import {
  addFeedComments, addFeedReplyComments, getFeedComments, removeFeedCommentReply,
  removeFeedComments, singleComment, updateFeedCommentReply, updateFeedComments,
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
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [commentValue, setCommentValue] = useState<CommentValue>();
  const [commentID, setCommentID] = useState<string>('');
  const [commentReplyID, setCommentReplyID] = useState<string>('');
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [searchParams] = useSearchParams();
  const queryCommentId = searchParams.get('commentId');
  const queryReplyId = searchParams.get('replyId');
  const [previousCommentsAvailable, setPreviousCommentsAvailable] = useState(false);

  const getFeedPostDetail = (feedPostId: string) => {
    feedPostDetail(feedPostId).then((res) => {
      /* eslint no-underscore-dangle: 0 */
      if (newsPartnerId !== res.data.rssfeedProviderId?._id && !queryCommentId) {
        navigate(`/news/partner/${res.data.rssfeedProviderId?._id}/posts/${postId}`);
      }
      const newsPost: any = {
        /* eslint no-underscore-dangle: 0 */
        _id: res.data._id,
        id: res.data._id,
        postDate: res.data.createdAt,
        title: res.data.rssfeedProviderId?.title,
        content: res.data.rssFeedId ? res.data.rssFeedId.content : res.data.message,
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

  const callLatestFeedComments = () => {
    getFeedComments(postId!).then((res) => {
      const updateComment = res.data;
      setCommentData(updateComment);
      setLoadingComments(false);
    });
  };

  const feedComments = (sortBy?: boolean) => {
    let data;
    if (sortBy) {
      data = commentData.length > 0 ? commentData[0]._id : undefined;
    } else {
      data = commentData.length > 0 ? commentData[commentData.length - 1]._id : undefined;
    }
    getFeedComments(
      postId!,
      data,
      sortBy,
    ).then((res) => {
      const comments = sortBy ? res.data.reverse() : res.data;
      setCommentData((prev: any) => {
        if (sortBy) {
          return [
            ...comments,
            ...prev,
          ];
        }
        return [
          ...prev,
          ...comments,
        ];
      });
      if (res.data.length === 0) setNoMoreData(true);
      if (res.data.length < 20 && sortBy) {
        setPreviousCommentsAvailable(false);
      }
    }).catch(
      (error) => {
        setNoMoreData(true);
        setErrorMessage(error.response.data.message);
      },
    ).finally(
      () => { setRequestAdditionalPosts(false); setLoadingComments(false); },
    );
  };

  useEffect(() => {
    if (requestAdditionalPosts && !loadingComments) {
      setLoadingComments(true);
      setNoMoreData(false);
      feedComments();
    }
  }, [requestAdditionalPosts, loadingComments]);

  useEffect(() => {
    setNoMoreData(false);
    if (commentValue && (commentValue.commentMessage !== '' || commentValue.replyMessage !== '')) {
      setLoadingComments(true);
      if (!isEdit) {
        if (!commentID) {
          addFeedComments(postId!, commentValue.commentMessage, commentValue.imageArray)
            .then(() => {
              callLatestFeedComments();
              setErrorMessage([]);
              setCommentValue({
                commentMessage: '',
                replyMessage: '',
                imageArray: [],
              });
            })
            .catch((error) => {
              setErrorMessage(error.response.data.message);
            });
        } else {
          addFeedReplyComments(
            postId!,
            commentValue.replyMessage,
            commentValue.imageArray,
            commentID,
          ).then(() => {
            callLatestFeedComments();
            setErrorMessage([]);
            setCommentValue({
              commentMessage: '',
              replyMessage: '',
              imageArray: [],
            });
            setCommentID('');
          }).catch((error) => {
            setErrorMessage(error.response.data.message);
          });
        }
      } else {
        if (commentID) {
          updateFeedComments(postId!, commentValue.commentMessage, commentID)
            .then(() => {
              callLatestFeedComments();
              setErrorMessage([]);
              setCommentValue({
                commentMessage: '',
                replyMessage: '',
                imageArray: [],
              });
              setCommentID('');
              setIsEdit(false);
            })
            .catch((error) => {
              setErrorMessage(error.response.data.message);
            });
        }
        if (commentReplyID) {
          updateFeedCommentReply(postId!, commentValue.replyMessage, commentReplyID).then(() => {
            callLatestFeedComments();
            setErrorMessage([]);
            setCommentValue({
              commentMessage: '',
              replyMessage: '',
              imageArray: [],
            });
            setCommentReplyID('');
            setIsEdit(false);
          }).catch((error) => {
            setErrorMessage(error.response.data.message);
          });
        }
      }
    }
  }, [commentValue, postId, commentID, commentReplyID, isEdit]);

  const removeComment = () => {
    if (commentID) {
      removeFeedComments(commentID).then(() => {
        setCommentID('');
        callLatestFeedComments();
      });
    }
    if (commentReplyID) {
      removeFeedCommentReply(commentReplyID).then(() => {
        setCommentReplyID('');
        callLatestFeedComments();
      });
    }
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
          if (res.status === 200) callLatestFeedComments();
        });
      } else {
        likeFeedComment(feedCommentId).then((res) => {
          if (res.status === 201) callLatestFeedComments();
        });
      }
    }
    if (feedCommentId === checkReplyId[0]?._id) {
      const checkReplyLike = checkReplyId[0].likedByUser;
      if (checkReplyLike) {
        unlikeFeedReply(feedCommentId).then((res) => {
          if (res.status === 200) callLatestFeedComments();
        });
      } else {
        likeFeedReply(feedCommentId).then((res) => {
          if (res.status === 201) callLatestFeedComments();
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

  const getSingleComment = () => {
    singleComment(queryCommentId!).then((res) => {
      setPreviousCommentsAvailable(true);
      if (postId !== res.data.feedPostId) {
        if (queryReplyId) {
          if (queryCommentId !== res.data._id) {
            navigate(`/news/partner/${newsPartnerId}/posts/${res.data.feedPostId}?commentId=${queryCommentId}&replyId=${queryReplyId}`);
          }
        } else {
          navigate(`/news/partner/${newsPartnerId}/posts/${res.data.feedPostId}?commentId=${queryCommentId}`);
        }
      }
      setCommentData([res.data]);
    });
  };

  useEffect(() => {
    if (queryCommentId) {
      getSingleComment();
    }
  }, [queryCommentId, queryReplyId]);

  const loadNewerComment = () => {
    feedComments(true);
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
            removeComment={removeComment}
            setCommentID={setCommentID}
            setCommentReplyID={setCommentReplyID}
            commentID={commentID}
            commentReplyID={commentReplyID}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            setRequestAdditionalPosts={setRequestAdditionalPosts}
            noMoreData={noMoreData}
            loadingPosts={loadingComments}
            onLikeClick={onLikeClick}
            escapeHtml={false}
            loadNewerComment={loadNewerComment}
            previousCommentsAvailable={previousCommentsAvailable}
          />
        </Col>
      </Row>
      <ReportModal show={show} setShow={setShow} slectedDropdownValue={dropDownValue} />
    </AuthenticatedPageWrapper>
  );
}
export default NewsPartnerPost;
