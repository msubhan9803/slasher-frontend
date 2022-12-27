/* eslint-disable max-lines */
import React, {
  SyntheticEvent, useEffect, useRef, useState, ChangeEvent,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Button,
  Col, Form, Image, InputGroup, Row,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CommentSection from './CommentSection';
import ReportModal from '../ReportModal';
import UserCircleImage from '../UserCircleImage';
import { FeedComments } from '../../../types';
import EditCommentModal from '../editCommentModal';
import { PopoverClickProps } from '../CustomPopover';
import { createBlockUser } from '../../../api/blocks';
import { reportData } from '../../../api/report';

const StyledCommentInputGroup = styled(InputGroup)`
  .form-control {
    border-radius: 1.875rem;
    border-bottom-right-radius: 0rem;
    border-top-right-radius: 0rem;

  }
  .input-group-text {
    background-color: rgb(31, 31, 31);
    border-color: #3a3b46;
    border-radius: 1.875rem;
  }
  svg {
    min-width: 1.875rem;
  }
`;
const PostImageContainer = styled.div`
  width: 4.25rem;
  height: 4.25rem;
  border: 0.125rem solid #3A3B46
`;

const LoadMoreCommentsWrapper = styled.div.attrs({ className: 'text-center' })`
  margin: -1rem 0 1rem;
`;

function PostCommentSection({
  commentSectionData,
  commentImage,
  popoverOption,
  setCommentValue,
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
}: any) {
  const [commentData, setCommentData] = useState<FeedComments[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const commentRef = useRef<any>();
  const textReplyRef = useRef<any>();
  const inputFile = useRef<HTMLInputElement>(null);
  const tabsRef = useRef<any>();
  const replyInputFile = useRef<HTMLInputElement>(null);
  const [uploadPost, setUploadPost] = useState<string[]>([]);
  const [imageArray, setImageArray] = useState<any>([]);
  const [replyImageArray, setReplyImageArray] = useState<any>([]);
  const [message, setMessage] = useState<string>('');
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [isReply, setIsReply] = useState<boolean>(false);
  const [replyId, setReplyId] = useState<string>('');
  const [replyUserName, setReplyUserName] = useState<string>('');
  const [editContent, setEditContent] = useState<string>();
  const loadMore = 10;
  const [next, setNext] = useState(2);
  const [loadMoreId, setLoadMoreId] = useState<string>('');
  const userData = useSelector((state: any) => state.user);
  const [commentReplyUserId, setCommentReplyUserId] = useState<string>('');
  const [searchParams] = useSearchParams();
  const queryCommentId = searchParams.get('commentId');
  const queryReplyId = searchParams.get('replyId');
  const onChangeHandler = (e: SyntheticEvent, inputId?: string) => {
    const target = e.target as HTMLTextAreaElement;
    if (inputId) {
      textReplyRef.current.style.height = '36px';
      textReplyRef.current.style.height = `${target.scrollHeight}px`;
      textReplyRef.current.style.maxHeight = '100px';
      setReplyMessage(target.value);
    } else {
      commentRef.current.style.height = '36px';
      commentRef.current.style.height = `${target.scrollHeight}px`;
      commentRef.current.style.maxHeight = '100px';
      setMessage(target.value);
    }
  };

  const handleSeeCompleteList = () => {
    const tabs = tabsRef.current;
    if (tabs) {
      tabs.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        Inline: 'center',
      });
    }
  };

  useEffect(() => {
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
        commentReplySection: commentReplies.reverse(),
        userId: comment.userId,
        likeIcon: comment.likedByUser,
        likeCount: comment.likeCount,
        commentCount: comment.commentCount,
      };
      return feedComment;
    });
    setCommentData(comments);
  }, [commentSectionData]);

  useEffect(() => {
    setReplyMessage('');
    if (isReply) {
      const mentionString = `@${replyUserName} `;
      setReplyMessage(mentionString);
    }
  }, [replyUserName, isReply]);

  const sendComment = (commentId?: string) => {
    if (commentId === undefined) {
      commentRef.current.style.height = '36px';
      setCommentValue({
        commentMessage: message,
        replyMessage: '',
        imageArray,
      });
      setMessage('');
      setImageArray([]);
    } else {
      textReplyRef.current.style.height = '36px';
      const mentionReplyString = replyMessage.replace(`@${replyUserName}`, `##LINK_ID##${replyId}@${replyUserName}##LINK_END##`);
      setCommentID(commentId);
      setCommentValue({
        commentMessage: '',
        replyMessage: mentionReplyString,
        imageArray: replyImageArray,
      });
      setReplyMessage('');
      setReplyImageArray([]);
    }
    setIsReply(false);
    setReplyId('');
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
    setLoadMoreId(loadId);
    setNext(next + loadMore);
    setIsReply(false);
  };

  const onBlockYesClick = () => {
    createBlockUser(commentReplyUserId)
      .then(() => {
        setShow(false);
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };
  const loadMoreReply = (data: any) => {
    if (data.id === queryCommentId) {
      return data.commentReplySection.length;
    }
    if (loadMoreId === data.id) {
      return next;
    }
    return 2;
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

  return (
    <>
      <Form>
        <Row className="ps-3 pt-2 order-last order-sm-0">
          <Col xs="auto" className="pe-0">
            <UserCircleImage src={userData.user.profilePic} className="me-3 bg-secondary" />
          </Col>
          <Col className="ps-0 pe-4">
            <div className="d-flex align-items-end mb-4">
              <StyledCommentInputGroup>
                <Form.Control
                  placeholder="Write a comment"
                  className="fs-5 border-end-0"
                  rows={1}
                  as="textarea"
                  ref={commentRef}
                  value={message}
                  onFocus={() => setIsReply(false)}
                  onChange={onChangeHandler}
                />
                <InputGroup.Text>
                  <FontAwesomeIcon
                    role="button"
                    onClick={() => {
                      inputFile.current?.click();
                      setIsReply(false);
                    }}
                    icon={solid('camera')}
                    size="lg"
                  />
                  <input
                    type="file"
                    name="post"
                    className="d-none"
                    accept="image/*"
                    onChange={(post) => {
                      handleFileChange(post);
                    }}
                    multiple
                    ref={inputFile}
                  />
                </InputGroup.Text>
              </StyledCommentInputGroup>
              <Button onClick={() => sendComment()} variant="link" className="ms-2 p-0">
                <FontAwesomeIcon icon={solid('paper-plane')} style={{ fontSize: '26px' }} className="text-primary" />
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="mx-5 px-3">
          {imageArray.map((post: File) => (
            <Col xs="auto" key={post.name} className="px-3 mb-1">
              <PostImageContainer className="mt-2 mb-3 position-relative d-flex justify-content-center align-items-center rounded border-0">
                <Image
                  src={URL.createObjectURL(post)}
                  alt="Dating profile photograph"
                  className="w-100 h-100 img-fluid rounded"
                />
                <FontAwesomeIcon
                  icon={solid('times')}
                  size="xs"
                  role="button"
                  className="position-absolute bg-white text-primary rounded-circle"
                  style={{
                    padding: '0.313rem 0.438rem',
                    top: '-0.5rem',
                    left: '3.5rem',
                  }}
                  onClick={() => handleRemoveFile(post)}
                />
              </PostImageContainer>
            </Col>
          ))}
        </Row>
      </Form>
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
                    setIsReply={setIsReply}
                    setReplyId={setReplyId}
                    setReplyUserName={setReplyUserName}
                    content={data.commentMsg}
                    handleSeeCompleteList={handleSeeCompleteList}
                    likeCount={data.likeCount}
                    userId={data.userId?._id}
                    active={!queryReplyId ? data.id === queryCommentId : false}
                  />
                  <div className="ms-5 ps-2">
                    <div className="ms-md-4">
                      {data.commentReplySection && data.commentReplySection.length > 0
                        && data.commentReplySection
                          .slice(0, loadMoreReply(data))
                          .map((comment: any) => (
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
                                setIsReply={setIsReply}
                                setReplyId={setReplyId}
                                setReplyUserName={setReplyUserName}
                                feedCommentId={comment.feedCommentId}
                                content={comment.commentMsg}
                                userName={comment.name}
                                handleSeeCompleteList={handleSeeCompleteList}
                                likeCount={comment.likeCount}
                                userId={comment.userId?._id}
                                active={queryReplyId ? comment.id === queryReplyId : false}
                              />
                            </div>
                          ))}
                      {data.commentReplySection
                        && data.commentReplySection.length > 2
                        && !(data.commentReplySection[0]?.feedCommentId === loadMoreId
                          && next >= data.commentReplySection.length)
                        && (data.commentReplySection[0]?.feedCommentId !== queryCommentId)
                        && (
                          <LoadMoreCommentsWrapper>
                            <Button
                              variant="link"
                              className="text-primary shadow-none"
                              onClick={() => {
                                handleShowMoreComments(data.commentReplySection[0]?.feedCommentId);
                              }}
                            >
                              Load more comments
                            </Button>
                          </LoadMoreCommentsWrapper>
                        )}
                      {
                        isReply && (replyId === data.id
                          || replyId === data.commentReplySection[0]?.feedCommentId) && (
                          <Form ref={tabsRef}>
                            <Row className="ps-3 pt-2 order-last order-sm-0">
                              <Col xs="auto" className="pe-0">
                                <UserCircleImage src={commentImage} className="me-3 bg-secondary" />
                              </Col>
                              <Col className="ps-0 pe-4">
                                <div className="d-flex align-items-end mb-4">
                                  <StyledCommentInputGroup>
                                    <Form.Control
                                      placeholder="Write a comments"
                                      className="fs-5 border-end-0"
                                      rows={1}
                                      as="textarea"
                                      ref={textReplyRef}
                                      value={replyMessage}
                                      onChange={(e: any) => onChangeHandler(e, data.id)}
                                    />
                                    <InputGroup.Text>
                                      <FontAwesomeIcon role="button" onClick={() => replyInputFile.current?.click()} icon={solid('camera')} size="lg" />
                                      <input
                                        type="file"
                                        name="reply"
                                        className="d-none"
                                        accept="image/*"
                                        onChange={(reply) => {
                                          handleFileChange(reply, data.id);
                                        }}
                                        multiple
                                        ref={replyInputFile}
                                      />
                                    </InputGroup.Text>
                                  </StyledCommentInputGroup>
                                  <Button onClick={() => sendComment(data.id)} variant="link" className="ms-2 p-0">
                                    <FontAwesomeIcon icon={solid('paper-plane')} style={{ fontSize: '26px' }} className="text-primary" />
                                  </Button>
                                </div>
                              </Col>
                            </Row>

                            <Row className="mx-5 px-3">
                              {replyImageArray.map((reply: File) => (
                                <Col xs="auto" key={reply.name} className="px-3 mb-1">
                                  <PostImageContainer className="mt-2 mb-3 position-relative d-flex justify-content-center align-items-center rounded border-0">
                                    <Image
                                      src={URL.createObjectURL(reply)}
                                      alt="Dating profile photograph"
                                      className="w-100 h-100 img-fluid rounded"
                                    />
                                    <FontAwesomeIcon
                                      icon={solid('times')}
                                      size="xs"
                                      role="button"
                                      className="position-absolute bg-white text-primary rounded-circle"
                                      style={{
                                        padding: '0.313rem 0.438rem',
                                        top: '-0.5rem',
                                        left: '3.5rem',
                                      }}
                                      onClick={() => handleRemoveFile(reply, data.id)}
                                    />
                                  </PostImageContainer>
                                </Col>
                              ))}
                            </Row>
                          </Form>
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
            setCommentValue={setCommentValue}
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
