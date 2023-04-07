/* eslint-disable max-lines */
import React, {
  useEffect, useState, ChangeEvent, useCallback,
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
import ErrorMessageList from '../../ErrorMessageList';

interface CommentInputProps {
  userData: any;
  message: string;
  setIsReply?: (value: boolean) => void;
  inputFile: any;
  handleFileChange: (value: ChangeEvent<HTMLInputElement>, replyUserId?: string) => void;
  sendComment: (commentId: string, message: string) => void;
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
  commentError?: string[];
  commentReplyError?: string[];
  commentSent?: boolean;
  setCommentReplyErrorMessage?: (value: string[]) => void;
  setReplyImageArray?: (value: any) => void;
  isEdit?: boolean;
  updateState?: boolean;
}

interface InputProps {
  focus: boolean;
}

const StyledCommentInputGroup = styled(InputGroup) <InputProps>`
  .form-control {
    border-radius: 24px !important;
    border-bottom-right-radius: 0rem !important;
    border-top-right-radius: 0rem !important;
    outline: none !important;
  }
  .input-group-text {
    background-color: var(--bs-dark);
    border-color: #3a3b46;
    border-radius: 24px !important;
    border-bottom-left-radius: 0rem !important;
    border-top-left-radius: 0rem !important;
  }
  textarea {
    padding-left: 1.5rem !important;
  }
  svg {
    min-width: 1.875rem;
    &:focus {
      outline: none;
    }
  }
  .camera-btn {
    right: 0 !important;
  }
  ${(props) => props.focus && `
    box-shadow: 0 0 0 1px var(--stroke-and-line-separator-color);
    border-radius: 24px !important;
  `};

`;
function CommentInput({
  userData, message, setIsReply, inputFile,
  handleFileChange, sendComment, imageArray, handleRemoveFile, dataId,
  handleSearch, mentionList, addUpdateComment, replyImageArray, isReply,
  addUpdateReply, commentID, commentReplyID, checkCommnt, commentError, commentReplyError,
  commentSent, setCommentReplyErrorMessage, setReplyImageArray, isEdit,
  updateState,
}: CommentInputProps) {
  const [editMessage, setEditMessage] = useState<string>('');
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  const [isFocosInput, setIsFocusInput] = useState<boolean>(false);

  const handleSetCommentReplyErrorMessage = useCallback((error: any) => {
    setCommentReplyErrorMessage!(error);
  }, [setCommentReplyErrorMessage]);

  const handleSetReplyImageArray = useCallback((images: any) => {
    setReplyImageArray!(images);
  }, [setReplyImageArray]);

  useEffect(() => {
    if (message && message.length > 0) {
      const regexMessgafe = isReply && commentReplyID
        ? `##LINK_ID##${commentReplyID}${message}##LINK_END## `
        : `##LINK_ID##${commentID}${message}##LINK_END## `;
      setEditMessage(regexMessgafe);
    } else {
      setEditMessage('');
      handleSetCommentReplyErrorMessage([]);
      handleSetReplyImageArray([]);
    }
  }, [message, commentID, isReply, commentReplyID,
    handleSetCommentReplyErrorMessage, handleSetReplyImageArray]);
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

  useEffect(() => {
    if (commentError! && commentError.length) {
      setEditMessage((prevEditMessage) => prevEditMessage);
    } else if (message === '') {
      setEditMessage('');
    }
  }, [commentError, message]);

  useEffect(() => {
    if (commentReplyError! && commentReplyError.length) {
      setEditMessage((prevEditMessage) => prevEditMessage);
    } else if (message === '') {
      setEditMessage('');
    }
  }, [commentReplyError, message]);

  useEffect(() => {
    if (!commentSent && updateState) {
      sendComment(dataId!, editMessage);
    }
  }, [commentSent, updateState, dataId, editMessage, sendComment]);

  const onUpdatePost = (msg: string) => {
    const imageArr = isReply ? replyImageArray : imageArray;
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
      <Row className="pt-2 order-last order-sm-0">
        <Col xs="auto">
          <UserCircleImage src={userData.user.profilePic} tabIndex={0} alt="user picture" className="bg-secondary d-flex" />
        </Col>
        <Col className="ps-0">
          <div className="d-flex align-items-end mb-4">
            <StyledCommentInputGroup focus={isFocosInput} className="mx-1">
              <MessageTextarea
                rows={1}
                id={checkCommnt}
                className="fs-5 form-control p-0 pe-4"
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
              <InputGroup.Text className="position-relative px-3 border-start-0">
                <FontAwesomeIcon
                  role="button"
                  onClick={() => {
                    inputFile.current?.click();
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                    setIsReply!(false);
                  }}
                  icon={solid('camera')}
                  size="lg"
                  className="camera-btn position-absolute align-self-end me-3 mb-1"
                  style={{ right: 0 }}
                  tabIndex={0}
                  onKeyDown={(e: any) => {
                    if (e.key === 'Enter') {
                      inputFile.current?.click();
                      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                      setIsReply!(false);
                    }
                  }}
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
            <Button onClick={() => handleMessage()} variant="link" aria-label="submit" className="ms-2 mb-1 p-0">
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
              alt="" // TODO: set any existing alt text here (when editing existing image)
              // eslint-disable-next-line no-console
              onAltTextChange={(newValue) => { console.log(`TODO: Use this to set alt text.  New value is: ${newValue}`); }}
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
      {!isReply && !isEdit
        && (
          <ErrorMessageList
            errorMessages={commentError}
            divClass="mt-3 text-start"
            className="m-0"
          />
        )}
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
  commentError: undefined,
  commentReplyError: undefined,
  commentSent: undefined,
  setCommentReplyErrorMessage: undefined,
  setReplyImageArray: undefined,
  isEdit: undefined,
  updateState: false,
};

export default CommentInput;
