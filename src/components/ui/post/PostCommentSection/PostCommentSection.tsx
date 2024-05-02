/* eslint-disable max-lines */
import React, {
  useEffect, useRef, useState, ChangeEvent, useCallback,
} from 'react';
import {
  Button,
} from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import CommentSection from './CommentSection';
import CommentInput from './CommentInput';
import { FeedComments } from '../../../../types';
import { PopoverClickProps } from '../../CustomPopover';
import { createBlockUser } from '../../../../api/blocks';
import { reportData } from '../../../../api/report';
import ReportModal from '../../ReportModal';
import EditCommentModal from '../../editCommentModal';
import ErrorMessageList from '../../ErrorMessageList';
import {
  CHOOSE_FILE_CAMERA_ICON, COMMENT_OR_REPLY_INPUT, COMMENT_SECTION_ID, SEND_BUTTON_COMMENT_OR_REPLY,
} from '../../../../constants';
import { onKeyboardClose, onKeyboardOpen } from '../../../../utils/styles-utils ';
import { decryptMessage, replyMentionFormat } from '../../../../utils/text-utils';

const LoadMoreCommentsWrapper = styled.div.attrs({ className: 'text-center' })`
  margin: -1rem 0 1rem;
`;

function PostCommentSection({
  postCreator,
  commentSectionData,
  popoverOption,
  removeCommentAsync,
  setCommentID,
  setCommentReplyID,
  commentID,
  commentReplyID,
  loginUserId,
  otherUserPopoverOptions,
  postCreaterPopoverOptions,
  isEdit,
  setIsEdit,
  onLikeClick,
  loadNewerComment,
  previousCommentsAvailable,
  addUpdateReply,
  addUpdateComment,
  updateState,
  setUpdateState,
  handleSearch,
  mentionList,
  commentImages,
  setCommentImages,
  commentError,
  commentReplyError,
  commentSent,
  setCommentReplyErrorMessage,
  setCommentErrorMessage,
  handleLikeModal,
  isMainPostCommentClick,
  setSelectedBlockedUserId,
  setCommentDropDownValue,
  ProgressButton,
  setProgressButtonStatus,
  commentOrReplySuccessAlertMessage,
  setCommentOrReplySuccessAlertMessage,
}: any) {
  const [commentData, setCommentData] = useState<FeedComments[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const inputFile = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<any>();
  const replyInputFile = useRef<HTMLInputElement>(null);
  const [uploadPost, setUploadPost] = useState<string[]>([]);
  const [imageArray, setImageArray] = useState<any>([]);
  const [replyImageArray, setReplyImageArray] = useState<any>([]);
  const [message, setMessage] = useState<string>('');
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [decReplyMessage, setDecReplyMessage] = useState<string>('');
  const [isReply, setIsReply] = useState<boolean>(false);
  const [selectedReplyCommentId, setSelectedReplyCommentId] = useState<string>('');
  const [replyUserName, setReplyUserName] = useState<string>('');
  const [selectedReplyUserID, setSelectedReplyUserID] = useState<string>('');
  const [editContent, setEditContent] = useState<any>('');
  const [deleteImageIds, setDeleteImageIds] = useState<any>([]);
  const [commentReplyUserId, setCommentReplyUserId] = useState<string>('');
  const [searchParams] = useSearchParams();
  const queryCommentId = searchParams.get('commentId');
  const queryReplyId = searchParams.get('replyId');
  const [checkLoadMoreId, setCheckLoadMoreId] = useState<any[]>([]);
  const [replyIndex, setReplyIndex] = useState<number>(2);
  const [scrollId, setScrollId] = useState<string>('');
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>('');
  const [updatedReply, setUpdatedReply] = useState<boolean>(false);
  const [descriptionArray, setDescriptionArray] = useState<string[]>([]);
  const [replyDescriptionArray, setReplyDescriptionArray] = useState<string[]>([]);
  const [hasReplyMessage, setHasReplyMessage] = useState<boolean>(false);

  const commentSectionRef = useRef<any>(null);
  useEffect(() => {
    if (queryReplyId && queryCommentId) {
      const showQueryIdReply = checkLoadMoreId.some((loadId) => loadId._id === queryCommentId);
      if (!showQueryIdReply && !checkLoadMoreId.includes(queryCommentId)) {
        setCheckLoadMoreId([...checkLoadMoreId, queryCommentId]);
      }
    }
  }, [queryCommentId, queryReplyId, checkLoadMoreId]);

  const clearErrorMessages = useCallback((e: MouseEvent) => {
    if (!e.target) { return; }
    const commentOrReplyTextInput = document.getElementById(COMMENT_OR_REPLY_INPUT);
    if (!commentOrReplyTextInput) { return; }

    const isClickedOnTextInput = e.y > commentOrReplyTextInput.offsetTop;
    if (isClickedOnTextInput) {
      onKeyboardOpen();
    } else {
      onKeyboardClose();
      // Disabled Temporarily by Damon request
      // setCommentOrReplySuccessAlertMessage('');

      // When we click in empty-area and it is not the `SEND_BUTTON_COMMENT_OR_REPLY` then hide
      // `Reply to comment` textInput and show default "Write a comment"
      const sendCommentOrReplyButtons = Array.from(document.querySelectorAll(`#${SEND_BUTTON_COMMENT_OR_REPLY}`));
      const uploadImageButtons = Array.from(document.querySelectorAll(`#${CHOOSE_FILE_CAMERA_ICON}`));
      const commentReplyInput = Array.from(document.querySelectorAll(`#${COMMENT_OR_REPLY_INPUT}`));
      const element = e.target as Element || null;
      const clickedElementIsNotSendButton = !sendCommentOrReplyButtons
        .some((el) => el.contains(element as any));
      const clickedElementIsNotFileIUploadButton = !uploadImageButtons
        .some((el) => el.contains(element as any));
      const clickedElementIsNotCommentReplyInput = !commentReplyInput
        .some((el) => el.contains(element as any));
      if (clickedElementIsNotSendButton && clickedElementIsNotFileIUploadButton
        && clickedElementIsNotCommentReplyInput
        && !replyImageArray.length && !hasReplyMessage) {
        setIsReply(false);
      }
    }
  }, [setIsReply, hasReplyMessage, replyImageArray]);

  useEffect(() => {
    window.addEventListener('click', clearErrorMessages, true);
    return () => window.removeEventListener('click', clearErrorMessages, true);
  }, [clearErrorMessages]);

  const checkPopover = (id: string) => {
    if (id === loginUserId) {
      return popoverOption;
    } if (postCreator === loginUserId) {
      return postCreaterPopoverOptions;
    }
    return otherUserPopoverOptions;
  };

  const handleSeeCompleteList = useCallback((
    commentReplyId: string,
    replyName: string,
    selectedReply?: string | null,
    scrollReplyId?: string,
    replyCommentIndex?: number,
    userId?: string,
  ) => {
    setScrollId(scrollReplyId!);
    if (replyCommentIndex! >= 0) {
      setSelectedReplyId(selectedReply || null);
      setSelectedReplyCommentId(commentReplyId);
      setReplyUserName(replyName);
      setSelectedReplyUserID(userId!);
      commentData.map((comment: any) => {
        /* eslint-disable no-param-reassign */
        if (comment.id === commentReplyId) {
          setReplyIndex(replyCommentIndex!);
        }
        return null;
      });
    }
  }, [commentData]);

  useEffect(() => {
    handleSeeCompleteList(selectedReplyCommentId, replyUserName, selectedReplyId, scrollId);
  }, [
    selectedReplyCommentId,
    replyUserName,
    scrollId,
    selectedReplyId,
    isReply,
    handleSeeCompleteList,
  ]);

  useEffect(() => {
    if (isReply) {
      commentData.map((comment: any) => {
        if (comment.id === selectedReplyCommentId) {
          const tabs = tabsRef.current;
          if (tabs
            && comment.commentReplySection.length - 1 === replyIndex
            && !scrollId.includes('comment')) {
            tabs.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              Inline: 'center',
            });
          }
        }
        return null;
      });
    }
  }, [isReply, commentData, tabsRef, replyIndex,
    selectedReplyCommentId, scrollId]);

  const generateReplyIndex = useCallback((comment: any) => {
    const updateComment = comment;
    let updateReplyIndex = 2;
    const newReplyData = updateComment.replies.filter((reply: any) => reply?.new === true);
    const loadedComment = checkLoadMoreId.includes(updateComment._id);

    if (loadedComment) {
      updateReplyIndex = updateComment.replies.length;
    } else if (newReplyData.length > 0 && !loadedComment) {
      updateReplyIndex = newReplyData.length + updateReplyIndex;
    }

    return updateReplyIndex;
  }, [checkLoadMoreId]);

  useEffect(() => {
    if (commentSectionData || updateState) {
      const feedCommentData = () => {
        const comments = commentSectionData.map((comment: FeedComments) => {
          const commentReplies = comment.replies.map((replies: any) => {
            const feeedCommentReplies: any = {
              id: replies._id,
              profilePic: replies.userId?.profilePic,
              name: replies.userId?.userName,
              time: replies.createdAt,
              commentMsg: replies.message,
              commentImg: replies.images,
              feedCommentId: replies.feedCommentId,
              userId: replies.userId,
              likeIcon: replies.likedByUser,
              likeCount: replies.likeCount,
              commentCount: replies.commentCount,
              newComment: replies?.new || (replies._id === commentReplyID),
            };
            return feeedCommentReplies;
          });
          const feedComment: any = {

            id: comment._id,
            profilePic: comment.userId?.profilePic,
            name: comment.userId?.userName,
            time: comment.createdAt,
            commentMsg: comment.message,
            commentImg: comment.images,
            commentReplySection: commentReplies,
            userId: comment.userId,
            likeIcon: comment.likedByUser,
            likeCount: comment.likeCount,
            commentCount: comment.commentCount,
            isReplyIndex:
              generateReplyIndex(comment),
          };
          return feedComment;
        });
        setCommentData(comments);
        setUpdatedReply(false);
        if (setUpdateState) { setUpdateState(false); }
      };
      feedCommentData();
    }
  }, [
    commentSectionData, updateState, checkLoadMoreId, commentReplyID,
    setUpdateState, updatedReply, generateReplyIndex,
  ]);

  useEffect(() => {
    setReplyMessage('');
    setCommentReplyErrorMessage([]);
    setReplyImageArray([]);

    if (isReply && selectedReplyUserID !== loginUserId) {
      const mentionString = `@${replyUserName}`;
      const encMsg = replyMentionFormat(mentionString, selectedReplyUserID);
      const decMsg = decryptMessage(encMsg, true, true);
      setDecReplyMessage(`${decMsg} `);
      setReplyMessage(encMsg);
    }
  }, [replyUserName, isReply, selectedReplyCommentId,
    loginUserId, selectedReplyUserID, setCommentReplyErrorMessage]);

  useEffect(() => {
    setCommentReplyErrorMessage([]);
    setCommentErrorMessage([]);
  }, [isEdit, setCommentReplyErrorMessage, setCommentErrorMessage]);

  useEffect(() => {
    if (!isReply) {
      setReplyImageArray([]);
      setSelectedReplyId('');
    }

    if (isReply) {
      setCommentErrorMessage([]);
      setMessage('');
    }
    setUploadPost([]);
    setImageArray([]);
  }, [isReply, setCommentErrorMessage]);

  const sendComment = (commentId?: string, msg?: string) => {
    if (updateState) {
      if (!commentId) {
        if (commentError && commentError.length) {
          setMessage(msg!);
        } else {
          setMessage('');
          setImageArray([]);
        }
      }

      if (replyImageArray.length > 0 || msg) {
        if ((commentReplyError && commentReplyError.length)) {
          setIsReply(true);
          setReplyMessage(msg!);
          setReplyUserName(replyUserName);
        } else {
          setIsReply(false);
          setReplyMessage('');
          setReplyUserName('');
          setReplyImageArray([]);
        }
      }

      setUploadPost([]);
    }
  };

  const handlePopover = (value: string, popoverData: PopoverClickProps) => {
    setCommentImages(popoverData.postImages);
    setDeleteImageIds([]);
    setCommentID(popoverData.id);
    setCommentReplyID('');
    setEditContent(popoverData.message);

    if (popoverData.userId) {
      setCommentReplyUserId(popoverData.userId);
    }

    if (value === 'Edit') {
      setIsEdit(true);
    } else {
      setShow(true);
      setDropDownValue(value);
      setIsEdit(false);
    }
  };

  const handleReplyPopover = (value: string, popoverData: PopoverClickProps) => {
    setCommentImages(popoverData.postImages);
    setDeleteImageIds([]);
    setCommentReplyID(popoverData.id);
    setCommentID('');
    setEditContent(popoverData.message);

    if (popoverData.userId) {
      setCommentReplyUserId(popoverData.userId);
    }

    if (value === 'Edit') {
      setIsEdit(true);
    } else {
      setShow(true);
      setDropDownValue(value);
      setIsEdit(false);
    }
  };

  const handleFileChange = (
    postImage: ChangeEvent<HTMLInputElement>,
    selectedReplyUserId?: string,
  ) => {
    if (!postImage.target) {
      return;
    }
    const fileName = selectedReplyUserId ? 'reply' : 'post';
    if (postImage.target.name === fileName && postImage.target && postImage.target.files) {
      const uploadedPostList = [...uploadPost];
      const imageArrayList = selectedReplyUserId ? [...replyImageArray] : [...imageArray];
      const descriptionArrayList = selectedReplyUserId
        ? [...replyDescriptionArray]
        : [...descriptionArray];
      const fileList = postImage.target.files;
      for (let list = 0; list < fileList.length; list += 1) {
        if (uploadedPostList.length < 4) {
          const image = URL.createObjectURL(postImage.target.files[list]);
          uploadedPostList.push(image);
          imageArrayList.push(postImage.target.files[list]);
          descriptionArrayList?.push('');
        }
      }
      setUploadPost(uploadedPostList);
      if (selectedReplyUserId) {
        setReplyImageArray(imageArrayList);
        setReplyDescriptionArray(descriptionArrayList);
      } else {
        setImageArray(imageArrayList);
        setDescriptionArray(descriptionArrayList);
      }
    }
  };

  const handleRemoveFile = (postImage: File, index?: number, selectedReplyUserId?: string) => {
    const images = selectedReplyUserId ? replyImageArray : imageArray;
    const descriptionArrayList = selectedReplyUserID
      ? [...replyDescriptionArray] : [...descriptionArray];
    const removePostImage = images.filter((image: File) => image !== postImage);
    const findImageIndex = images.findIndex((image: File) => image === postImage);
    uploadPost.splice(findImageIndex, 1);
    if (selectedReplyUserId) {
      setReplyImageArray(removePostImage);
      descriptionArrayList!.splice(index!, 1);
      setReplyDescriptionArray([...descriptionArrayList]);
    } else {
      setImageArray(removePostImage);

      descriptionArrayList!.splice(index!, 1);
      setDescriptionArray([...descriptionArrayList!]);
    }
  };

  const handleShowMoreComments = (loadId: string) => {
    const updatedCommentData: FeedComments[] = [];
    /* eslint-disable no-param-reassign */
    commentData.map((comment: any) => {
      if (comment.id === loadId) {
        comment.isReplyIndex = comment.commentReplySection.length;
        updatedCommentData.push(comment);
        if (checkLoadMoreId.length) {
          checkLoadMoreId.find(
            (id: any) => {
              if (id !== loadId) {
                setCheckLoadMoreId([...checkLoadMoreId, loadId]);
              }
              return id;
            },
          );
        } else {
          setCheckLoadMoreId([...checkLoadMoreId, loadId]);
        }
      } else {
        updatedCommentData.push(comment);
      }
      return comment;
    });
    setCommentData(updatedCommentData);
  };

  const onBlockYesClick = () => {
    setProgressButtonStatus('loading');
    createBlockUser(commentReplyUserId)
      .then(() => {
        setShow(false);
        setProgressButtonStatus('default');
        // Set dropDownValue for parent `<ReportModal/>`
        setSelectedBlockedUserId(commentReplyUserId);
        setCommentDropDownValue('BlockUserSuccess');
      })
      /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
  };

  const handleCommentReplyReport = (reason: string) => {
    setProgressButtonStatus('loading');
    const reportPayload = {
      targetId: commentID || commentReplyID,
      reason,
      reportType: commentID ? 'comment' : 'reply',
    };
    reportData(reportPayload).then(() => {
      setProgressButtonStatus('default');
    })
      /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
    setDropDownValue('PostReportSuccessDialog');
  };

  const afterBlockUser = () => {
    setShow(false);
  };

  const oldReply: any = (comment: any, replyCommentIndex: number) => (
    <div key={comment.id}>
      <CommentSection
        id={comment.id}
        image={comment.profilePic}
        name={comment.name}
        time={comment.time}
        likeIcon={comment.likeIcon}
        commentMsg={comment.commentMsg}
        commentMention={comment.commentMention}
        commentImg={comment.commentImg}
        onIconClick={() => {
          onLikeClick(comment.id); setCommentReplyID(comment.id);
        }}
        popoverOptions={
          checkPopover(comment.userId?._id || comment.userId?.id)
        }
        onPopoverClick={handleReplyPopover}
        feedCommentId={comment.feedCommentId}
        message={comment.commentMsg}
        userName={comment.name}
        handleSeeCompleteList={handleSeeCompleteList}
        likeCount={comment.likeCount}
        userId={comment.userId?._id}
        active={queryReplyId ? comment.id === queryReplyId : false}
        isReply
        setIsReply={setIsReply}
        replyCommentIndex={replyCommentIndex}
        handleLikeModal={handleLikeModal}
      />
    </div>
  );

  useEffect(() => {
    if (queryReplyId && commentData.length) {
      commentData.map((comment: any) => {
        if (queryCommentId === comment.id) {
          comment.isReplyIndex = comment.commentReplySection.length;
          return comment;
        }
        return comment;
      });
    }
  }, [queryCommentId, queryReplyId, commentData]);

  const generateReplyInput = (dataId: any) => (
    <div id={scrollId} ref={tabsRef}>
      {/* This `CommentInput` is the ``reply-on-a-comment``. */}
      <CommentInput
        decryptEditMessage={decReplyMessage}
        message={replyMessage}
        inputFile={replyInputFile}
        handleFileChange={handleFileChange}
        sendComment={sendComment}
        imageArray={replyImageArray}
        handleRemoveFile={handleRemoveFile}
        dataId={dataId}
        handleSearch={handleSearch}
        mentionList={mentionList}
        isReply
        replyImageArray={replyImageArray}
        addUpdateReply={addUpdateReply}
        commentID={selectedReplyCommentId}
        checkCommnt="reply-on-comment"
        commentReplyID={selectedReplyId!}
        commentError={commentError}
        commentReplyError={commentReplyError}
        commentSent={commentSent}
        setCommentReplyErrorMessage={setCommentReplyErrorMessage}
        setReplyImageArray={setReplyImageArray}
        isEdit={isEdit}
        descriptionArray={descriptionArray}
        setDescriptionArray={setDescriptionArray}
        replyDescriptionArray={replyDescriptionArray}
        setReplyDescriptionArray={setReplyDescriptionArray}
        isMainPostCommentClick={isMainPostCommentClick}
        selectedReplyUserId={selectedReplyUserID}
        setHasReplyMessage={setHasReplyMessage}
      />
      {
        !isEdit && commentReplyError
        && <ErrorMessageList errorMessages={commentReplyError} divClass="mt-3 text-start" className="m-0 mb-4" />
      }
    </div>
  );
  useEffect(() => {
    setTimeout(() => {
      if (isMainPostCommentClick
        && commentSectionData
        && commentSectionData.length > 0
        && commentSectionRef.current) {
        document.documentElement.style.scrollBehavior = 'auto';
        commentSectionRef?.current?.scrollIntoView({
          behavior: 'instant' as any,
          block: 'start',
        });
      }
    }, 500);
    setTimeout(() => {
      document.documentElement.style.scrollBehavior = 'smooth';
    }, 600);
  }, [isMainPostCommentClick, commentSectionData]);
  return (
    <div id={COMMENT_SECTION_ID} ref={commentSectionRef}>
      {/* This `CommentInput` is the ``comment-on-post``. */}
      <CommentInput
        decryptEditMessage={decReplyMessage}
        message={message}
        setIsReply={setIsReply}
        inputFile={inputFile}
        handleFileChange={handleFileChange}
        sendComment={sendComment}
        imageArray={imageArray}
        handleRemoveFile={handleRemoveFile}
        handleSearch={handleSearch}
        mentionList={mentionList}
        addUpdateComment={addUpdateComment}
        commentID={selectedReplyCommentId}
        checkCommnt="comments"
        commentError={commentError}
        commentReplyError={commentReplyError}
        commentSent={commentSent}
        setCommentReplyErrorMessage={setCommentReplyErrorMessage}
        setReplyImageArray={setReplyImageArray}
        isEdit={isEdit}
        descriptionArray={descriptionArray}
        setDescriptionArray={setDescriptionArray}
        commentOrReplySuccessAlertMessage={commentOrReplySuccessAlertMessage}
        setCommentOrReplySuccessAlertMessage={setCommentOrReplySuccessAlertMessage}
      />
      {commentData && commentData.length > 0 && queryCommentId && previousCommentsAvailable
        && (
          <div className="text-center">
            <Button
              variant="link"
              className="shadow-none"
              onClick={loadNewerComment}
            >
              Load newer comments
            </Button>
          </div>
        )}
      {commentData && commentData.length > 0
        && commentData.map((data: any) => (
          <div className="pt-md-1" key={data.id}>
            <div className="ps-md-0">
              <CommentSection
                id={data.id}
                image={data.profilePic}
                name={data.name}
                time={data.time}
                likeIcon={data.likeIcon}
                commentMsg={data.commentMsg}
                commentImg={data.commentImg}
                onIconClick={() => onLikeClick(data.id)}
                popoverOptions={
                  checkPopover(data.userId?._id || data.userId?.id)
                }
                onPopoverClick={handlePopover}
                message={data.commentMsg}
                handleSeeCompleteList={handleSeeCompleteList}
                likeCount={data.likeCount}
                userId={data.userId?._id}
                active={!queryReplyId ? data.id === queryCommentId : false}
                setIsReply={setIsReply}
                handleLikeModal={handleLikeModal}
              />
              <div className="ms-4">
                <div className="ms-md-4">
                  {
                    isReply
                    && selectedReplyCommentId === data.id
                    && !selectedReplyId
                    && (generateReplyInput(data.id))
                  }
                  {data.commentReplySection && data.commentReplySection.length > 0
                    && data.commentReplySection
                      .slice(0, data.isReplyIndex)
                      .map((comment: any, replyCommentIndex: number) => (
                        <div key={comment.id}>
                          {(replyCommentIndex !== (data.commentReplySection.length - 1))
                            || ((replyCommentIndex === (data.commentReplySection.length - 1))
                              && !comment.newComment)
                            || ((replyCommentIndex === (data.commentReplySection.length - 1))
                              && (comment.newComment)
                              && (isReply || selectedReplyCommentId !== data.id))
                            ? oldReply(comment, replyCommentIndex)
                            : null}
                          {
                            isReply
                            && selectedReplyCommentId === data.commentReplySection[0]?.feedCommentId
                            && selectedReplyId === comment.id
                            && replyCommentIndex === replyIndex
                            && (generateReplyInput(data.id))
                          }
                        </div>
                      ))}

                  {data.commentReplySection.map(
                    (comment: any, replyCommentIndex: number) => (
                      <div key={comment.id}>
                        {(replyCommentIndex === (data.commentReplySection.length - 1))
                          && (comment.newComment)
                          && !isReply
                          && data.id === selectedReplyCommentId
                          ? oldReply(comment, replyCommentIndex)
                          : null}
                      </div>
                    ),
                  )}

                  {data.commentReplySection
                    && data.commentReplySection.length >= 1
                    && !checkLoadMoreId.includes(data.id)
                    && data.commentReplySection.length - data.isReplyIndex > 0
                    && !(
                      data.commentReplySection.findLastIndex(
                        (item: any) => item.newComment,
                      ) === data.commentReplySection.length - 1
                    )
                    && (
                      <LoadMoreCommentsWrapper>
                        <Button
                          variant="link"
                          className="text-primary"
                          onClick={() => {
                            handleShowMoreComments(data.commentReplySection[0]?.feedCommentId);
                            setIsReply(false);
                          }}
                        >
                          {`Load
                                ${(data.commentReplySection.length - data.isReplyIndex
                              - (!updatedReply
                                && data.id === selectedReplyCommentId
                                ? data.commentReplySection.filter(
                                  (reply: any, index: any) => (
                                    index === data.commentReplySection.length - 1
                                    && reply.newComment
                                    && !isReply
                                  ),
                                ).length : 0
                              ))
                            }
                            more
                          ${(data.commentReplySection.length - data.isReplyIndex
                              - (!updatedReply
                                && data.id === selectedReplyCommentId
                                ? data.commentReplySection.filter(
                                  (reply: any, index: number) => (
                                    index === data.commentReplySection.length - 1
                                    && reply.newComment
                                    && !isReply
                                  ),
                                ).length : 0
                              )
                            ) === 1 ? 'reply' : 'replies'}`}
                        </Button>
                      </LoadMoreCommentsWrapper>
                    )}

                </div>
              </div>
            </div>
          </div>
        ))}
      <ReportModal
        show={show}
        setShow={setShow}
        slectedDropdownValue={dropDownValue}
        onBlockYesClick={onBlockYesClick}
        handleReport={handleCommentReplyReport}
        removeCommentAsync={removeCommentAsync}
        afterBlockUser={afterBlockUser}
        ProgressButton={ProgressButton}
      />
      {
        isEdit
        && (
          <EditCommentModal
            showEdit={isEdit}
            setShowEdit={setIsEdit}
            commentID={commentID}
            commentReplyID={commentReplyID}
            setCommentID={setCommentID}
            setCommentReplyID={setCommentReplyID}
            editContent={editContent}
            isReply={!commentID}
            addUpdateComment={addUpdateComment}
            addUpdateReply={addUpdateReply}
            deleteImageIds={deleteImageIds}
            setDeleteImageIds={setDeleteImageIds}
            postImages={commentImages}
            setPostImages={setCommentImages}
            commentError={commentError.length > 0 ? commentError : commentReplyError}
            ProgressButton={ProgressButton}
          />
        )
      }
    </div>
  );
}
PostCommentSection.defaultProps = {
  commentReplySection: undefined,
};
export default PostCommentSection;
