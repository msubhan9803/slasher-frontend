/* eslint-disable max-lines */
import React, {
  SyntheticEvent, useEffect, useRef, useState, ChangeEvent,
} from 'react';
import {
  Button, Col, Row,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import CommentSection from './CommentSection';
import ReportModal from '../ReportModal';
import { FeedComments } from '../../../types';
import EditCommentModal from '../editCommentModal';
import { PopoverClickProps } from '../CustomPopover';
import { createBlockUser } from '../../../api/blocks';
import { reportData } from '../../../api/report';
import CommentInput from './CommentInput';

const LoadMoreCommentsWrapper = styled.div.attrs({ className: 'text-center' })`
  margin: -1rem 0 1rem;
`;

function PostCommentSection({
  commentSectionData,
  popoverOption,
  removeComment,
  setCommentID,
  setCommentReplyID,
  commentID,
  commentReplyID,
  loginUserId,
  otherUserPopoverOptions,
  isEdit,
  setIsEdit,
  onLikeClick,
  loadNewerComment,
  previousCommentsAvailable,
  addUpdateReply,
  addUpdateComment,
  updateState,
  setUpdateState,
}: any) {
  const [commentData, setCommentData] = useState<FeedComments[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const commentRef = useRef<any>();
  const replyRef = useRef<any>();
  const inputFile = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<any>();
  const replyInputFile = useRef<HTMLInputElement>(null);
  const [uploadPost, setUploadPost] = useState<string[]>([]);
  const [imageArray, setImageArray] = useState<any>([]);
  const [replyImageArray, setReplyImageArray] = useState<any>([]);
  const [message, setMessage] = useState<string>('');
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [isReply, setIsReply] = useState<boolean>(false);
  const [selectedReplyCommentId, setSelectedReplyCommentId] = useState<string>('');
  const [replyUserName, setReplyUserName] = useState<string>('');
  const [editContent, setEditContent] = useState<string>();
  const userData = useSelector((state: any) => state.user);
  const [commentReplyUserId, setCommentReplyUserId] = useState<string>('');
  const [searchParams] = useSearchParams();
  const queryCommentId = searchParams.get('commentId');
  const queryReplyId = searchParams.get('replyCommentId');
  const [checkLoadMoreId, setCheckLoadMoreId] = useState<any[]>([]);
  const [replyIndex, setReplyIndex] = useState<number>(2);
  const [scrollId, setScrollId] = useState<string>('');
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>('');
  const [updatedReply, setUpdatedReply] = useState<boolean>(false);

  const onChangeHandler = (e: SyntheticEvent, inputId?: string) => {
    const target = e.target as HTMLTextAreaElement;
    if (inputId) {
      replyRef.current.style.height = '36px';
      replyRef.current.style.height = `${target.scrollHeight}px`;
      replyRef.current.style.maxHeight = '100px';
      setReplyMessage(target.value);
    } else {
      commentRef.current.style.height = '36px';
      commentRef.current.style.height = `${target.scrollHeight}px`;
      commentRef.current.style.maxHeight = '100px';
      setMessage(target.value);
    }
  };

  const handleSeeCompleteList = (
    commentReplyId: string,
    replyName: string,
    selectedReply?: string | null,
    scrollReplyId?: string,
    replyCommentIndex?: number,
  ) => {
    setScrollId(scrollReplyId!);
    if (replyCommentIndex! >= 0) {
      setSelectedReplyId(selectedReply || null);
      setSelectedReplyCommentId(commentReplyId);
      setReplyUserName(replyName);
      setCheckLoadMoreId([]);
      const updatedCommentData: FeedComments[] = [];
      commentData.map((comment: any) => {
        /* eslint-disable no-param-reassign */
        if (comment.id === commentReplyId) {
          setReplyIndex(replyCommentIndex!);
          comment.isReplyIndex = scrollReplyId?.includes('comment') ? 0 : replyCommentIndex! + 1;
          updatedCommentData.push(comment);
        } else {
          updatedCommentData.push(comment);
        }
        return null;
      });
      setCommentData(updatedCommentData);
    }
  };

  useEffect(() => {
    handleSeeCompleteList(selectedReplyCommentId, replyUserName, selectedReplyId, scrollId);
  }, [selectedReplyCommentId, replyUserName, scrollId, selectedReplyId, isReply]);

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
  }, [isReply, commentData, tabsRef, replyIndex, selectedReplyCommentId]);

  const feedCommentData = () => {
    const comments = commentSectionData.map((comment: FeedComments) => {
      const commentReplies = comment.replies.map((replies: any) => {
        const feeedCommentReplies: any = {
          /* eslint no-underscore-dangle: 0 */
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
        /* eslint no-underscore-dangle: 0 */
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
        isReplyIndex: checkLoadMoreId.find(
          (loadedComment: any) => loadedComment.id === comment._id,
        )?.isReplyIndex
          ?? commentData.find(
            (replyComment: any) => replyComment.id === comment._id,
          )?.isReplyIndex! >= 0
          ? commentData.find(
            (replyComment: any) => replyComment.id === comment._id,
          )?.isReplyIndex
          : 2,
      };
      return feedComment;
    });
    setCommentData(comments);
    setUpdatedReply(false);
    if (setUpdateState) setUpdateState(false);
  };

  useEffect(() => {
    if (commentSectionData || updateState) {
      feedCommentData();
    }
  }, [commentSectionData, updateState]);

  useEffect(() => {
    setReplyMessage('');
    if (isReply) {
      const mentionString = `@${replyUserName} `;
      setReplyMessage(mentionString);
    }
  }, [replyUserName, isReply, selectedReplyCommentId]);

  const sendComment = (commentId?: string) => {
    if (commentId === undefined) {
      commentRef.current.style.height = '36px';
      addUpdateComment({
        commentMessage: message,
        commentId,
        imageArray,
      });
      setMessage('');
      setImageArray([]);
    } else {
      replyRef.current.style.height = '36px';
      const mentionReplyString = replyMessage.replace(`@${replyUserName}`, `##LINK_ID##${selectedReplyCommentId}@${replyUserName}##LINK_END##`);
      addUpdateReply({
        replyMessage: mentionReplyString,
        commentId,
        imageArray,
        commentReplyID,
      });
      setReplyMessage('');
      setReplyImageArray([]);
      setUpdatedReply(true);
    }
    setIsReply(false);
    setSelectedReplyId('');
    setReplyUserName('');
  };

  const handlePopover = (value: string, popoverData: PopoverClickProps) => {
    setCommentID(popoverData.id);
    setCommentReplyID('');
    setEditContent(popoverData.content);

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
    setCommentReplyID(popoverData.id);
    setCommentID('');
    setEditContent(popoverData.content);

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

  const handleFileChange = (postImage: ChangeEvent<HTMLInputElement>, replyUserId?: string) => {
    if (!postImage.target) {
      return;
    }
    const fileName = replyUserId ? 'reply' : 'post';
    if (postImage.target.name === fileName && postImage.target && postImage.target.files) {
      const uploadedPostList = [...uploadPost];
      const imageArrayList = replyUserId ? [...replyImageArray] : [...imageArray];
      const fileList = postImage.target.files;
      for (let list = 0; list < fileList.length; list += 1) {
        if (uploadedPostList.length < 4) {
          const image = URL.createObjectURL(postImage.target.files[list]);
          uploadedPostList.push(image);
          imageArrayList.push(postImage.target.files[list]);
        }
      }
      setUploadPost(uploadedPostList);
      if (replyUserId) {
        setReplyImageArray(imageArrayList);
      } else {
        setImageArray(imageArrayList);
      }
    }
  };

  const handleRemoveFile = (postImage: File, replyUserId?: string) => {
    const images = replyUserId ? replyImageArray : imageArray;
    const removePostImage = images.filter((image: File) => image !== postImage);
    setImageArray(removePostImage);
    setReplyImageArray(removePostImage);
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
                const loadMoreData = checkLoadMoreId.push(
                  {
                    id: loadId,
                    isReplyIndex: comment.isReplyIndex,
                  },
                );
                return loadMoreData;
              }
              return id;
            },
          );
        } else {
          checkLoadMoreId.push({ id: loadId, isReplyIndex: comment.isReplyIndex });
        }
      } else {
        updatedCommentData.push(comment);
      }
      return comment;
    });
    setCommentData(updatedCommentData);
  };

  const onBlockYesClick = () => {
    createBlockUser(commentReplyUserId)
      .then(() => {
        setShow(false);
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };

  const handleCommentReplyReport = (reason: string) => {
    const reportPayload = {
      targetId: commentID || commentReplyID,
      reason,
      reportType: commentID ? 'comment' : 'reply',
    };
    reportData(reportPayload).then(() => {
      setShow(false);
    })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
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
          comment.userId?._id && loginUserId !== comment?.userId._id
            ? otherUserPopoverOptions! : popoverOption
        }
        onPopoverClick={handleReplyPopover}
        feedCommentId={comment.feedCommentId}
        content={comment.commentMsg}
        userName={comment.name}
        handleSeeCompleteList={handleSeeCompleteList}
        likeCount={comment.likeCount}
        userId={comment.userId?._id}
        active={queryReplyId ? comment.id === queryReplyId : false}
        isReply
        setIsReply={setIsReply}
        replyCommentIndex={replyCommentIndex}
      />
    </div>
  );

  return (
    <>
      <CommentInput
        userData={userData}
        inputRef={commentRef}
        message={message}
        setIsReply={setIsReply}
        onChangeHandler={onChangeHandler}
        inputFile={inputFile}
        handleFileChange={handleFileChange}
        sendComment={sendComment}
        imageArray={imageArray}
        handleRemoveFile={handleRemoveFile}
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
          <Row className="ps-md-4 pt-md-1" key={data.id}>
            <Col>
              <Row className="mx-auto">
                <Col className="ps-md-0">
                  <CommentSection
                    id={data.id}
                    image={data.profilePic}
                    name={data.name}
                    time={data.time}
                    likeIcon={data.likeIcon}
                    commentMsg={data.commentMsg}
                    commentImg={data.commentImg}
                    onIconClick={() => onLikeClick(data.id)}
                    popoverOptions={data.userId?._id && loginUserId !== data.userId?._id
                      ? otherUserPopoverOptions! : popoverOption}
                    onPopoverClick={handlePopover}
                    content={data.commentMsg}
                    handleSeeCompleteList={handleSeeCompleteList}
                    likeCount={data.likeCount}
                    userId={data.userId?._id}
                    active={!queryReplyId ? data.id === queryCommentId : false}
                    setIsReply={setIsReply}
                  />
                  <div className="ms-5 ps-2">
                    <div className="ms-md-4">
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
                            </div>
                          ))}

                      {data.commentReplySection
                        && data.commentReplySection.length >= 1
                        && data.commentReplySection.length - data.isReplyIndex > 0
                        && data.commentReplySection.length - data.isReplyIndex - (
                          data.commentReplySection.filter(
                            (reply: any, index: any) => (
                              index === data.commentReplySection.length - 1
                              && reply.newComment
                              && !isReply
                              && data.id === selectedReplyCommentId
                            ),
                          )).length > 0
                        && (
                          <LoadMoreCommentsWrapper>
                            <Button
                              variant="link"
                              className="text-primary shadow-none"
                              onClick={() => {
                                handleShowMoreComments(data.commentReplySection[0]?.feedCommentId);
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
                                ) === 1 ? 'comment' : 'comments'}`}
                            </Button>
                          </LoadMoreCommentsWrapper>
                        )}

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

                      {
                        isReply
                        && (selectedReplyCommentId === data.id
                          || selectedReplyCommentId === data.commentReplySection[0]?.feedCommentId
                          || data.commentReplySection.some(
                            (item: any) => item.newComment === true && item.id === selectedReplyId,
                          )
                        ) && (
                          <div id={scrollId} ref={tabsRef}>
                            <CommentInput
                              userData={userData}
                              inputRef={replyRef}
                              message={replyMessage}
                              onChangeHandler={onChangeHandler}
                              inputFile={replyInputFile}
                              handleFileChange={handleFileChange}
                              sendComment={sendComment}
                              imageArray={replyImageArray}
                              handleRemoveFile={handleRemoveFile}
                            />
                          </div>
                        )
                      }
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        ))}
      <ReportModal
        show={show}
        setShow={setShow}
        slectedDropdownValue={dropDownValue}
        onBlockYesClick={onBlockYesClick}
        handleReport={handleCommentReplyReport}
        removeComment={removeComment}
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
          />
        )
      }
    </>
  );
}
PostCommentSection.defaultProps = {
  commentReplySection: undefined,
};
export default PostCommentSection;
