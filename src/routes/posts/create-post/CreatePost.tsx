/* eslint-disable max-lines */
import React, { useState } from 'react';
import {
  Alert, Form,
} from 'react-bootstrap';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import UserCircleImage from '../../../components/ui/UserCircleImage';
import { createPost } from '../../../api/feed-posts';
import { useAppSelector } from '../../../redux/hooks';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import CreatePostComponent from '../../../components/ui/CreatePostComponent';
import { PostType } from '../../../types';

export interface MentionProps {
  id: string;
  userName: string;
  profilePic: string;
}
export interface FormatMentionProps {
  id: string;
  value: string;
  format: string;
}

function CreatePost() {
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [imageArray, setImageArray] = useState<any>([]);
  const [postContent, setPostContent] = useState<string>('');
  const [formatMention, setFormatMention] = useState<FormatMentionProps[]>([]);
  const loggedInUser = useAppSelector((state) => state.user.user);
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const location = useLocation();
  const paramsType = searchParams.get('type');
  const paramsGroupId = searchParams.get('groupId');
  const [titleContent, setTitleContent] = useState<string>('');
  const [containSpoiler, setContainSpoiler] = useState<boolean>(false);
  const [selectedPostType, setSelectedPostType] = useState<string>('');
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

  const addPost = () => {
    /* eslint no-useless-escape: 0 */
    const postContentWithMentionReplacements = (postContent.replace(/(?<!\S)@[a-zA-Z0-9_.-]+/g, mentionReplacementMatchFunc));
    if (paramsType === 'group-post') {
      const groupPostData = {
        title: titleContent,
        message: postContentWithMentionReplacements,
        images: imageArray,
        type: selectedPostType,
        spoiler: containSpoiler,
        groupId: paramsGroupId,
      };
      return groupPostData;
    }
    const createPostData = {
      message: postContentWithMentionReplacements,
      postType: PostType.User,
    };
    return createPost(createPostData, imageArray)
      .then(() => {
        setErrorMessage([]);
        navigate(location.state);
      })
      .catch((error) => {
        const msg = error.response.status === 0 && !error.response.data
          ? 'Combined size of files is too large.'
          : error.response.data.message;
        setErrorMessage(msg);
      });
  };
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        {(paramsType === 'group-post' && !paramsGroupId) && <Alert variant="danger">Group id missing from URL</Alert>}
        <Form className="bg-dark px-4 py-4 rounded-2">
          <Form.Group controlId="about-me">
            <div className="align-items-center d-flex form-label mb-4 w-100 mb-4">
              <UserCircleImage src={loggedInUser.profilePic} alt="user picture" className="me-3" />
              <h2 className="h3 mb-0 align-self-center">
                {loggedInUser.userName}
              </h2>
            </div>
          </Form.Group>
          <CreatePostComponent
            setPostMessageContent={setPostContent}
            errorMessage={errorMessage}
            createUpdatePost={addPost}
            imageArray={imageArray}
            setImageArray={setImageArray}
            defaultValue={postContent}
            formatMention={formatMention}
            setFormatMention={setFormatMention}
            titleContent={titleContent}
            setTitleContent={setTitleContent}
            containSpoiler={containSpoiler}
            setContainSpoiler={setContainSpoiler}
            selectedPostType={selectedPostType}
            setSelectedPostType={setSelectedPostType}
            placeHolder="Create a post"
          />
        </Form>
      </ContentPageWrapper>
      <RightSidebarWrapper>
        <RightSidebarSelf />
      </RightSidebarWrapper>
    </ContentSidbarWrapper>
  );
}
export default CreatePost;
