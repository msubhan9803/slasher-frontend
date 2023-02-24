/* eslint-disable max-lines */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createBlockUser } from '../../../api/blocks';
import {
  addFeedComments, addFeedReplyComments, getFeedComments,
  removeFeedCommentReply, removeFeedComments, singleComment,
  updateFeedCommentReply, updateFeedComments,
} from '../../../api/feed-comments';
import {
  likeFeedComment, likeFeedPost, likeFeedReply, unlikeFeedComment, unlikeFeedPost, unlikeFeedReply,
} from '../../../api/feed-likes';
import { deleteFeedPost, feedPostDetail, updateFeedPost } from '../../../api/feed-posts';
import { reportData } from '../../../api/report';
import { getSuggestUserName } from '../../../api/users';
import { useAppSelector } from '../../../redux/hooks';
import { MentionProps } from '../../../routes/posts/create-post/CreatePost';
import {
  CommentValue, FeedComments, Post, User,
} from '../../../types';
import { decryptMessage } from '../../../utils/text-utils';
import FormatImageVideoList from '../../../utils/vido-utils';
import { PopoverClickProps } from '../CustomPopover';
import ErrorMessageList from '../ErrorMessageList';
import ReportModal from '../ReportModal';
import EditPostModal from './EditPostModal';
import PostFeed from './PostFeed/PostFeed';

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user'];
const newsPostPopoverOptions = ['Report'];

interface Props {
  user?: User;
  postType?: string;
}

function PostDetail({ user, postType }: Props) {
  const { userName, postId, partnerId } = useParams<string>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [postData, setPostData] = useState<Post[]>([]);
  const [show, setShow] = useState(false);
  const [dropDownValue, setDropDownValue] = useState('');
  const [commentData, setCommentData] = useState<FeedComments[]>([]);
  const [commentID, setCommentID] = useState<string>('');
  const [commentReplyID, setCommentReplyID] = useState<string>('');
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [requestAdditionalPosts, setRequestAdditionalPosts] = useState<boolean>(false);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [noMoreData, setNoMoreData] = useState<boolean>(false);
  const [mentionList, setMentionList] = useState<MentionProps[]>([]);
  const [postContent, setPostContent] = useState<string>('');
  const [popoverClick, setPopoverClick] = useState<PopoverClickProps>();
  const queryCommentId = searchParams.get('commentId');
  const queryReplyId = searchParams.get('replyId');
  const [previousCommentsAvailable, setPreviousCommentsAvailable] = useState(false);
  const loginUserId = useAppSelector((state) => state.user.user.id);
  const userData = useAppSelector((state) => state.user);
  const [updateState, setUpdateState] = useState(false);

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    setShow(true);
    setDropDownValue(value);
    setPopoverClick(popoverClickProps);
  };

  const feedComments = useCallback((sortBy?: boolean) => {
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
      if (res.data.length === 0) { setNoMoreData(true); }
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
  }, [commentData, postId]);

  useEffect(() => {
    if (requestAdditionalPosts && !loadingComments) {
      setLoadingComments(true);
      setNoMoreData(false);
      feedComments();
    }
  }, [requestAdditionalPosts, loadingComments, feedComments]);

  const callLatestFeedComments = () => {
    getFeedComments(postId!).then((res) => {
      const updateComment = res.data;
      setCommentData(updateComment);
      setLoadingComments(false);
    });
  };

  const addUpdateComment = (comment: CommentValue) => {
    let commentValueData: any = {
      feedPostId: '',
      images: [],
      message: '',
      userId: userData.user,
      replies: [],
      createdAt: new Date().toISOString(),
    };
    if (comment?.commentId) {
      updateFeedComments(postId!, comment.commentMessage, comment?.commentId)
        .then((res) => {
          const updateCommentArray: any = commentData;
          const index = updateCommentArray.findIndex(
            (commentId: any) => commentId._id === res.data._id,
          );
          commentValueData = {
            ...updateCommentArray[index],
            _id: res.data._id,
            feedPostId: res.data.feedPostId,
            images: res.data.images,
            message: comment.commentMessage,
            userId: userData.user,
            replies: [],
            createdAt: new Date().toISOString(),
          };
          if (updateCommentArray[index]._id === res.data._id) {
            updateCommentArray[index] = {
              ...res.data,
              ...commentValueData,
              replies: updateCommentArray[index].replies,
            };
          }
          setCommentData(updateCommentArray);
          setUpdateState(true);
          setErrorMessage([]);
          setIsEdit(false);
        })
        .catch((error) => {
          setErrorMessage(error.response?.data.message);
        });
    } else if (comment.commentMessage || comment.imageArr?.length) {
      addFeedComments(
        postId!,
        comment.commentMessage,
        comment.imageArr,
      )
        .then((res) => {
          let newCommentArray: any = commentData;
          commentValueData = {
            _id: res.data._id,
            feedPostId: res.data.feedPostId,
            images: res.data.images,
            message: comment.commentMessage,
            userId: userData.user,
            replies: [],
            createdAt: new Date().toISOString(),
          };
          newCommentArray = [commentValueData].concat(newCommentArray);
          setCommentData(newCommentArray);
          setPostData([{
            ...postData[0],
            commentCount: postData[0].commentCount + 1,
          }]);
          setUpdateState(true);
          setErrorMessage([]);
        })
        .catch((error) => {
          setErrorMessage(error.response.data.message);
        });
    }
  };

  const addUpdateReply = (reply: any) => {
    let replyValueData: any = {
      feedPostId: '',
      feedCommentId: '',
      images: [],
      message: '',
      userId: userData.user,
      createdAt: new Date().toISOString(),
    };

    if (reply.replyId) {
      updateFeedCommentReply(postId!, reply.replyMessage, reply.replyId)
        .then((res) => {
          const updateReplyArray: any = commentData;
          updateReplyArray.map((comment: any) => {
            const staticReplies = comment.replies;
            if (comment._id === res.data.feedCommentId) {
              const index = staticReplies.findIndex(
                (replyId: any) => replyId._id === res.data._id,
              );
              replyValueData = {
                ...staticReplies[index],
                message: res.data.message,
                userId: userData.user,
              };
              if (staticReplies[index]._id === res.data._id) {
                staticReplies[index] = { ...res.data, ...replyValueData };
              }
              return null;
            }
            return null;
          });
          setCommentData(updateReplyArray);
          setUpdateState(true);
          setErrorMessage([]);
          setIsEdit(false);
        }).catch((error) => {
          setErrorMessage(error.response.data.message);
        });
    } else if (reply.replyMessage || reply?.imageArr?.length) {
      addFeedReplyComments(
        postId!,
        reply.replyMessage,
        reply?.imageArr,
        reply.commentId!,
      ).then((res) => {
        const newReplyArray: any = commentData;
        replyValueData = {
          feedPostId: postId,
          feedCommentId: res.data.feedCommentId,
          images: res.data.images,
          message: reply.replyMessage,
          userId: userData.user,
          createdAt: new Date().toISOString(),
          new: true,
        };
        newReplyArray.map((comment: any) => {
          const staticReplies = comment.replies;
          if (comment._id === reply.commentId) {
            staticReplies.push({ ...replyValueData, _id: res.data._id });
          }
          return null;
        });
        setCommentData(newReplyArray);
        setUpdateState(true);
        setErrorMessage([]);
        setCommentID('');
      }).catch((error) => {
        setErrorMessage(error.response.data.message);
      });
    }
  };

  const removeComment = () => {
    if (commentID) {
      removeFeedComments(commentID).then(() => {
        setCommentID('');
        callLatestFeedComments();
        setPostData([{
          ...postData[0],
          commentCount: postData[0].commentCount - 1,
        }]);
      });
    } else if (commentReplyID) {
      removeFeedCommentReply(commentReplyID).then(() => {
        setCommentReplyID('');
        callLatestFeedComments();
      });
    }
  };

  const handleSearch = (text: string) => {
    setMentionList([]);
    if (text) {
      getSuggestUserName(text)
        .then((res) => setMentionList(res.data));
    }
  };

  const getFeedPostDetail = useCallback((feedPostId: string) => {
    feedPostDetail(feedPostId)
      .then((res) => {
        if (postType === 'news') {
          if (partnerId !== res.data.rssfeedProviderId?._id && !queryCommentId) {
            navigate(`/app/news/partner/${res.data.rssfeedProviderId?._id}/posts/${postId}`);
          }
        } else if (res.data.userId.userName !== user?.userName) {
          navigate(`/${res.data.userId.userName}/posts/${feedPostId}`);
          return;
        }
        let post: any = {};
        if (postType === 'news') {
          // RSS feed post
          post = {
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
            rssfeedProviderId: res.data.rssfeedProviderId?._id,
          };
        } else {
          // Regular post
          post = {
            ...res.data,
            /* eslint no-underscore-dangle: 0 */
            _id: res.data._id,
            id: res.data._id,
            postDate: res.data.createdAt,
            content: decryptMessage(res.data.message),
            postUrl: FormatImageVideoList(res.data.images, res.data.message),
            userName: res.data.userId.userName,
            profileImage: res.data.userId.profilePic,
            userId: res.data.userId._id,
            likes: res.data.likes,
            likeIcon: res.data.likes.includes(loginUserId!),
            likeCount: res.data.likeCount,
            commentCount: res.data.commentCount,
          };
        }
        setPostData([post]);
        setPostContent(res.data.message);
      })
      .catch((error) => {
        setErrorMessage(error.response.data.message);
      });
  }, [loginUserId, navigate, partnerId, postId, postType, queryCommentId, user?.userName]);

  useEffect(() => {
    if (postId) {
      getFeedPostDetail(postId);
    }
  }, [postId, getFeedPostDetail]);

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

  const onPostLikeClick = (feedPostId: string) => {
    const checkLike = postData.some((post) => post.id === feedPostId
      && post.likes?.includes(loginUserId!));

    if (checkLike) {
      unlikeFeedPost(feedPostId).then((res) => {
        if (res.status === 200) {
          const unLikePostData = postData.map(
            (unLikePost: any) => { // NewsPartnerPostProps || Post type check
              if (unLikePost._id === feedPostId) {
                const removeUserLike = unLikePost.likes?.filter(
                  (removeId: string) => removeId !== loginUserId!,
                );
                return {
                  ...unLikePost,
                  likeIcon: false,
                  likes: removeUserLike,
                  likeCount: unLikePost.likeCount - 1,
                };
              }
              return unLikePost;
            },
          );
          setPostData(unLikePostData);
        }
      });
    } else {
      likeFeedPost(feedPostId).then((res) => {
        if (res.status === 201) {
          const likePostData = postData.map((likePost: Post) => {
            if (likePost._id === feedPostId) {
              return {
                ...likePost,
                likeIcon: true,
                likes: [...likePost.likes!, loginUserId!],
                likeCount: likePost.likeCount + 1,
              };
            }
            return likePost;
          });
          setPostData(likePostData);
        }
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
          if (res.status === 200) {
            const unLikeCommentData = commentData.map(
              (commentLike: any) => (commentLike === checkCommentId
                ? { ...commentLike, likedByUser: false, likeCount: commentLike.likeCount - 1 }
                : commentLike),
            );
            setCommentData(unLikeCommentData);
            setUpdateState(true);
          }
        });
      } else {
        likeFeedComment(feedCommentId).then((res) => {
          if (res.status === 201) {
            const likeCommentData = commentData.map(
              (commentLike: any) => (commentLike === checkCommentId
                ? { ...commentLike, likedByUser: true, likeCount: commentLike.likeCount + 1 }
                : commentLike),
            );
            setCommentData(likeCommentData);
            setUpdateState(true);
          }
        });
      }
    }
    if (feedCommentId === checkReplyId[0]?._id) {
      const checkReplyLike = checkReplyId[0].likedByUser;
      if (checkReplyLike) {
        unlikeFeedReply(feedCommentId).then((res) => {
          if (res.status === 200) {
            const updatedCommentData: any = [];
            commentData.map((commentLike: any) => {
              if (commentLike._id === checkReplyId[0].feedCommentId) {
                commentLike.replies.map((reply: any) => {
                  if (reply._id === checkReplyId[0]._id) {
                    /* eslint-disable no-param-reassign */
                    reply.likeCount -= 1;
                    reply.likedByUser = false;
                    return reply;
                  }
                  return reply;
                });
                updatedCommentData.push(commentLike);
              } else {
                updatedCommentData.push(commentLike);
              }
              return null;
            });
            setCommentData(updatedCommentData);
            setUpdateState(true);
          }
        });
      } else {
        likeFeedReply(feedCommentId).then((res) => {
          if (res.status === 201) {
            const updatedCommentData: any = [];
            commentData.map((commentLike: any) => {
              if (commentLike._id === checkReplyId[0].feedCommentId) {
                commentLike.replies.map((reply: any) => {
                  if (reply._id === checkReplyId[0]._id) {
                    /* eslint-disable no-param-reassign */
                    reply.likeCount += 1;
                    reply.likedByUser = true;
                    return reply;
                  }
                  return reply;
                });
                updatedCommentData.push(commentLike);
              } else {
                updatedCommentData.push(commentLike);
              }
              return null;
            });
            setCommentData(updatedCommentData);
            setUpdateState(true);
          }
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

  const reportPost = (reason: string) => {
    const reportPayload = {
      targetId: popoverClick?.id,
      reason,
      reportType: 'post',
    };
    reportData(reportPayload).then((res) => {
      if (res.status === 200) { getFeedPostDetail(postId!); }
      setShow(false);
    })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };
  const getSingleComment = useCallback(() => {
    singleComment(queryCommentId!).then((res) => {
      setPreviousCommentsAvailable(true);
      if (postId !== res.data.feedPostId) {
        if (queryReplyId) {
          if (queryCommentId !== res.data._id) {
            if (postType === 'news') {
              navigate(`/app/news/partner/${partnerId}/posts/${res.data.feedPostId}?commentId=${queryCommentId}&replyId=${queryReplyId}`);
            } else {
              navigate(`/${user?.userName}/posts/${res.data.feedPostId}?commentId=${res.data._id}&replyId=${queryReplyId}`);
            }
          }
        } else if (postType === 'news') {
          navigate(`/app/news/partner/${partnerId}/posts/${res.data.feedPostId}?commentId=${queryCommentId}`);
        } else {
          navigate(`/${user?.userName}/posts/${res.data.feedPostId}?commentId=${queryCommentId}`);
        }
      }
      setCommentData([res.data]);
    });
  }, [navigate, partnerId, postId, queryCommentId, queryReplyId, user?.userName, postType]);
  useEffect(() => {
    if (queryCommentId) {
      getSingleComment();
    }
  }, [queryCommentId, queryReplyId, getSingleComment]);

  const loadNewerComment = () => {
    feedComments(true);
  };

  const onBlockYesClick = () => {
    createBlockUser(popoverClick?.id!)
      .then(() => {
        setShow(false);
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };
  return (
    <div>
      <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
      <PostFeed
        detailPage
        postFeedData={postData}
        popoverOptions={loginUserPopoverOptions}
        onPopoverClick={handlePopoverOption}
        otherUserPopoverOptions={otherUserPopoverOptions}
        isCommentSection
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
        loadNewerComment={loadNewerComment}
        previousCommentsAvailable={previousCommentsAvailable}
        addUpdateReply={addUpdateReply}
        addUpdateComment={addUpdateComment}
        updateState={updateState}
        setUpdateState={setUpdateState}
        isSinglePagePost
        newsPostPopoverOptions={postType === 'news' ? newsPostPopoverOptions : undefined}
        escapeHtml={postType === 'news' ? false : undefined}
        handleSearch={handleSearch}
        mentionList={mentionList}
      />
      {dropDownValue !== 'Edit'
        && (
          <ReportModal
            deleteText="Are you sure you want to delete this post?"
            onConfirmClick={deletePostClick}
            show={show}
            setShow={setShow}
            slectedDropdownValue={dropDownValue}
            handleReport={reportPost}
            onBlockYesClick={onBlockYesClick}
          />
        )}
      {postType !== 'news' && dropDownValue === 'Edit'
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
    </div>
  );
}

PostDetail.defaultProps = {
  user: null,
  postType: '',
};

export default PostDetail;
