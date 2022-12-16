/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  addFeedComments, addFeedReplyComments, getFeedComments, removeFeedCommentReply,
  removeFeedComments, updateFeedCommentReply, updateFeedComments,
} from '../../../api/feed-comments';
import {
  likeFeedComment, likeFeedPost, likeFeedReply, unlikeFeedComment, unlikeFeedPost, unlikeFeedReply,
} from '../../../api/feed-likes';
import { feedPostDetail, deleteFeedPost, updateFeedPost } from '../../../api/feed-posts';
import { getSuggestUserName } from '../../../api/users';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import EditPostModal from '../../../components/ui/EditPostModal';
import PostFeed from '../../../components/ui/PostFeed/PostFeed';
import ReportModal from '../../../components/ui/ReportModal';
import { Post, User } from '../../../types';
import { MentionProps } from '../../posts/create-post/CreatePost';

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user'];

interface Props {
  user: User
}

function ProfilePostDetail({ user }: Props) {
  const { userName } = useParams<string>();
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
  const [mentionList, setMentionList] = useState<MentionProps[]>([]);
  const [postContent, setPostContent] = useState<string>('');
  const loginUserId = Cookies.get('userId');

  const handlePopoverOption = (value: string) => {
    setShow(true);
    setDropDownValue(value);
  };

  const decryptMessage = (content: string) => {
    const found = content.replace(/##LINK_ID##[a-fA-F0-9]{24}|##LINK_END##/g, '');
    return found;
  };

  const indentifyYouTubeLinkAndKey = (content: string) => {
    const youtubeLinkRegex = /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w\\-]+\?v=|embed\/|v\/)?)([\w\\-]+)(\S+)?/;
    const foundYoutube = content.match(youtubeLinkRegex);
    return foundYoutube && foundYoutube.length >= 6 && foundYoutube[6] ? foundYoutube[6] : '';
  };

  const formatImageVideoList = (postImageList: any, postMessage: string) => {
    if (indentifyYouTubeLinkAndKey(postMessage)) {
      postImageList.splice(0, 0, {
        videoKey: indentifyYouTubeLinkAndKey(postMessage),
      });
    }
    return postImageList;
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
              postUrl: formatImageVideoList(res.data.images, res.data.message),
              userName: res.data.userId.userName,
              profileImage: res.data.userId.profilePic,
              userId: res.data.userId._id,
              likes: res.data.likes,
              likeIcon: res.data.likes.includes(loginUserId),
              likeCount: res.data.likeCount,
              commentCount: res.data.commentCount,
            },
          ]);
          setPostContent(decryptMessage(res.data.message));
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

  const handleSearch = (text: string) => {
    setMentionList([]);
    if (text) {
      getSuggestUserName(text)
        .then((res) => setMentionList(res.data));
    }
  };

  const getFeedPostDetail = (feedPostId: string) => {
    feedPostDetail(feedPostId)
      .then((res) => {
        if (res.data.userId.userName !== user.userName) {
          navigate(`/${res.data.userId.userName}/posts/${feedPostId}`);
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
            postUrl: formatImageVideoList(res.data.images, res.data.message),
            userName: res.data.userId.userName,
            profileImage: res.data.userId.profilePic,
            userId: res.data.userId._id,
            likes: res.data.likes,
            likeIcon: res.data.likes.includes(loginUserId),
            likeCount: res.data.likeCount,
            commentCount: res.data.commentCount,
          },
        ]);
        setPostContent(decryptMessage(res.data.message));
      })
      .catch((error) => {
        setErrorMessage(error.response.data.message);
      });
  };
  const onUpdatePost = (message: string) => {
    if (postId) {
      updateFeedPost(postId, message).then(() => {
        setShow(false);
        getFeedPostDetail(postId);
      });
    } else {
      setShow(false);
    }
  };
  const deletePostClick = () => {
    if (postId) {
      deleteFeedPost(postId)
        .then(() => {
          setShow(false);
          navigate(`/${userName}/posts`);
        })
        /* eslint-disable no-console */
        .catch((error) => console.error(error));
    }
  };

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
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      {errorMessage && errorMessage.length > 0 && (
        <div className="mt-3 text-start">
          {errorMessage}
        </div>
      )}
      <PostFeed
        detailPage
        postFeedData={postData}
        popoverOptions={loginUserPopoverOptions}
        onPopoverClick={handlePopoverOption}
        otherUserPopoverOptions={otherUserPopoverOptions}
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
      {dropDownValue !== 'Edit'
        && (
          <ReportModal
            deleteText="Are you sure you want to delete this post?"
            onConfirmClick={deletePostClick}
            show={show}
            setShow={setShow}
            slectedDropdownValue={dropDownValue}
          />
        )}
      {dropDownValue === 'Edit'
        && (
          <EditPostModal
            show={show}
            setShow={setShow}
            handleSearch={handleSearch}
            mentionList={mentionList}
            setPostContent={setPostContent}
            postContent={postContent}
            onUpdatePost={onUpdatePost}
          />
        )}
    </AuthenticatedPageWrapper>
  );
}

export default ProfilePostDetail;
