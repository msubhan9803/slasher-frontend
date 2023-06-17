/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useState,
} from 'react';
import {
  useLocation,
  useNavigate, useParams, useSearchParams,
} from 'react-router-dom';
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
  CommentValue, ContentDescription, FeedComments, FriendRequestReaction, FriendType, Post, User,
} from '../../../types';
import { getLocalStorage, setLocalStorage } from '../../../utils/localstorage-utils';
import { decryptMessage } from '../../../utils/text-utils';
import { ContentPageWrapper } from '../../layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import { PopoverClickProps } from '../CustomPopover';
import ErrorMessageList from '../ErrorMessageList';
import ReportModal from '../ReportModal';
import EditPostModal from './EditPostModal';
import PostFeed from './PostFeed/PostFeed';
import { deletedPostsCache } from '../../../pageStateCache';
import useProgressButton from '../ProgressButton';
import { sleep } from '../../../utils/timer-utils';
import { isPostDetailsPage } from '../../../utils/url-utils';
import { friendship } from '../../../api/friends';
import FriendshipStatusModal from '../friendShipCheckModal';

const loginUserPopoverOptions = ['Edit', 'Delete'];
const otherUserPopoverOptions = ['Report', 'Block user'];
const postCreaterPopoverOptions = ['Delete', 'Report', 'Block user'];
const newsPostPopoverOptions = ['Report'];
const loginUserMoviePopoverOptions = ['Edit Review', 'Delete Review'];

interface Props {
  user?: User;
  postType?: string;
  // TODO: Fix type for postType like below and also fix related redundant
  //       expressions reported by typescript
  // postType?: '' | 'review' | 'news';
  showPubWiseAdAtPageBottom?: boolean;
}

function PostDetail({ user, postType, showPubWiseAdAtPageBottom }: Props) {
  const {
    postId, id, partnerId,
  } = useParams<string>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [commentErrorMessage, setCommentErrorMessage] = useState<string[]>([]);
  const [commentReplyErrorMessage, setCommentReplyErrorMessage] = useState<string[]>([]);
  const [postData, setPostData] = useState<Post[]>([]);
  const [deleteImageIds, setDeleteImageIds] = useState<any>([]);
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
  const [postImages, setPostImages] = useState<string[]>([]);
  const [commentImages, setCommentImages] = useState<string[]>([]);
  const [popoverClick, setPopoverClick] = useState<PopoverClickProps>();
  const queryCommentId = searchParams.get('commentId');
  const queryReplyId = searchParams.get('replyId');
  const [previousCommentsAvailable, setPreviousCommentsAvailable] = useState(false);
  const userData = useAppSelector((state: any) => state.user);
  const [updateState, setUpdateState] = useState(false);
  const [commentSent, setCommentSent] = useState<boolean>(false);
  const [selectedBlockedUserId, setSelectedBlockedUserId] = useState<string>('');
  const [friendStatus, setFriendStatus] = useState<FriendRequestReaction | null>(null);
  const [friendData, setFriendData] = useState<FriendType>(null);
  const [friendShipStatusModal, setFriendShipStatusModal] = useState<boolean>(false);
  const [postUserId, setPostUserId] = useState<string>('');

  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const location = useLocation();

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    setSelectedBlockedUserId(popoverClickProps.userId!);
    if (value === 'Edit Review') {
      navigate(`/app/movies/${id}/reviews`, { state: { movieId: popoverClickProps.id } });
    }
    if (value === 'Delete Review') {
      setDropDownValue('Delete');
    } else {
      setDropDownValue(value);
    }
    if (popoverClickProps.postImages) {
      setPostImages(popoverClickProps.postImages);
    }
    setShow(true);
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

  const checkFriendShipStatus = () => new Promise<void>((resolve, reject) => {
    if (postType === 'review' || userData.id === postData[0].userId) {
      resolve();
    } else {
      friendship(postData[0].userId!).then((res) => {
        if (res.data.reaction === FriendRequestReaction.Accepted) {
          resolve();
        } else {
          setPostUserId(postData[0].userId!);
          setFriendShipStatusModal(true);
          setFriendData(res.data);
          setFriendStatus(res.data.reaction);
        }
      }).catch(() => reject());
    }
  });

  useEffect(() => {
    if (requestAdditionalPosts && !loadingComments && (commentData.length || !queryCommentId)) {
      setLoadingComments(true);
      setNoMoreData(false);
      feedComments();
    }
  }, [requestAdditionalPosts, loadingComments, commentData, queryCommentId, feedComments]);

  const callLatestFeedComments = () => {
    getFeedComments(postId!).then((res) => {
      const updateComment = res.data;
      setCommentData(updateComment);
      setLoadingComments(false);
    });
  };

  const addUpdateComment = async (comment: CommentValue) => {
    setProgressButtonStatus('loading');
    setCommentSent(true);
    let commentValueData: any = {
      feedPostId: '',
      images: [],
      message: '',
      userId: { ...userData.user, _id: userData.user.id },
      replies: [],
      createdAt: new Date().toISOString(),
    };
    await checkFriendShipStatus().then(() => {
      if (comment?.commentId) {
        updateFeedComments(
          postId!,
          comment.commentMessage,
          comment?.commentId,
          comment?.images,
          comment?.deleteImage,
          comment?.descriptionArr,
        )
          .then(async (res) => {
            setProgressButtonStatus('success');
            await sleep(1000);
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
              userId: { ...userData.user, _id: userData.user.id },
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
            setCommentErrorMessage([]);
            setCommentSent(false);
            setIsEdit(false);
          })
          .catch((error) => {
            setProgressButtonStatus('failure');
            const msg = error.response.status === 0 && !error.response.data
              ? 'Combined size of files is too large.'
              : error.response.data.message;
            setCommentErrorMessage(msg);
            setCommentSent(false);
          });
      } else {
        addFeedComments(
          postId!,
          comment.commentMessage,
          comment.imageArr,
          comment.descriptionArr,
        )
          .then(async (res) => {
            setProgressButtonStatus('success');
            await sleep(1000);
            let newCommentArray: any = commentData;
            commentValueData = {
              _id: res.data._id,
              feedPostId: res.data.feedPostId,
              images: res.data.images,
              message: comment.commentMessage,
              userId: { ...userData.user, _id: userData.user.id },
              replies: [],
              likeCount: 0,
              createdAt: new Date().toISOString(),
            };
            newCommentArray = [commentValueData].concat(newCommentArray);
            setCommentData(newCommentArray);
            setPostData([{
              ...postData[0],
              commentCount: postData[0].commentCount + 1,
            }]);
            setUpdateState(true);
            setCommentSent(false);
            setCommentErrorMessage([]);
          })
          .catch((error) => {
            setProgressButtonStatus('failure');
            const msg = error.response.status === 0 && !error.response.data
              ? 'Combined size of files is too large.'
              : error.response.data.message;
            setCommentErrorMessage(msg);
            setCommentSent(false);
          });
      }
    }).catch(() => { });
  };

  const addUpdateReply = async (reply: any) => {
    setCommentSent(true);
    setProgressButtonStatus('loading');

    let replyValueData: any = {
      feedPostId: '',
      feedCommentId: '',
      images: [],
      message: '',
      userId: { ...userData.user, _id: userData.user.id },
      deleteImage: [],
      likeCount: 0,
      createdAt: new Date().toISOString(),
    };

    await checkFriendShipStatus().then(() => {
      if (reply.replyId) {
        updateFeedCommentReply(
          postId!,
          reply.replyMessage,
          reply.replyId,
          reply.images,
          reply.deleteImage,
          reply.descriptionArr,
        )
          .then(async (res) => {
            const updateReplyArray: any = commentData;
            setProgressButtonStatus('success');
            await sleep(1000);
            updateReplyArray.map((comment: any) => {
              const staticReplies = comment.replies;
              if (comment._id === res.data.feedCommentId) {
                const index = staticReplies.findIndex(
                  (replyId: any) => replyId._id === res.data._id,
                );
                replyValueData = {
                  ...staticReplies[index],
                  message: res.data.message,
                  userId: { ...userData.user, _id: userData.user.id },
                  images: res.data.images,
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
            setCommentReplyErrorMessage([]);
            setIsEdit(false);
            setCommentSent(false);
          }).catch((error) => {
            setProgressButtonStatus('failure');
            const msg = error.response.status === 0 && !error.response.data
              ? 'Combined size of files is too large.'
              : error.response.data.message;
            setCommentReplyErrorMessage(msg);
            setCommentSent(false);
          });
      } else {
        addFeedReplyComments(
          postId!,
          reply.replyMessage,
          reply?.imageArr,
          reply.commentId!,
          reply.descriptionArr,
        ).then(async (res) => {
          const newReplyArray: any = commentData;
          setProgressButtonStatus('success');
          await sleep(1000);
          replyValueData = {
            feedPostId: postId,
            feedCommentId: res.data.feedCommentId,
            images: res.data.images,
            message: reply.replyMessage,
            userId: { ...userData.user, _id: userData.user.id },
            createdAt: new Date().toISOString(),
            likeCount: 0,
            new: true,
          };
          newReplyArray.map((comment: any) => {
            const staticReplies = comment.replies;
            const index = staticReplies.findIndex((obj: any) => obj._id === reply.commentReplyID);
            if (comment._id === reply.commentId) {
              staticReplies.splice(index + 1, 0, { ...replyValueData, _id: res.data._id });
            }
            return null;
          });
          setCommentData(newReplyArray);
          setUpdateState(true);
          setCommentReplyErrorMessage([]);
          setCommentSent(false);
          setCommentID('');
        }).catch((error) => {
          setProgressButtonStatus('failure');
          const msg = error.response.status === 0 && !error.response.data
            ? 'Combined size of files is too large.'
            : error.response.data.message;
          setCommentReplyErrorMessage(msg);
          setCommentSent(false);
        });
      }
    }).catch(() => { });
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
        } else if (postType === 'review') {
          if (queryCommentId && queryReplyId) {
            navigate(`/app/movies/${res.data.movieId._id}/reviews/${postId}?commentId=${queryCommentId}&replyId=${queryReplyId}`);
          } else if (queryCommentId) {
            navigate(`/app/movies/${res.data.movieId._id}/reviews/${postId}?commentId=${queryCommentId}`);
          } else {
            navigate(`/app/movies/${res.data.movieId._id}/reviews/${postId}`);
          }
        } else if (!isPostDetailsPage(location.pathname)) {
          // Only navigate to post-details page if necessary (fix bug of forward-browser history
          // lost when we click on user-profile link followed by click browser-back arrow)
          navigate(`/${res.data.userId.userName}/posts/${feedPostId}`);
        }
        let post: any = {};
        if (postType === 'news') {
          // RSS feed post
          post = {
            _id: res.data._id,
            id: res.data._id,
            postDate: res.data.createdAt,
            rssFeedTitle: res.data.rssFeedId.title,
            title: res.data.rssfeedProviderId?.title,
            message: res.data.rssFeedId.content,
            images: res.data.images,
            rssFeedProviderLogo: res.data.rssfeedProviderId?.logo,
            commentCount: res.data.commentCount,
            likeCount: res.data.likeCount,
            sharedList: res.data.sharedList,
            likeIcon: res.data.likedByUser,
            likedByUser: res.data.likedByUser,
            rssfeedProviderId: res.data.rssfeedProviderId?._id,
          };
        } else if (postType === 'review') {
          post = {
            _id: res.data._id,
            id: res.data._id,
            postDate: res.data.createdAt,
            message: res.data.message,
            images: res.data.images,
            userName: res.data.userId.userName,
            profileImage: res.data.userId.profilePic,
            userId: res.data.userId._id,
            likeIcon: res.data.likedByUser,
            likedByUser: res.data.likedByUser,
            likeCount: res.data.likeCount,
            commentCount: res.data.commentCount,
            rating: res.data?.reviewData?.rating || 0,
            goreFactor: res.data?.reviewData?.goreFactorRating || 0,
            worthWatching: res.data?.reviewData?.worthWatching || 0,
            contentHeading: res?.data?.title,
            spoilers: res.data.spoilers,
            movieId: res.data.movieId._id,
          };
        } else {
          // Regular post
          post = {
            ...res.data,
            _id: res.data._id,
            id: res.data._id,
            postDate: res.data.createdAt,
            message: decryptMessage(res.data.message),
            userName: res.data.userId.userName,
            profileImage: res.data.userId.profilePic,
            userId: res.data.userId._id,
            likeIcon: res.data.likedByUser,
            likedByUser: res.data.likedByUser,
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
  }, [navigate, partnerId, postId, postType, queryCommentId, queryReplyId,
    location.pathname]);

  useEffect(() => {
    if (postId) {
      getFeedPostDetail(postId);
    }
  }, [postId, getFeedPostDetail]);

  const onUpdatePost = (
    message: string,
    images: string[],
    imageDelete: string[] | undefined,
    descriptionArray?: ContentDescription[],
  ) => {
    if (postId) {
      updateFeedPost(
        postId,
        message,
        images,
        imageDelete,
        null,
        descriptionArray,
      ).then(async () => {
        setProgressButtonStatus('success');
        await sleep(1000);
        setShow(false);
        getFeedPostDetail(postId);
      }).catch((error) => {
        setProgressButtonStatus('failure');
        const msg = error.response.status === 0 && !error.response.data
          ? 'Combined size of files is too large.'
          : error.response.data.message;
        setErrorMessage(msg);
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
          deletedPostsCache.add(postId);
          navigate(-1); // act as if browser back icon is pressed
        })
        /* eslint-disable no-console */
        .catch((error) => console.error(error));
    }
  };

  const onPostLikeClick = async (feedPostId: string) => {
    const checkLike = postData.some((post) => post.id === feedPostId
      && post.likedByUser);

    await checkFriendShipStatus().then(() => {
      if (checkLike) {
        unlikeFeedPost(feedPostId).then((res) => {
          if (res.status === 200) {
            const unLikePostData = postData.map(
              (unLikePost: any) => { // NewsPartnerPostProps || Post type check
                if (unLikePost._id === feedPostId) {
                  return {
                    ...unLikePost,
                    likeIcon: false,
                    likedByUser: false,
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
                  likedByUser: true,
                  likeCount: likePost.likeCount + 1,
                };
              }
              return likePost;
            });
            setPostData(likePostData);
          }
        });
      }
    }).catch(() => { });
  };

  const onCommentLike = async (feedCommentId: string) => {
    const checkCommentId = commentData.find((comment: any) => comment._id === feedCommentId);
    const checkReplyId = commentData.map(
      (comment: any) => comment.replies.find((reply: any) => reply._id === feedCommentId),
    ).filter(Boolean);

    await checkFriendShipStatus().then(() => {
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
    });
  };

  const onLikeClick = (feedId: string) => {
    if (feedId === postId) {
      onPostLikeClick(feedId);
    } else {
      onCommentLike(feedId);
    }
  };

  const handleSpoiler = (spoilerPostId: string) => {
    const spoilerIdList = getLocalStorage('spoilersIds');
    if (!spoilerIdList.includes(spoilerPostId)) {
      spoilerIdList.push(spoilerPostId);
      setLocalStorage('spoilersIds', JSON.stringify(spoilerIdList));
      getFeedPostDetail(postId!);
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
  }, [queryCommentId, getSingleComment]);

  const loadNewerComment = () => {
    feedComments(true);
  };

  const onBlockYesClick = () => {
    createBlockUser(popoverClick?.userId!)
      .then(() => {
        if (postType === 'news') {
          setShow(false);
        } else {
          setDropDownValue('BlockUserSuccess');
        }
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };

  const afterBlockUser = useCallback(() => {
    // Send user to last page if the current `post-details-page` belong to the blocked user
    if (postData && postData.length > 0
      && postData[0].userId === selectedBlockedUserId
      && (dropDownValue === 'BlockUserSuccess')) {
      navigate(-1); // act as if browser back icon is pressed
    }
  }, [dropDownValue, navigate, postData, selectedBlockedUserId]);

  const updateCommentDataAfterBlockUser = useCallback(() => {
    const filterUnblockUserComments = commentData.filter((comment) => {
      if (comment.userId._id === selectedBlockedUserId) {
        return false;
      }
      if (comment.replies) {
        comment.replies = comment.replies.filter(
          (reply) => reply.userId._id !== selectedBlockedUserId,
        );
      }
      return true;
    });

    setCommentData(filterUnblockUserComments);
    // Show report modal
    setShow(true);
  }, [commentData, selectedBlockedUserId]);

  useEffect(() => {
    if (dropDownValue === 'BlockUserSuccess') {
      const timer = setTimeout(updateCommentDataAfterBlockUser, 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [selectedBlockedUserId, dropDownValue, updateCommentDataAfterBlockUser]);

  return (
    <>
      {postType === 'news'
        ? (
          <ContentPageWrapper>
            <div>
              <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
              <PostFeed
                isSinglePost
                postFeedData={postData}
                popoverOptions={loginUserPopoverOptions}
                onPopoverClick={handlePopoverOption}
                otherUserPopoverOptions={otherUserPopoverOptions}
                postCreaterPopoverOptions={postCreaterPopoverOptions}
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
                newsPostPopoverOptions={postType === 'news' ? newsPostPopoverOptions : undefined}
                escapeHtml={postType === 'news' ? false : undefined}
                handleSearch={handleSearch}
                mentionList={mentionList}
                commentImages={commentImages}
                setCommentImages={setCommentImages}
                commentError={commentErrorMessage}
                commentReplyError={commentReplyErrorMessage}
                commentSent={commentSent}
                setCommentReplyErrorMessage={setCommentReplyErrorMessage}
                setCommentErrorMessage={setCommentErrorMessage}
                showPubWiseAdAtPageBottom={showPubWiseAdAtPageBottom}
                setSelectedBlockedUserId={setSelectedBlockedUserId}
                setDropDownValue={setDropDownValue}
                ProgressButton={ProgressButton}
              />
              {dropDownValue !== 'Edit'
                && (
                  <ReportModal
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
                    errorMessage={errorMessage}
                    setShow={setShow}
                    setPostContent={setPostContent}
                    postContent={postContent}
                    onUpdatePost={onUpdatePost}
                    postImages={postImages}
                    setPostImages={setPostImages}
                    ProgressButton={ProgressButton}
                  />
                )}

              {friendShipStatusModal && (
                <FriendshipStatusModal
                  friendShipStatusModal={friendShipStatusModal}
                  setFriendShipStatusModal={setFriendShipStatusModal}
                  friendStatus={friendStatus}
                  setFriendStatus={setFriendStatus}
                  setFriendData={setFriendData}
                  friendData={friendData}
                  userId={postUserId}
                />
              )}
            </div>
          </ContentPageWrapper>
        )
        : (
          <div>
            <PostFeed
              isSinglePost
              postFeedData={postData}
              popoverOptions={loginUserPopoverOptions}
              onPopoverClick={handlePopoverOption}
              otherUserPopoverOptions={otherUserPopoverOptions}
              postCreaterPopoverOptions={postCreaterPopoverOptions}
              loginUserMoviePopoverOptions={loginUserMoviePopoverOptions}
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
              newsPostPopoverOptions={postType === 'news' ? newsPostPopoverOptions : undefined}
              escapeHtml={postType === 'news' ? false : undefined}
              handleSearch={handleSearch}
              mentionList={mentionList}
              postType={postType}
              commentImages={commentImages}
              setCommentImages={setCommentImages}
              commentError={commentErrorMessage}
              commentReplyError={commentReplyErrorMessage}
              onSpoilerClick={handleSpoiler}
              commentSent={commentSent}
              setCommentReplyErrorMessage={setCommentReplyErrorMessage}
              setCommentErrorMessage={setCommentErrorMessage}
              setSelectedBlockedUserId={setSelectedBlockedUserId}
              setDropDownValue={setDropDownValue}
              ProgressButton={ProgressButton}

            />
            {dropDownValue !== 'Edit'
              && (
                <ReportModal
                  onConfirmClick={deletePostClick}
                  show={show}
                  setShow={setShow}
                  slectedDropdownValue={dropDownValue}
                  handleReport={reportPost}
                  onBlockYesClick={onBlockYesClick}
                  afterBlockUser={afterBlockUser}
                />
              )}
            {postType !== 'news' && dropDownValue === 'Edit'
              && (
                <EditPostModal
                  show={show}
                  errorMessage={errorMessage}
                  setShow={setShow}
                  setPostContent={setPostContent}
                  postContent={postContent}
                  onUpdatePost={onUpdatePost}
                  postImages={postImages}
                  setPostImages={setPostImages}
                  deleteImageIds={deleteImageIds}
                  setDeleteImageIds={setDeleteImageIds}
                  ProgressButton={ProgressButton}
                  editPost
                />
              )}

            {friendShipStatusModal && (
              <FriendshipStatusModal
                friendShipStatusModal={friendShipStatusModal}
                setFriendShipStatusModal={setFriendShipStatusModal}
                friendStatus={friendStatus}
                setFriendStatus={setFriendStatus}
                setFriendData={setFriendData}
                friendData={friendData}
                userId={postUserId}
              />
            )}
          </div>
        )}

      {postType === 'news'
        && (
          <RightSidebarWrapper>
            <RightSidebarSelf />
          </RightSidebarWrapper>
        )}
    </>
  );
}

PostDetail.defaultProps = {
  user: null,
  postType: '',
  showPubWiseAdAtPageBottom: false,
};

export default PostDetail;
