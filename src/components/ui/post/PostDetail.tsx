/* eslint-disable max-lines */
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react';
import {
  useLocation,
  useNavigate, useParams, useSearchParams,
} from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { createBlockUser } from '../../../api/blocks';
import {
  addFeedComments, addFeedReplyComments, getFeedComments,
  removeFeedCommentReply, removeFeedComments, singleComment,
  updateFeedCommentReply, updateFeedComments,
} from '../../../api/feed-comments';
import {
  likeFeedComment,
  likeFeedPost,
  likeFeedReply,
  unlikeFeedComment, unlikeFeedPost, unlikeFeedReply,
} from '../../../api/feed-likes';
import { deleteFeedPost, feedPostDetail, updateFeedPost } from '../../../api/feed-posts';
import { reportData } from '../../../api/report';
import { getSuggestUserName } from '../../../api/users';
import { useAppSelector } from '../../../redux/hooks';
import { MentionProps } from '../../../routes/posts/create-post/CreatePost';
import {
  CommentValue, CommentsOrder, ContentDescription, FeedComments,
  FriendRequestReaction, FriendType, Post, User,
} from '../../../types';
import { getLocalStorage, setLocalStorage } from '../../../utils/localstorage-utils';
import { ContentPageWrapper } from '../../layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import { PopoverClickProps } from '../CustomPopover';
import ErrorMessageList from '../ErrorMessageList';
import ReportModal from '../ReportModal';
import EditPostModal from './EditPostModal';
import PostFeed from './PostFeed/PostFeed';
import { getSuggestHashtag } from '../../../api/searchHashtag';
import { deletedPostsCache } from '../../../pageStateCache';
import useProgressButton from '../ProgressButton';
import { sleep } from '../../../utils/timer-utils';
import { isPostDetailsPage } from '../../../utils/url-utils';
// import { friendship } from '../../../api/friends';
import FriendshipStatusModal from '../friendShipCheckModal';
import ContentNotAvailable from '../../ContentNotAvailable';
import CheckCommentModal from '../checkCommentModal';

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
  showAdAtPageBottom?: boolean;
  reviewDetail?: string;
}

const DEFAULT_COMMENTS_SORYBY_OLDEST_FIRST = true;

function PostDetail({
  user, postType, showAdAtPageBottom, reviewDetail,
}: Props) {
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
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [postUserId, setPostUserId] = useState<string>('');
  const [notFound, setNotFound] = useState<boolean>(false);
  const [commentNotFound, setCommentNotFound] = useState<boolean>(false);
  const [pastPostId, setPastPostId] = useState<any>('');

  const [commentOrReplySuccessAlertMessage, setCommentOrReplySuccessAlertMessage] = useState('');
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const location = useLocation();
  const [isCommentsOldestFirst, setIsCommentsByOldestFirst] = useState<boolean>(
    DEFAULT_COMMENTS_SORYBY_OLDEST_FIRST,
  );
  const abortControllerRef = useRef<AbortController | null>();

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    setSelectedBlockedUserId(popoverClickProps.userId!);
    if (value === 'Edit Review' && reviewDetail === 'movie-review') {
      navigate(`/app/movies/${id}/reviews`, { state: { movieId: popoverClickProps.id } });
    }
    if (value === 'Edit Review' && reviewDetail === 'book-review') {
      navigate(`/app/books/${id}/reviews`, { state: { bookId: popoverClickProps.id } });
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

  type FeedCommentsOptions = { isOldestFirst: boolean, isLoadNewerCommentsClick: boolean };

  const feedComments = useCallback((options: FeedCommentsOptions) => {
    const { isOldestFirst, isLoadNewerCommentsClick } = options;
    let data;
    const isAddingBelowCurrentComments = !isLoadNewerCommentsClick;
    if (isAddingBelowCurrentComments) {
      data = commentData.length > 0 ? commentData[commentData.length - 1]._id : undefined;
    } else {
      data = commentData.length > 0 ? commentData[0]._id : undefined;
    }
    // Note: Using === below provides a concise expression of
    // this = `isOldestFirst ? isAddingBelowCurrentComments : !isAddingBelowCurrentComments`
    const isOldestFirstFromApi = isOldestFirst === isAddingBelowCurrentComments;
    getFeedComments(
      postId!,
      data,
      isOldestFirstFromApi,
    ).then((res: AxiosResponse<FeedComments[]>) => {
      const comments = isAddingBelowCurrentComments
        ? res.data
        : res.data.reverse();
      // eslint-disable-next-line max-len
      setCommentData((prev: any) => (isAddingBelowCurrentComments ? [...prev, ...comments] : [...comments, ...prev]));
      if (res.data.length === 0) { setNoMoreData(true); }
      if (res.data.length < 20 && !isAddingBelowCurrentComments) {
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
  // eslint-disable-next-line max-len
  // const checkFriendShipStatus = useCallback((feedPostUserId: any) => new Promise<void>((resolve, reject) => {
  //   if (postType === 'news' || reviewDetail === 'book-review'
  // || reviewDetail === 'movie-review' || userData.user.id === feedPostUserId) {
  //     resolve();
  //   } else {
  //     friendship(feedPostUserId).then((res) => {
  //       if (res.data.reaction === FriendRequestReaction.Accepted) {
  //         resolve();
  //       } else {
  //         setPostUserId(feedPostUserId);
  //         setFriendShipStatusModal(true);
  //         setFriendData(res.data);
  //         setFriendStatus(res.data.reaction);
  //         reject();
  //       }
  //     }).catch(() => reject());
  //   }
  // }), [postType, userData?.user?.id, reviewDetail]);

  useEffect(() => {
    if (requestAdditionalPosts && !loadingComments && (commentData.length || !queryCommentId)) {
      setLoadingComments(true);
      setNoMoreData(false);
      feedComments({ isOldestFirst: isCommentsOldestFirst, isLoadNewerCommentsClick: false });
    }
  }, [requestAdditionalPosts, loadingComments, commentData, queryCommentId, feedComments,
    isCommentsOldestFirst]);

  const callLatestFeedComments = () => {
    getFeedComments(postId!, undefined, isCommentsOldestFirst).then((res) => {
      const updateComment = res.data;
      setCommentData(updateComment);
      setLoadingComments(false);
    });
  };

  const addUpdateComment = async (comment: CommentValue) => {
    if (abortControllerRef.current) {
      return;
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setCommentSent(true);
    let commentValueData: any = {
      feedPostId: '',
      images: [],
      message: '',
      userId: { ...userData.user, _id: userData.user.id },
      replies: [],
      createdAt: new Date().toISOString(),
    };
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
          const msg = error.response.status === 0 && !error.response.data
            ? 'Combined size of files is too large.'
            : error.response.data.message;
          setCommentErrorMessage(msg);
          setCommentSent(false);
        })
        .finally(() => {
          abortControllerRef.current = null;
        });
    } else {
      addFeedComments(
        postId!,
        comment.commentMessage,
        comment.imageArr,
        comment.descriptionArr,
      )
        .then(async (res) => {
          // if (res.status === 201 && res.data.isFriend === false) {
          //   checkFriendShipStatus(postData[0].userId);
          // }
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
          if (isCommentsOldestFirst) {
            newCommentArray = newCommentArray.concat(commentValueData);
          } else {
            newCommentArray = [commentValueData].concat(newCommentArray);
          }
          setCommentData(newCommentArray);
          setPostData([{
            ...postData[0],
            commentCount: postData[0].commentCount + 1,
          }]);
          setUpdateState(true);
          setCommentSent(false);
          setCommentErrorMessage([]);
          setCommentOrReplySuccessAlertMessage('Your comment has been added.');
        })
        .catch((error) => {
          if (error.response.status === 403) {
            // checkFriendShipStatus(postData[0].userId);
          } else {
            const msg = error.response.status === 0 && !error.response.data
              ? 'Combined size of files is too large.'
              : error.response.data.message;
            setCommentSent(false);
            setCommentErrorMessage(msg);
          }
        })
        .finally(() => {
          abortControllerRef.current = null;
        });
    }
  };
  const addUpdateReply = async (reply: any) => {
    if (abortControllerRef.current) {
      return;
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setCommentSent(true);
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
          const msg = error.response.status === 0 && !error.response.data
            ? 'Combined size of files is too large.'
            : error.response.data.message;
          setCommentReplyErrorMessage(msg);
          setCommentSent(false);
        })
        .finally(() => {
          abortControllerRef.current = null;
        });
    } else {
      addFeedReplyComments(
        postId!,
        reply.replyMessage,
        reply?.imageArr,
        reply.commentId!,
        reply.descriptionArr,
      ).then(async (res) => {
        // if (res.status === 201 && res.data.isFriend === false) {
        //   checkFriendShipStatus(postData[0].userId);
        // }
        const newReplyArray: any = commentData;
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
        // eslint-disable-next-line max-len
        // Fix showing of two success alert messages (i.e, inside two comment inputs for comment and reply-to-comment)
        setTimeout(() => {
          setCommentOrReplySuccessAlertMessage('Your reply has been added to the end of this comment thread.');
        }, 500);
      }).catch((error) => {
        if (error.response.status === 403) {
          // checkFriendShipStatus(postData[0].userId);
        } else {
          const msg = error.response.status === 0 && !error.response.data
            ? 'Combined size of files is too large.'
            : error.response.data.message;
          setCommentSent(false);
          setCommentErrorMessage(msg);
        }
      })
        .finally(() => {
          abortControllerRef.current = null;
        });
    }
  };

  const removeCommentAsync = async () => {
    setProgressButtonStatus('loading');
    if (commentID) {
      return removeFeedComments(commentID).then(async () => {
        setProgressButtonStatus('default');
        setCommentID('');
        callLatestFeedComments();
        setPostData([{
          ...postData[0],
          commentCount: postData[0].commentCount - 1,
        }]);
      });
    }

    if (commentReplyID) {
      return removeFeedCommentReply(commentReplyID).then(async () => {
        setProgressButtonStatus('default');
        setCommentReplyID('');
        callLatestFeedComments();
      });
    }
    return undefined;
  };
  const handleSearch = (text: string, prefix: string) => {
    setMentionList([]);
    if (text) {
      if (prefix === '@') {
        getSuggestUserName(text)
          .then((res) => setMentionList(res.data));
      } else if (prefix === '#') {
        getSuggestHashtag(text)
          .then((res) => setMentionList(res.data));
      }
    }
  };

  const getFeedPostDetail = useCallback((feedPostId: string) => {
    feedPostDetail(feedPostId)
      .then((res) => {
        console.log('📺 res: ', res);

        if (postType === 'news') {
          if (partnerId !== res.data.rssfeedProviderId?._id && !queryCommentId) {
            navigate(`/app/news/partner/${res.data.rssfeedProviderId?._id}/posts/${postId}`);
          }
        } else if (reviewDetail === 'movie-review') {
          if (queryCommentId && queryReplyId) {
            navigate(`/app/movies/${res.data.movieId._id}/reviews/${postId}?commentId=${queryCommentId}&replyId=${queryReplyId}`);
          } else if (queryCommentId) {
            navigate(`/app/movies/${res.data.movieId._id}/reviews/${postId}?commentId=${queryCommentId}`);
          } else if (!postId) {
            navigate(`/app/movies/${res.data.movieId._id}/reviews/${postId}`);
          }
        } else if (reviewDetail === 'book-review') {
          if (queryCommentId && queryReplyId) {
            navigate(`/app/books/${res.data.bookId._id}/reviews/${postId}?commentId=${queryCommentId}&replyId=${queryReplyId}`);
          } else if (queryCommentId) {
            navigate(`/app/books/${res.data.bookId._id}/reviews/${postId}?commentId=${queryCommentId}`);
          } else if (!postId) {
            navigate(`/app/books/${res.data.bookId._id}/reviews/${postId}`);
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
            businessListingRef: res.data.businessListingRef,
          };
        } else if (reviewDetail === 'movie-review') {
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
            hashtags: res.data?.hashtags,
            businessListingRef: res.data.businessListingRef,
          };
        } else if (reviewDetail === 'book-review') {
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
            likeCount: res.data.likeCount,
            commentCount: res.data.commentCount,
            rating: res.data?.reviewData?.rating || 0,
            goreFactor: res.data?.reviewData?.goreFactorRating || 0,
            worthReading: res.data?.reviewData?.worthReading || 0,
            contentHeading: res.data.title,
            bookId: res.data.bookId._id,
            spoilers: res.data.spoilers,
            hashtags: res.data.hashtags,
            businessListingRef: res.data.businessListingRef,
          };
        } else {
          // Regular post
          post = {
            ...res.data,
            _id: res.data._id,
            id: res.data._id,
            postDate: res.data.createdAt,
            message: res.data.message,
            userName: res.data.userId.userName,
            profileImage: res.data.userId.profilePic,
            userId: res.data.userId._id,
            likeIcon: res.data.likedByUser,
            likedByUser: res.data.likedByUser,
            likeCount: res.data.likeCount,
            commentCount: res.data.commentCount,
            businessListingRef: res.data.businessListingRef,
          };
        }
        setPostData([post]);
        setPostContent(res.data.message);
      })
      .catch((error) => {
        if (error.response.status === 404) { setNotFound(true); }
        setErrorMessage(error.response.data.message);
      });
  }, [navigate, partnerId, postId, postType, queryCommentId, queryReplyId,
    location.pathname, reviewDetail]);

  useEffect(() => {
    if (postId && pastPostId !== postId) {
      setCommentData([]);
      setRequestAdditionalPosts(true);
      setPastPostId(postId);
    }
  }, [pastPostId, postId]);

  useEffect(() => {
    if (postId) {
      getFeedPostDetail(postId);
      if (!pastPostId) {
        setPastPostId(postId);
      }
    }
  }, [postId, pastPostId, getFeedPostDetail]);

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
        setProgressButtonStatus('default');
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
  const deletePostClickAsync = async () => {
    if (postId) {
      setProgressButtonStatus('loading');
      return deleteFeedPost(postId)
        .then(async () => {
          setProgressButtonStatus('default');
          setShow(false);
          deletedPostsCache.add(postId);
          setTimeout(() => {
            if (reviewDetail === 'book-review') {
              navigate(`/app/books/${id}/reviews`);
            } else if (reviewDetail === 'movie-review') {
              navigate(`/app/movies/${id}/reviews`);
            } else {
              navigate(-1);
            }
          }, 0);
        })
        /* eslint-disable no-console */
        .catch(async (error) => {
          console.error(error);
          setProgressButtonStatus('failure');
          await sleep(500);
        });
    }
    return undefined;
  };
  const handlePostDislike = useCallback((feedPostId: string) => {
    setPostData((prevPosts) => prevPosts.map(
      (prevPost) => {
        if (prevPost._id === feedPostId) {
          return {
            ...prevPost,
            likeIcon: false,
            likedByUser: false,
            likeCount: prevPost.likeCount - 1,
          };
        }
        return prevPost;
      },
    ));
  }, []);

  const handlePostLike = useCallback((feedPostId: string) => {
    setPostData((prevPosts) => prevPosts.map((prevPost) => {
      if (prevPost._id === feedPostId) {
        return {
          ...prevPost,
          likeIcon: true,
          likedByUser: true,
          likeCount: prevPost.likeCount + 1,
        };
      }
      return prevPost;
    }));
  }, []);

  const onPostLikeClick = useCallback(async (feedPostId: string) => {
    const checkLike = postData.some((post) => post.id === feedPostId
      && post.likedByUser);

    // Dislike/Like optimistically
    if (checkLike) {
      handlePostDislike(feedPostId);
    } else {
      handlePostLike(feedPostId);
    }

    const revertOptimisticUpdate = () => {
      if (checkLike) {
        handlePostLike(feedPostId);
      } else {
        handlePostDislike(feedPostId);
      }
    };
    // const selectedFeedPostUserId = postData.find((post) => post.id === feedPostId)?.userId;

    const handleLikeAndUnlikeFeedPost = async () => {
      try {
        if (checkLike) {
          await unlikeFeedPost(feedPostId);
        } else {
          await likeFeedPost(feedPostId);
          // const res = await likeFeedPost(feedPostId);
          // if (!res.data.isFriend) {
          //   checkFriendShipStatus(selectedFeedPostUserId!);
          // }
        }
      } catch (error: any) {
        revertOptimisticUpdate();
        if (error.response.status === 403) {
          // checkFriendShipStatus(selectedFeedPostUserId!);
        }
      }
    };

    handleLikeAndUnlikeFeedPost();
  }, [handlePostDislike, handlePostLike, postData]);

  const handleLikeComment = (checkCommentId: FeedComments) => {
    setCommentData((prevCommentData) => prevCommentData.map(
      (prevComment) => (prevComment?._id === checkCommentId?._id
        ? { ...prevComment, likedByUser: true, likeCount: prevComment.likeCount + 1 }
        : prevComment),
    ));
    setUpdateState(true);
  };
  const handleUnLikeComment = (checkCommentId: FeedComments) => {
    setCommentData((prevCommentData) => prevCommentData.map(
      (prevComment) => (prevComment?._id === checkCommentId?._id
        ? { ...prevComment, likedByUser: false, likeCount: prevComment.likeCount - 1 }
        : prevComment),
    ));
    setUpdateState(true);
  };

  const handleLikeFeedReply = useCallback((checkReplyId: any) => {
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
  }, [commentData]);

  const handleUnLikeFeedReply = useCallback((checkReplyId: any) => {
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
  }, [commentData]);

  const onCommentLike = useCallback(async (feedCommentId: string) => {
    const checkCommentId = commentData.find((comment) => comment._id === feedCommentId);
    const checkReplyId: any = commentData.map(
      (comment) => comment.replies.find((reply) => reply._id === feedCommentId),
    ).filter(Boolean);

    const isComment = feedCommentId === checkCommentId?._id;
    const checkCommentLike = checkCommentId?.likedByUser;

    const isReply = feedCommentId === checkReplyId[0]?._id;
    const checkReplyLike = checkReplyId[0]?.likedByUser;

    // Dislike/Like comment/reply optimistically
    if (isComment) {
      if (checkCommentLike) {
        handleUnLikeComment(checkCommentId);
      } else {
        handleLikeComment(checkCommentId);
      }
    }
    if (isReply) {
      if (checkReplyLike) {
        handleUnLikeFeedReply(checkReplyId);
      } else {
        handleLikeFeedReply(checkReplyId);
      }
    }

    const revertOptimisticUpdate = () => {
      if (isComment) {
        if (checkCommentLike) {
          handleLikeComment(checkCommentId);
        } else {
          handleUnLikeComment(checkCommentId);
        }
      }
      if (isReply) {
        if (checkReplyLike) {
          handleLikeFeedReply(checkReplyId);
        } else {
          handleUnLikeFeedReply(checkReplyId);
        }
      }
    };
    const handleLikeAndUnlikeCommentReply = async () => {
      try {
        if (isComment) {
          if (checkCommentLike) {
            await unlikeFeedComment(feedCommentId);
          } else {
            await likeFeedComment(feedCommentId);

            // await likeFeedComment(feedCommentId).then((res) => {
            //   if (!res.data.isFriend) {
            //     checkFriendShipStatus(checkCommentId?.userId?._id!);
            //   }
            // });
          }
        }
        if (isReply) {
          if (checkReplyLike) {
            await unlikeFeedReply(feedCommentId);
          } else {
            await likeFeedReply(feedCommentId);
            // await likeFeedReply(feedCommentId).then((res) => {
            //   if (!res.data.isFriend) {
            //     checkFriendShipStatus(checkReplyId[0]?.userId?._id!);
            //   }
            // });
          }
        }
      } catch (error: any) {
        revertOptimisticUpdate();
      }
    };
    handleLikeAndUnlikeCommentReply();
  }, [commentData, handleLikeFeedReply, handleUnLikeFeedReply]);

  const onLikeClick = useCallback((feedId: string) => {
    if (feedId === postId) {
      onPostLikeClick(feedId);
    } else {
      onCommentLike(feedId);
    }
  }, [onCommentLike, onPostLikeClick, postId]);

  const handleSpoiler = (spoilerPostId: string) => {
    const spoilerIdList = getLocalStorage('spoilersIds');
    if (!spoilerIdList.includes(spoilerPostId)) {
      spoilerIdList.push(spoilerPostId);
      setLocalStorage('spoilersIds', JSON.stringify(spoilerIdList));
      getFeedPostDetail(postId!);
    }
  };

  const reportPost = (reason: string) => {
    setProgressButtonStatus('loading');
    const reportPayload = {
      targetId: popoverClick?.id,
      reason,
      reportType: 'post',
    };
    reportData(reportPayload).then((res) => {
      if (res) { getFeedPostDetail(postId!); setProgressButtonStatus('default'); }
    })
      /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
    setDropDownValue('PostReportSuccessDialog');
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

      if (queryReplyId && res.data.replies.length
        && !res.data.replies.some((reply: any) => reply._id === queryReplyId)) {
        setCommentNotFound(true);
      }
      setCommentData([res.data]);
    }).catch((err) => {
      if (err.response.status === 404) {
        setCommentNotFound(true);
      }
    });
  }, [navigate, partnerId, postId, queryCommentId, queryReplyId, user?.userName, postType]);
  useEffect(() => {
    if (queryCommentId) {
      getSingleComment();
    }
  }, [queryCommentId, getSingleComment]);

  const loadNewerComment = () => {
    feedComments({ isOldestFirst: isCommentsOldestFirst, isLoadNewerCommentsClick: true });
  };

  const onBlockYesClick = () => {
    setProgressButtonStatus('loading');
    createBlockUser(popoverClick?.userId!)
      .then(() => {
        if (postType === 'news') {
          setProgressButtonStatus('default');
          setShow(false);
        } else {
          setProgressButtonStatus('default');
          setDropDownValue('BlockUserSuccess');
        }
      })
      /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
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
    if (dropDownValue !== '') {
      setShow(true);
    }
  }, [commentData, selectedBlockedUserId, dropDownValue]);

  useEffect(() => {
    if (dropDownValue === 'BlockUserSuccess') {
      const timer = setTimeout(updateCommentDataAfterBlockUser, 200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [selectedBlockedUserId, dropDownValue, updateCommentDataAfterBlockUser]);

  const handleCommentsOrder = (value: CommentsOrder) => {
    if (!Object.values(CommentsOrder).includes(value)) { console.error('Please use one of following values:', Object.values(CommentsOrder)); }

    setCommentData([]);
    setIsCommentsByOldestFirst(value === CommentsOrder.oldestFirst);
    if (!queryCommentId) {
      setRequestAdditionalPosts(true);
    } else {
      getSingleComment();
      setRequestAdditionalPosts(true);
    }
  };
  const commentsOrder: CommentsOrder = isCommentsOldestFirst
    ? CommentsOrder.oldestFirst
    : CommentsOrder.newestFirst;
  if (notFound) { return (<ContentNotAvailable />); }

  const onCommentNotFoundClose = () => {
    if (!queryReplyId) {
      callLatestFeedComments();
    }
    setCommentNotFound(false);
  };
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
                removeCommentAsync={removeCommentAsync}
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
                showAdAtPageBottom={showAdAtPageBottom}
                setSelectedBlockedUserId={setSelectedBlockedUserId}
                setDropDownValue={setDropDownValue}
                ProgressButton={ProgressButton}
                setProgressButtonStatus={setProgressButtonStatus}
                commentOrReplySuccessAlertMessage={commentOrReplySuccessAlertMessage}
                setCommentOrReplySuccessAlertMessage={setCommentOrReplySuccessAlertMessage}
                commentsOrder={commentsOrder}
                handleCommentsOrder={handleCommentsOrder}
              />
              {dropDownValue !== 'Edit'
                && (
                  <ReportModal
                    onConfirmClickAsync={deletePostClickAsync}
                    show={show}
                    setShow={setShow}
                    slectedDropdownValue={dropDownValue}
                    handleReport={reportPost}
                    onBlockYesClick={onBlockYesClick}
                    rssfeedProviderId={postData[0]?.rssfeedProviderId}
                    afterBlockUser={afterBlockUser}
                    setDropDownValue={setDropDownValue}
                    ProgressButton={ProgressButton}
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

              {friendShipStatusModal && !userData.ignoreFriendSuggestionDialog && (
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
              removeCommentAsync={removeCommentAsync}
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
              setProgressButtonStatus={setProgressButtonStatus}
              commentOrReplySuccessAlertMessage={commentOrReplySuccessAlertMessage}
              setCommentOrReplySuccessAlertMessage={setCommentOrReplySuccessAlertMessage}
              commentsOrder={commentsOrder}
              handleCommentsOrder={handleCommentsOrder}
            />
            {dropDownValue !== 'Edit'
              && (
                <ReportModal
                  onConfirmClickAsync={deletePostClickAsync}
                  show={show}
                  setShow={setShow}
                  slectedDropdownValue={dropDownValue}
                  handleReport={reportPost}
                  onBlockYesClick={onBlockYesClick}
                  afterBlockUser={afterBlockUser}
                  setDropDownValue={setDropDownValue}
                  ProgressButton={ProgressButton}
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

            {friendShipStatusModal && !userData.user.ignoreFriendSuggestionDialog && (
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

            {commentNotFound && (
              <CheckCommentModal
                commentNotFound={commentNotFound}
                setCommentNotFound={setCommentNotFound}
                onCommentNotFoundClose={onCommentNotFoundClose}
                content={queryReplyId ? 'Reply no longer exists' : 'Comment no longer exists'}
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
  showAdAtPageBottom: false,
  reviewDetail: '',
};

export default PostDetail;
