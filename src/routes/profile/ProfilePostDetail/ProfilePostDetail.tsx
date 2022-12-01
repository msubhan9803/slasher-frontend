/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  addFeedComments, addFeedReplyComments, getFeedComments, removeFeedCommentReply,
  removeFeedComments, updateFeedCommentReply, updateFeedComments,
} from '../../../api/feed-comments';
import { feedPostDetail } from '../../../api/feedpost';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
import { Post, User } from '../../../types';

interface Props {
  user: User
}

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user'];

function ProfilePostDetail({ user }: Props) {
  const [searchParams] = useSearchParams();
  const { postId } = useParams<string>();
  const navigate = useNavigate();
  const queryParam = searchParams.get('view');
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [postData, setPostData] = useState<Post[]>([]);
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [commentValue, setCommentValue] = useState('');
  const [feedImageArray, setfeedImageArray] = useState<any>([]);
  const [commentData, setCommentData] = useState<any>([]);
  const [deleteComment, setDeleteComment] = useState<boolean>(false);
  const [commentID, setCommentID] = useState<string>('');
  const [commentReplyID, setCommentReplyID] = useState<string>('');
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<boolean>(false);

  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };

  const decryptMessage = (content: string) => {
    const found = content.replace(/##LINK_ID##[a-fA-F0-9]{24}|##LINK_END##/g, '');
    return found;
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
    if (postId) {
      feedPostDetail(postId)
        .then((res) => {
          if (res.data.userId.userName !== user.userName) {
            navigate(`/${res.data.userId.userName}/posts/${postId}`);
            return;
          }
          setPostData([
            {
              ...res.data,
              /* eslint no-underscore-dangle: 0 */
              _id: res.data._id,
              id: res.data._id,
              postDate: res.data.createdAt,
              content: decryptMessage(res.data.message),
              postUrl: res.data.images,
              userName: res.data.userId.userName,
              profileImage: res.data.userId.profilePic,
            },
          ]);
        })
        .catch((error) => {
          setErrorMessage(error.response.data.message);
        });
    }
  }, [postId, user]);

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

  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      {errorMessage && errorMessage.length > 0 && (
        <div className="mt-3 text-start">
          <ErrorMessageList errorMessages={errorMessage} className="m-0" />
        </div>
      )}
      <PostFeed
        postFeedData={postData}
        popoverOptions={loginUserPopoverOptions}
        onPopoverClick={handlePopoverOption}
        otherUserPopoverOptions={otherUserPopoverOptions}
        isCommentSection
        detailPage
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
      />
      <ReportModal
        show={show}
        setShow={setShow}
        slectedDropdownValue={dropDownValue}
      />
    </AuthenticatedPageWrapper>
  );
}

export default ProfilePostDetail;
