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
  setDeleteCommentID,
}: any) {
  const [commentData, setCommentData] = useState<any[]>(commentSectionData);
  const [show, setShow] = useState<boolean>(false);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const textRef = useRef<any>();
  const inputFile = useRef<HTMLInputElement>(null);
  const [uploadPost, setUploadPost] = useState<string[]>([]);
  const [imageArray, setImageArray] = useState<any>([]);
  const [message, setMessage] = useState<string>('');
  const [isReply, setIsReply] = useState<boolean>(false);
  const onChangeHandler = (e: SyntheticEvent) => {
    const target = e.target as HTMLTextAreaElement;
    setMessage(target.value);
    textRef.current.style.height = '36px';
    textRef.current.style.height = `${target.scrollHeight}px`;
    textRef.current.style.maxHeight = '100px';
  };

  useEffect(() => {
    const comments = commentSectionData.map((comment: any) => {
      const feedComment: any = {
        /* eslint no-underscore-dangle: 0 */
        id: comment._id,
        profilePic: comment.userId?.profilePic,
        name: comment.userId?.userName,
        time: comment.createdAt,
        likes: comment.likes.length,
        commentMsg: comment.message,
        commentImg: comment.images,
        commentReplySection: comment.replies,
      };
      return feedComment;
    });
    setCommentData(comments);
  }, [commentSectionData]);

  const onKeyDownHandler = (e: any) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      sendComment();
      textRef.current.style.height = '36px';
    }
  };

  const sendComment = () => {
    setCommentValue(message);
    setfeedImageArray(imageArray);
    setMessage('');
    setImageArray([]);
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
    setDeleteCommentID(commentId);
    if (value !== 'Edit') {
      setShow(true);
      setDropDownValue(value);
    }
  };

  const handleFileChange = (postImage: React.ChangeEvent<HTMLInputElement>) => {
    if (!postImage.target) {
      return;
    }
    if (postImage.target.name === 'post' && postImage.target && postImage.target.files) {
      const uploadedPostList = [...uploadPost];
      const imageArrayList = [...imageArray];
      const fileList = postImage.target.files;
      for (let list = 0; list < fileList.length; list += 1) {
        if (uploadedPostList.length < 4) {
          const image = URL.createObjectURL(postImage.target.files[list]);
          uploadedPostList.push(image);
          imageArrayList.push(postImage.target.files[list]);
        }
      }
      setUploadPost(uploadedPostList);
      setImageArray(imageArrayList);
    }
  };

  const handleRemoveFile = (postImage: File) => {
    const removePostImage = imageArray.filter((image: File) => image !== postImage);
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
              <Button onClick={sendComment} variant="link" className="ms-2 p-0">
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
      {commentData && commentData.length > 0 && commentData.map((data: any) => {
        console.log('data', data.commentImg);
        return (
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
                    isReply={isReply}
                  />
                  {isReply && (
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
                        <Button onClick={sendComment} variant="link" className="ms-2 p-0">
                          <FontAwesomeIcon icon={solid('paper-plane')} style={{ fontSize: '26px' }} className="text-primary" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  )}
                  {data.commentReplySection && data.commentReplySection.length > 0
                    && data.commentReplySection.map((comment: Values) => (
                      <div key={comment?.id} className="ms-5 ps-2">
                        <div className="ms-md-4">
                          <CommentSection
                            id={comment.id}
                            image={comment.image}
                            name={comment.name}
                            likes={comment.like}
                            time={comment.time}
                            likeIcon={comment.likeIcon}
                            commentMsg={comment.commentMsg}
                            commentMention={comment.commentMention}
                            commentImg={comment.commentImg}
                            onIconClick={() => handleLikeIcon(comment.id)}
                            popoverOptions={popoverOption}
                            onPopoverClick={handlePopover}
                          />
                        </div>
                      </div>
                    ))}
                </Col>
              </Row>
            </Col>
          </Row>
        );
      })}
      <ReportModal
        show={show}
        setShow={setShow}
        slectedDropdownValue={dropDownValue}
        setDeleteComment={setDeleteComment}
      />
    </>
  );
}
PostCommentSection.defaultProps = {
  commentReplySection: undefined,
  setfeedImageArray: () => [],
};
export default PostCommentSection;
