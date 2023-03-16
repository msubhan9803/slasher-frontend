/* eslint-disable max-lines */
import React, {
  useEffect, useState, ChangeEvent,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import UserCircleImage from '../../UserCircleImage';
import ImagesContainer from '../../ImagesContainer';
import { decryptMessage } from '../../../../utils/text-utils';
import MessageTextarea from '../../MessageTextarea';
import { FormatMentionProps } from '../../../../routes/posts/create-post/CreatePost';

interface CommentInputProps {
  userData: any;
  message: string;
  setIsReply?: (value: boolean) => void;
  inputFile: any;
  handleFileChange: (value: ChangeEvent<HTMLInputElement>, replyUserId?: string) => void;
  sendComment: (value: string) => void;
  imageArray: any;
  handleRemoveFile: (postImage: File, replyUserId?: string) => void;
  dataId?: string;
  handleSearch: (value: string) => void;
  mentionList: any;
  addUpdateComment?: (value: any) => void;
  replyImageArray?: any;
  isReply?: boolean;
  addUpdateReply?: (value: any) => void;
  commentID: string;
  commentReplyID?: string;
  checkCommnt?: string;
}

interface InputProps {
  focus: boolean;
}

const StyledCommentInputGroup = styled(InputGroup) <InputProps>`
  .form-control {
    border-radius: 1.875rem;
    border-bottom-right-radius: 0rem;
    border-top-right-radius: 0rem;
    outline: none !important;
  }
  .input-group-text {
    background-color: var(--bs-dark);
    border-color: #3a3b46;
    border-radius: 1.875rem;
  }
  svg {
    min-width: 1.875rem;
  }

  ${(props) => props.focus && `
    box-shadow: 0 0 0 1px var(--stroke-and-line-separator-color);
    border-radius: 1.875rem;
  `};

`;
function CommentInput({
  userData, message, setIsReply, inputFile,
  handleFileChange, sendComment, imageArray, handleRemoveFile, dataId,
  handleSearch, mentionList, addUpdateComment, replyImageArray, isReply,
  addUpdateReply, commentID, commentReplyID, checkCommnt,
}: CommentInputProps) {
  const [editMessage, setEditMessage] = useState<string>('');
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  const [isFocosInput, setIsFocusInput] = useState<boolean>(false);
  useEffect(() => {
    if (message) {
      const regexMessgafe = isReply && commentReplyID
        ? `##LINK_ID##${commentReplyID}${message}##LINK_END## `
        : `##LINK_ID##${commentID}${message}##LINK_END## `;
      setEditMessage(regexMessgafe);
    } else {
      setEditMessage('');
    }
  }, [message, commentID, isReply, commentReplyID]);

  useEffect(() => {
    if (editMessage) {
      const mentionStringList = editMessage.match(/##LINK_ID##[a-zA-Z0-9@_.-]+##LINK_END##/g);
      if (mentionStringList) {
        const finalFormatMentionList = Array.from(new Set(mentionStringList))
          .map((mentionString: string) => {
            const id = mentionString.match(/([a-f\d]{24})/g)![0];
            const value = mentionString.match(/(@[a-zA-Z0-9_.-]+)/g)![0].replace('@', '');
            return {
              id, value, format: mentionString,
            };
          });
        setFormatMention((prevMentions) => prevMentions.concat(finalFormatMentionList));
      }
    }
  }, [editMessage]);
  const onUpdatePost = (msg: string) => {
    const imageArr = isReply ? replyImageArray : imageArray;
    if (msg || imageArr.length) {
      if (isReply) {
        addUpdateReply!({
          replyMessage: msg,
          commentId: dataId,
          imageArr,
          commentReplyID,
        });
      } else {
        addUpdateComment!({
          commentMessage: msg,
          commentId: dataId,
          imageArr,
        });
      }
      sendComment(dataId! && dataId!);
      setEditMessage('');
    }
  };

  const mentionReplacementMatchFunc = (match: string) => {
    if (match) {
      const finalString: any = formatMention.find(
        (matchMention: FormatMentionProps) => match.includes(matchMention.value),
      );
      if (finalString) {
        return finalString.format;
      }
      return match;
    }
    return undefined;
  };
  const handleMessage = () => {
    const postContentWithMentionReplacements = (editMessage!.replace(/(?<!\S)@[a-zA-Z0-9_.-]+/g, mentionReplacementMatchFunc));
    onUpdatePost(postContentWithMentionReplacements);
  };

  const onFocusHandler = () => {
    setIsFocusInput(true);
    if (setIsReply) {
      setIsReply(false);
    }
  };

  const onBlurHandler = () => {
    setIsFocusInput(false);
  };

  return (
    <Form>
      <Row className="ps-3 pt-2 order-last order-sm-0">
        <Col xs="auto" className="pe-0">
          <UserCircleImage src={userData.user.profilePic} alt="user picture" className="me-3 bg-secondary" />
        </Col>
        <Col className="ps-0 pe-4">
          <div className="d-flex align-items-end mb-4">
            <StyledCommentInputGroup focus={isFocosInput}>
              <MessageTextarea
                rows={1}
                id={checkCommnt}
                className="fs-5 form-control p-0"
                placeholder={isReply ? 'Reply to comment' : 'Write a comment'}
                handleSearch={handleSearch}
                mentionLists={mentionList}
                setMessageContent={setEditMessage}
                formatMentionList={formatMention}
                setFormatMentionList={setFormatMention}
                defaultValue={decryptMessage(editMessage)}
                isCommentInput="true"
                onFocusHandler={onFocusHandler}
                onBlurHandler={onBlurHandler}
              />
              <InputGroup.Text>
                <FontAwesomeIcon
                  role="button"
                  onClick={() => {
                    inputFile.current?.click();
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    setIsReply!(false);
                  }}
                  icon={solid('camera')}
                  size="lg"
                />
                <input
                  type="file"
                  name={dataId ? 'reply' : 'post'}
                  className="d-none"
                  accept="image/*"
                  onChange={(post) => {
                    handleFileChange(post, dataId);
                    /* eslint-disable no-param-reassign */
                    post.target.value = '';
                  }}
                  multiple
                  ref={inputFile}
                  aria-label="image"
                />
              </InputGroup.Text>
            </StyledCommentInputGroup>
            <Button onClick={handleMessage} variant="link" aria-label="submit" className="ms-2 p-0">
              <FontAwesomeIcon icon={solid('paper-plane')} style={{ fontSize: '26px' }} className="text-primary" />
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mx-5 px-3">
        {imageArray.map((post: File) => (
          <Col xs="auto" key={post.name} className="px-3 mb-1">
            <ImagesContainer
              containerWidth="4.25rem"
              containerHeight="4.25rem"
              containerBorder="0.125rem solid #3A3B46"
              image={post}
              dataId={dataId}
              alt="Post comment image"
              handleRemoveImage={handleRemoveFile}
              containerClass="mt-2 mb-3 position-relative d-flex justify-content-center align-items-center rounded border-0"
              removeIconStyle={{
                padding: '0.313rem 0.438rem',
                top: '-0.5rem',
                left: '3.5rem',
              }}
            />
          </Col>
        ))}
      </Row>
    </Form>
  );
}

CommentInput.defaultProps = {
  dataId: '',
  replyImageArray: null,
  isReply: false,
  addUpdateReply: undefined,
  commentReplyID: '',
  addUpdateComment: undefined,
  setIsReply: undefined,
  checkCommnt: '',
};

export default CommentInput;
