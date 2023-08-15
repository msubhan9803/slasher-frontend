/* eslint-disable max-lines */
import React, { useState } from 'react';
import {
  Alert, Button, Form,
} from 'react-bootstrap';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import UserCircleImage from '../../../components/ui/UserCircleImage';
import { createPost } from '../../../api/feed-posts';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { ContentPageWrapper, ContentSidbarWrapper } from '../../../components/layout/main-site-wrapper/authenticated/ContentWrapper';
import RightSidebarWrapper from '../../../components/layout/main-site-wrapper/authenticated/RightSidebarWrapper';
import RightSidebarSelf from '../../../components/layout/right-sidebar-wrapper/right-sidebar-nav/RightSidebarSelf';
import CreatePostComponent from '../../../components/ui/CreatePostComponent';
import { ContentDescription, FormatMentionProps, PostType } from '../../../types';
import useProgressButton from '../../../components/ui/ProgressButton';
import { sleep } from '../../../utils/timer-utils';
import { atMentionsGlobalRegex, generateMentionReplacementMatchFunc } from '../../../utils/text-utils';
import { setProfilePageUserDetailsReload } from '../../../redux/slices/userSlice';
import { deletePageStateCache } from '../../../pageStateCache';

export interface MentionProps {
  id: string;
  userName: string;
  profilePic: string;
}

function CreatePost() {
  const [errorMessage, setErrorMessage] = useState<string[]>();
  const [imageArray, setImageArray] = useState<any>([]);
  const [descriptionArray, setDescriptionArray] = useState<ContentDescription[]>([]);
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
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const paramsMovieId = searchParams.get('movieId');
  const dispatch = useAppDispatch();

  const addPost = async () => {
    /* eslint no-useless-escape: 0 */
    setProgressButtonStatus('loading');
    const postContentWithMentionReplacements = (postContent.replace(
      atMentionsGlobalRegex,
      generateMentionReplacementMatchFunc(formatMention),
    ));
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
    const createPostData: any = {
      message: postContentWithMentionReplacements,
      postType: PostType.User,
      movieId: paramsMovieId,
    };
    return createPost(createPostData, imageArray, descriptionArray!)
      .then(async () => {
        setProgressButtonStatus('success');
        await sleep(1000);
        setErrorMessage([]);
        deletePageStateCache(location.state);
        navigate(location.state);
        // Delay fetching of `profilePageUserDetails` by 1.5 seconds as the component takes
        // to mount itself.
        setTimeout(() => {
          dispatch(setProfilePageUserDetailsReload(true));
        }, 1_500);
      })
      .catch((error) => {
        setProgressButtonStatus('failure');
        const msg = error.response.status === 0 && !error.response.data
          ? 'Combined size of files is too large.'
          : error.response.data.message;
        setErrorMessage(msg);
      });
  };
  const onCloseButton = () => {
    navigate(location.state);
  };
  return (
    <ContentSidbarWrapper>
      <ContentPageWrapper>
        {(paramsType === 'group-post' && !paramsGroupId) && <Alert variant="danger">Group id missing from URL</Alert>}
        <Form className="bg-dark px-4 py-4 rounded-2 position-relative">
          <Form.Group controlId="about-me" className="d-flex justify-content-between">
            <div className="align-items-center d-flex form-label mb-4 w-100 mb-4">
              <UserCircleImage src={loggedInUser.profilePic} alt="user picture" className="me-3" />
              <h2 className="h3 mb-0 align-self-center">
                {loggedInUser.userName}
              </h2>
            </div>
            <Button
              variant="link"
              className="align-self-start py-0 px-0"
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  onCloseButton();
                }
              }}
              onClick={onCloseButton}
            >
              <FontAwesomeIcon
                icon={solid('xmark')}
                size="lg"
                style={{ cursor: 'pointer' }}
                aria-label="Close button"
              />
            </Button>
          </Form.Group>
          <CreatePostComponent
            setPostMessageContent={setPostContent}
            errorMessage={errorMessage}
            createUpdatePost={addPost as any}
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
            MaxImageUserInfo="Up to 10"
            descriptionArray={descriptionArray}
            setDescriptionArray={setDescriptionArray}
            ProgressButton={ProgressButton}
            createEditPost
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
