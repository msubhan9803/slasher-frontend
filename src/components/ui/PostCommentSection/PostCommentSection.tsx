/* eslint-disable max-lines */
import React, {
  SyntheticEvent, useEffect, useRef, useState,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import {
  Button,
  Col, Form, Image, InputGroup, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnyIfEmpty } from 'react-redux';
import CommentSection from './CommentSection';
import ReportModal from '../ReportModal';
import UserCircleImage from '../UserCircleImage';
import { FeedComments } from '../../../types';
import { Divider } from '@mui/material';
import { id } from 'date-fns/locale';

interface ImageList {
  image_path: string;
  _id: string;
}
interface Values {
  id: string;
  image: string;
  name: string;
  time: string;
  like: number;
  likeIcon: boolean;
  commentMention: string;
  commentMsg: string;
  commentImg?: ImageList[];
  onIconClick: (value: number) => void;
}

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
function PostCommentSection({
  commentSectionData,
  commentImage,
  popoverOption,
  setCommentValue,
  setfeedImageArray,
  setDeleteComment,
  setDeleteCommentReply,
  setCommentID,
  setCommentReplyID,
}: any) {
  const [commentData, setCommentData] = useState<any[]>(commentSectionData);
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const textRef = useRef<any>();
  const inputFile = useRef<HTMLInputElement>(null);
  const scroll = useRef<any>(null);
  const [uploadPost, setUploadPost] = useState<string[]>([]);
  const [imageArray, setImageArray] = useState<any>([]);
  const [replyImageArray, setReplyImageArray] = useState<any>([]);
  const [message, setMessage] = useState<string>('');
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [isReply, setIsReply] = useState<boolean>(false);
  const [replyId, setReplyId] = useState<string>('');

  const onChangeHandler = (e: SyntheticEvent, id?: string) => {
    const target = e.target as HTMLTextAreaElement;
    if (id) {
      setReplyMessage(target.value);
    } else {
      setMessage(target.value);
    }
    textRef.current.style.height = '36px';
    textRef.current.style.height = `${target.scrollHeight}px`;
    textRef.current.style.maxHeight = '100px';
  };

  useEffect(() => {
    const comments = commentSectionData.map((comment: FeedComments) => {
      let commentReplies = comment.replies.map((replies: any) => {
        const feeedCommentReplies: any = {
          /* eslint no-underscore-dangle: 0 */
          id: replies._id,
          profilePic: replies.userId?.profilePic,
          name: replies.userId?.userName,
          time: replies.createdAt,
          likes: replies.likes.length,
          commentMsg: replies.message,
          commentImg: replies.images,
          feedCommentId: replies.feedCommentId,
        }
        return feeedCommentReplies;
      });
      const feedComment: any = {
        /* eslint no-underscore-dangle: 0 */
        id: comment._id,
        profilePic: comment.userId?.profilePic,
        name: comment.userId?.userName,
        time: comment.createdAt,
        likes: comment.likes.length,
        commentMsg: comment.message,
        commentImg: comment.images,
        commentReplySection: commentReplies,
      };
      return feedComment;
    });
    setCommentData(comments);
  }, [commentSectionData]);

  const handleClick = () => {
    return scroll.current?.scrollIntoView();
  };

  const sendComment = (commentId?: string) => {
    if (commentId === undefined) {
      setCommentValue(message);
      setfeedImageArray(replyImageArray);
      setMessage('');
      setImageArray([]);
    } else {
      setCommentID(commentId);
      setCommentValue(replyMessage);
      setfeedImageArray(imageArray);
      setReplyMessage('');
      setReplyImageArray([]);
    }
    setIsReply(false);
  };

  const onKeyDownHandler = (e: any, id?: string) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      sendComment(id);
      textRef.current.style.height = '36px';
      // scroll.current.style.height = '36px';
    }
  };

  const handleLikeIcon = (likeId: string) => {
    const tempData = [...commentData];
    tempData.map((data: any) => {
      const temp = data;
      if (temp.id === likeId) {
        temp.likeIcon = !temp.likeIcon;
      }
      data.commentReplySection.map((like: any) => {
        const tempLike = like;
        if (tempLike.id === likeId) {
          tempLike.likeIcon = !tempLike.likeIcon;
        }
        return true;
      });
      return tempData;
    });
    setCommentData(tempData);
  };

  const handlePopover = (value: string, commentId: string) => {
    setCommentID(commentId);
    if (value !== 'Edit') {
      setShow(true);
      setDropDownValue(value);
    }
  };

  const handleReplyPopover = (value: string, commentId: string) => {
    setCommentReplyID(commentId);
    if (value !== 'Edit') {
      setShow(true);
      setDropDownValue(value);
    }
  };

  const handleFileChange = (postImage: React.ChangeEvent<HTMLInputElement>, id?: string) => {
    if (!postImage.target) {
      return;
    }
    if (postImage.target.name === ('post' || 'reply') && postImage.target && postImage.target.files) {
      const uploadedPostList = [...uploadPost];
      const imageArrayList = id ? [...replyImageArray] : [...imageArray];
      const fileList = postImage.target.files;
      for (let list = 0; list < fileList.length; list += 1) {
        if (uploadedPostList.length < 4) {
          const image = URL.createObjectURL(postImage.target.files[list]);
          uploadedPostList.push(image);
          imageArrayList.push(postImage.target.files[list]);
        }
      }
      setUploadPost(uploadedPostList);
      if (id) {
        setReplyImageArray(imageArrayList)
      } else {
        setImageArray(imageArrayList);
      }
    }
  };

  const handleRemoveFile = (postImage: File, id?: string) => {
    let images = id ? replyImageArray : imageArray;
    const removePostImage = images.filter((image: File) => image !== postImage);
    setImageArray(removePostImage);
  };

  return (
    <>
      <Form>
        <Row className="ps-3 pt-2 order-last order-sm-0">
          <Col xs="auto" className="pe-0">
            <UserCircleImage src={commentImage} className="me-3 bg-secondary" />
          </Col>
          <Col className="ps-0 pe-4">
            <div className="d-flex align-items-end mb-4">
              <StyledCommentInputGroup>
                <Form.Control
                  placeholder="Write a comment"
                  className="fs-5 border-end-0"
                  rows={1}
                  as="textarea"
                  ref={textRef}
                  value={message}
                  onChange={onChangeHandler}
                  onKeyDown={onKeyDownHandler}
                />
                <InputGroup.Text>
                  <FontAwesomeIcon role="button" onClick={() => inputFile.current?.click()} icon={solid('camera')} size="lg" />
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
      {commentData && commentData.length > 0
        && commentData.map((data: any, index: number) => (
          <Row className="ps-md-4 pt-md-1" key={data.id}>
            <Col>
              <Row className="mx-auto">
                <Col className="ps-md-0">
                  <CommentSection
                    id={data.id}
                    image={data.profilePic}
                    name={data.name}
                    time={data.time}
                    likes={data.likes}
                    likeIcon={data.likeIcon}
                    commentMsg={data.commentMsg}
                    commentImg={data.commentImg}
                    onIconClick={() => handleLikeIcon(data.id)}
                    popoverOptions={popoverOption}
                    onPopoverClick={handlePopover}
                    setIsReply={setIsReply}
                    setReplyId={setReplyId}
                  />
                  <div className="ms-5 ps-2">
                    <div className="ms-md-4">
                      {data.commentReplySection && data.commentReplySection.length > 0
                        && data.commentReplySection.map((comment: any) => (
                          <div key={comment.id}>
                            <CommentSection
                              id={comment.id}
                              image={comment.profilePic}
                              name={comment.name}
                              likes={comment.likes}
                              time={comment.time}
                              likeIcon={comment.likeIcon}
                              commentMsg={comment.commentMsg}
                              commentMention={comment.commentMention}
                              commentImg={comment.commentImg}
                              onIconClick={() => handleLikeIcon(comment.id)}
                              popoverOptions={popoverOption}
                              onPopoverClick={handleReplyPopover}
                              setIsReply={setIsReply}
                              setReplyId={setReplyId}
                              handleClick={handleClick}
                              feedCommentId={comment.feedCommentId}
                            />
                          </div>
                        ))}
                      {isReply && (replyId === data.id || replyId === data.commentReplySection[0]?.feedCommentId) && (
                        // <div className="d-flex">
                        //   <div className="">
                        //     <UserCircleImage size="2.5rem" src={commentImage} className="bg-secondary" />
                        //   </div>
                        //   <div className="w-100 ms-3">
                        //     <div ref={scroll} className="d-flex align-items-end mb-4">
                        //       <StyledCommentInputGroup>
                        //         <Form.Control
                        //           placeholder="Write a comment"
                        //           className="fs-5 border-end-0"
                        //           rows={1}
                        //           as="textarea"
                        //           ref={textRef}
                        //           value={replyMessage}
                        //           onChange={(e: any) => onChangeHandler(e, data.id)}
                        //           onKeyDown={(e: any) => onKeyDownHandler(e, data.id)}
                        //         />
                        //         <InputGroup.Text>
                        //           <FontAwesomeIcon role="button" onClick={() => inputFile.current?.click()} icon={solid('camera')} size="lg" />
                        //           <input
                        //             type="file"
                        //             name="post"
                        //             className="d-none"
                        //             accept="image/*"
                        //             onChange={(post) => {
                        //               handleFileChange(post, data.id);
                        //             }}
                        //             multiple
                        //             ref={inputFile}
                        //           />
                        //         </InputGroup.Text>
                        //       </StyledCommentInputGroup>
                        //       <Button onClick={() => sendComment(data.id)} variant="link" className="ms-2 p-0">
                        //         <FontAwesomeIcon icon={solid('paper-plane')} style={{ fontSize: '26px' }} className="text-primary" />
                        //       </Button>
                        //     </div>
                        //   </div>
                        // </div>
                        <Form>
                          <Row className="ps-3 pt-2 order-last order-sm-0">
                            <Col xs="auto" className="pe-0">
                              <UserCircleImage src={commentImage} className="me-3 bg-secondary" />
                            </Col>
                            <Col className="ps-0 pe-4">
                              <div className="d-flex align-items-end mb-4">
                                <StyledCommentInputGroup>
                                  <Form.Control
                                    placeholder="Write a comment"
                                    className="fs-5 border-end-0"
                                    rows={1}
                                    as="textarea"
                                    ref={textRef}
                                    value={replyMessage}
                                    onChange={(e: any) => onChangeHandler(e, data.id)}
                                    onKeyDown={(e: any) => onKeyDownHandler(e, data.id)}
                                  />
                                  <InputGroup.Text>
                                    <FontAwesomeIcon role="button" onClick={() => inputFile.current?.click()} icon={solid('camera')} size="lg" />
                                    <input
                                      type="file"
                                      name="reply"
                                      className="d-none"
                                      accept="image/*"
                                      onChange={(post) => {
                                        handleFileChange(post, data.id);
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
                      )}
                    </div>
                  </div>
                  {/* {isReply && replyId === data.id && (
                    <div className="d-flex">
                      <div className="">
                        <UserCircleImage size="2.5rem" src={commentImage} className="bg-secondary" />
                      </div>
                      <div className="w-100 ms-3">
                        <div className="d-flex align-items-end mb-4">
                          <StyledCommentInputGroup>
                            <Form.Control
                              placeholder="Write a comment"
                              className="fs-5 border-end-0"
                              rows={1}
                              as="textarea"
                              ref={textRef}
                              value={replyMessage}
                              onChange={(e: any) => onChangeHandler(e, data.id)}
                              onKeyDown={(e: any) => onKeyDownHandler(e, data.id)}
                            />
                            <InputGroup.Text>
                              <FontAwesomeIcon role="button" onClick={() => inputFile.current?.click()} icon={solid('camera')} size="lg" />
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
                          <Button onClick={() => sendComment(data.id)} variant="link" className="ms-2 p-0">
                            <FontAwesomeIcon icon={solid('paper-plane')} style={{ fontSize: '26px' }} className="text-primary" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )} */}
                </Col>
              </Row>
            </Col>
          </Row>
        ))}
      <ReportModal
        show={show}
        setShow={setShow}
        slectedDropdownValue={dropDownValue}
        setDeleteComment={setDeleteComment}
        setDeleteCommentReply={setDeleteCommentReply}
      />
    </>
  );
}
PostCommentSection.defaultProps = {
  commentReplySection: undefined,
  setfeedImageArray: () => [],
};
export default PostCommentSection;
