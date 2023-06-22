/* eslint-disable max-lines */
import React, {
  useEffect, useState, ChangeEvent, useCallback,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Alert,
  Button,
  Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import styled from 'styled-components';
import ImagesContainer from '../../ImagesContainer';
import {
  atMentionsGlobalRegex, decryptMessage, generateMentionReplacementMatchFunc,
} from '../../../../utils/text-utils';
import MessageTextarea from '../../MessageTextarea';
import ErrorMessageList from '../../ErrorMessageList';
import { FormatMentionProps } from '../../../../types';
import { maxWidthForCommentOrReplyInputOnMobile } from '../../../../constants';
import useWindowInnerWidth from '../../../../hooks/useWindowInnerWidth';
import { setGlobalCssProperty } from '../../../../utils/styles-utils ';

interface CommentInputProps {
  message: string;
  setIsReply?: (value: boolean) => void;
  inputFile: any;
  handleFileChange: (value: ChangeEvent<HTMLInputElement>, replyUserId?: string) => void;
  sendComment: (commentId: string, message: string) => void;
  imageArray: any;
  handleRemoveFile: (postImage: File, index?: number, replyUserId?: string) => void;
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
  descriptionArray?: string[];
  setDescriptionArray?: (value: string[]) => void;
  replyDescriptionArray?: string[];
  setReplyDescriptionArray?: (value: string[]) => void;
  isMainPostCommentClick?: boolean;
  selectedReplyUserId?:string;
  commentOrReplySuccessAlertMessage?: string;
  setCommentOrReplySuccessAlertMessage?: React.Dispatch<React.SetStateAction<string>>;
}

interface InputProps {
  focus: boolean;
}

const CommentForm = styled(Form)`
/* Make comment/reply input fixed on bottom of the screen on mobile and tabs */
  @media (max-width: ${maxWidthForCommentOrReplyInputOnMobile}px) {
    position: fixed;
    left: 0;
    width: 100%;
    background: black;
    bottom: 77px;
    z-index: 1;
    padding: 0px 10px;
  }
`;

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
  message, setIsReply, inputFile,
  handleFileChange, sendComment, imageArray, handleRemoveFile, dataId,
  handleSearch, mentionList, addUpdateComment, replyImageArray, isReply,
  addUpdateReply, commentID, commentReplyID, checkCommnt, commentError, commentReplyError,
  commentSent, setCommentReplyErrorMessage, setReplyImageArray, isEdit, descriptionArray,
  setDescriptionArray, replyDescriptionArray, setReplyDescriptionArray,
  isMainPostCommentClick, selectedReplyUserId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  commentOrReplySuccessAlertMessage, setCommentOrReplySuccessAlertMessage,
}: CommentInputProps) {
  const [editMessage, setEditMessage] = useState<string>('');
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  const [isFocosInput, setIsFocusInput] = useState<boolean>(false);
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const handleSetCommentReplyErrorMessage = useCallback((error: any) => {
    setCommentReplyErrorMessage!(error);
  }, [setCommentReplyErrorMessage]);

  const handleSetReplyImageArray = useCallback((images: any) => {
    setReplyImageArray!(images);
  }, [setReplyImageArray]);

  useEffect(() => {
    if (message && message.length > 0) {
      setEditMessage(`##LINK_ID##${selectedReplyUserId}${message}##LINK_END## `);
    } else {
      setEditMessage('');
      handleSetCommentReplyErrorMessage([]);
      handleSetReplyImageArray([]);
    }
  }, [message, commentID, isReply, commentReplyID,
    handleSetCommentReplyErrorMessage, handleSetReplyImageArray, selectedReplyUserId]);
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
    if (!commentSent) {
      sendComment(dataId!, editMessage);
    }
  }, [commentSent, dataId, editMessage, sendComment]);

  const windowInnerWidth = useWindowInnerWidth();

  // Note: We use `windowInnerWidth` as dependency to set css variable only when necessary
  useEffect(() => {
    const heightOfCommentOrReplyInputOnMobile = document.querySelector<HTMLElement>('#comment-or-reply-input')?.offsetHeight;
    setGlobalCssProperty('--heightOfCommentOrReplyInputOnMobile', `${heightOfCommentOrReplyInputOnMobile ?? 0}px`);
  }, [windowInnerWidth]);

  const onUpdatePost = (msg: string) => {
    const imageArr = isReply ? replyImageArray : imageArray;
    const descriptionArr = isReply ? replyDescriptionArray : descriptionArray;
    if (isReply) {
      addUpdateReply!({
        replyMessage: msg,
        commentId: dataId,
        imageArr,
        commentReplyID,
        descriptionArr,
      });
    } else {
      addUpdateComment!({
        commentMessage: msg,
        commentId: dataId,
        imageArr,
        descriptionArr,
      });
    }
  };

  const handleMessage = () => {
    const postContentWithMentionReplacements = (editMessage!.replace(
      atMentionsGlobalRegex,
      generateMentionReplacementMatchFunc(formatMention),
    ));
    onUpdatePost(postContentWithMentionReplacements);
    setShowPicker(false);
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

  const setAltTextValue = (index: number) => {
    if (descriptionArray?.length && !isReply) {
      const altText = descriptionArray![index];
      return altText;
    } if (replyDescriptionArray?.length && !isReply) {
      const altText = replyDescriptionArray![index];
      return altText;
    }
    return '';
  };

  const onChangeDescription = (newValue: string, index: number) => {
    const descriptionArrayList: string[] = isReply
      ? [...replyDescriptionArray!] : [...descriptionArray!];
    if (isReply) {
      descriptionArrayList![index] = newValue;
      setReplyDescriptionArray!([...descriptionArrayList]);
    } else if (!isReply) {
      descriptionArrayList![index] = newValue;
      setDescriptionArray!([...descriptionArrayList]);
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCloseCommentOrReplySuccessAlert = () => {
    setCommentOrReplySuccessAlertMessage?.('');
  };
  return (
    <CommentForm id="comment-or-reply-input">
      <Row className="pt-2 order-last order-sm-0 gx-0">
        <Col className="ps-0">
          <div className="d-flex align-items-end mb-2">
            <StyledCommentInputGroup focus={isFocosInput} className="mx-1">
              <div className="position-relative d-flex w-100">
                <MessageTextarea
                  rows={1}
                  id={checkCommnt}
                  className="fs-5 form-control pe-4"
                  placeholder={isReply ? 'Reply to comment' : 'Write a comment'}
                  isReply={isReply}
                  handleSearch={handleSearch}
                  mentionLists={mentionList}
                  setMessageContent={setEditMessage}
                  formatMentionList={formatMention}
                  setFormatMentionList={setFormatMention}
                  defaultValue={decryptMessage(editMessage)}
                  isCommentInput="true"
                  onFocusHandler={onFocusHandler}
                  onBlurHandler={onBlurHandler}
                  isMainPostCommentClick={isMainPostCommentClick}
                  showPicker={showPicker}
                  setShowPicker={setShowPicker}
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
                      /* eslint-disable no-param-reassign */
                      handleFileChange(post, dataId);
                      post.target.value = '';
                    }}
                    multiple
                    ref={inputFile}
                    aria-label="image"
                  />
                </InputGroup.Text>
              </div>
            </StyledCommentInputGroup>
            <Button onClick={() => handleMessage()} variant="link" aria-label="submit" className="ms-2 mb-1 p-0">
              <FontAwesomeIcon icon={solid('paper-plane')} style={{ fontSize: '26px' }} className="text-primary" />
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mx-5 px-3">
        {imageArray.map((post: File, index: number) => (
          <Col xs="auto" key={post.name} className="px-3 mb-1">
            <ImagesContainer
              mainContainerWidth="7.25"
              containerWidth="4.25rem"
              containerHeight="4.25rem"
              containerBorder="0.125rem solid #3A3B46"
              image={post}
              dataId={dataId}
              alt={setAltTextValue(index)}
              onAltTextChange={(newValue) => { onChangeDescription!(newValue, index); }}
              handleRemoveImage={handleRemoveFile}
              index={index}
              containerClass="mt-2 mb-3 m-auto position-relative d-flex justify-content-center align-items-center rounded border-0"
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
      {/* TEMPORARILY DISABLED, refer: https://slasher.atlassian.net/browse/SD-1301?focusedCommentId=15989 */}
      {/* This cooment/reply-to-comment success alert is only for mobile and tablets */}
      {/* {commentOrReplySuccessAlertMessage
        && (
        <Alert
          variant="success"
          className="d-flex d-lg-none align-items-center justify-content-between mb-1"
        >
          <div>
            {commentOrReplySuccessAlertMessage}
          </div>
          <Button
            onClick={handleCloseCommentOrReplySuccessAlert}
            className="bg-transparent border-0"
          >
            <FontAwesomeIcon className="d-block" icon={solid('close')} size="lg" />
          </Button>
        </Alert>
        )} */}
    </CommentForm>
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
  descriptionArray: undefined,
  setDescriptionArray: undefined,
  replyDescriptionArray: undefined,
  setReplyDescriptionArray: undefined,
  isMainPostCommentClick: undefined,
  selectedReplyUserId: undefined,
  commentOrReplySuccessAlertMessage: '',
  setCommentOrReplySuccessAlertMessage: undefined,
};

export default CommentInput;
