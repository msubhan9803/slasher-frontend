/* eslint-disable max-lines */
import React, {
  useEffect, useRef, useState, ChangeEvent, useCallback,
} from 'react';
import {
  Button, Col, Row,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
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

const LoadMoreCommentsWrapper = styled.div.attrs({ className: 'text-center' })`
  margin: -1rem 0 1rem;
`;

function PostCommentSection({
  postCreator,
  commentSectionData,
  popoverOption,
  removeComment,
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
  const [isReply, setIsReply] = useState<boolean>(false);
  const [selectedReplyCommentId, setSelectedReplyCommentId] = useState<string>('');
  const [replyUserName, setReplyUserName] = useState<string>('');
  const [selectedReplyUserID, setSelectedReplyUserID] = useState<string>('');
  const [editContent, setEditContent] = useState<string>();
  const userData = useSelector((state: any) => state.user);
  const [commentReplyUserId, setCommentReplyUserId] = useState<string>('');
  const [searchParams] = useSearchParams();
  const queryCommentId = searchParams.get('commentId');
  const queryReplyId = searchParams.get('replyId');
  const [checkLoadMoreId, setCheckLoadMoreId] = useState<any[]>([]);
  const [replyIndex, setReplyIndex] = useState<number>(2);
  const [scrollId, setScrollId] = useState<string>('');
  const [selectedReplyId, setSelectedReplyId] = useState<string | null>('');
  const [updatedReply, setUpdatedReply] = useState<boolean>(false);

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
  }, [commentData]);

  useEffect(() => {
    handleSeeCompleteList(selectedReplyCommentId, replyUserName, selectedReplyId, scrollId);
  }, [selectedReplyCommentId, replyUserName, scrollId, selectedReplyId, isReply,
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
  }, [isReply, commentData, tabsRef, replyIndex, selectedReplyCommentId, scrollId]);

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
        if (setUpdateState) { setUpdateState(false); }
      };
      feedCommentData();
    }
  }, [
    commentSectionData, updateState, checkLoadMoreId, commentReplyID,
    setUpdateState, commentData, updatedReply,
  ]);

  useEffect(() => {
    setReplyMessage('');
    if (isReply && selectedReplyUserID !== loginUserId) {
      const mentionString = `@${replyUserName}`;
      setReplyMessage(mentionString);
    }
  }, [replyUserName, isReply, selectedReplyCommentId, loginUserId, selectedReplyUserID]);

  useEffect(() => {
    if (!isReply) {
      setReplyImageArray([]);
      setSelectedReplyId('');
    }
    setUploadPost([]);
    setImageArray([]);
  }, [isReply]);

  const sendComment = (commentId?: string) => {
    const imageArr = commentId ? replyImageArray : imageArray;
    if (!commentId) {
      setMessage('');
      setImageArray([]);
    } else {
      const mentionReplyString = replyMessage.replace(`@${replyUserName}`, `##LINK_ID##${selectedReplyCommentId}@${replyUserName}##LINK_END##`);
      if (mentionReplyString || imageArr.length) {
        setIsReply(false);
      }
      setReplyMessage('');
      setReplyImageArray([]);
      setUpdatedReply(true);
    }
    setUploadPost([]);
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
      const fileList = postImage.target.files;
      for (let list = 0; list < fileList.length; list += 1) {
        if (uploadedPostList.length < 4) {
          const image = URL.createObjectURL(postImage.target.files[list]);
          uploadedPostList.push(image);
          imageArrayList.push(postImage.target.files[list]);
        }
      }
      setUploadPost(uploadedPostList);
      if (selectedReplyUserId) {
        setReplyImageArray(imageArrayList);
      } else {
        setImageArray(imageArrayList);
      }
    }
  };

  const handleRemoveFile = (postImage: File, selectedReplyUserId?: string) => {
    const images = selectedReplyUserId ? replyImageArray : imageArray;
    const removePostImage = images.filter((image: File) => image !== postImage);
    const findImageIndex = images.findIndex((image: File) => image === postImage);
    uploadPost.splice(findImageIndex, 1);
    if (selectedReplyUserId) {
      setReplyImageArray(removePostImage);
    } else {
      setImageArray(removePostImage);
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
          checkPopover(comment.userId?._id || comment.userId?.id)
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
  return (
    <>
      <CommentInput
        userData={userData}
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
                    popoverOptions={
                      checkPopover(data.userId?._id || data.userId?.id)
                    }
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
                              message={replyMessage}
                              inputFile={replyInputFile}
                              handleFileChange={handleFileChange}
                              sendComment={sendComment}
                              imageArray={replyImageArray}
                              handleRemoveFile={handleRemoveFile}
                              dataId={data.id}
                              handleSearch={handleSearch}
                              mentionList={mentionList}
                              isReply
                              replyImageArray={replyImageArray}
                              addUpdateReply={addUpdateReply}
                              commentID={selectedReplyCommentId}
                              commentReplyID={selectedReplyId!}
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
            handleSearch={handleSearch}
            mentionList={mentionList}
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
