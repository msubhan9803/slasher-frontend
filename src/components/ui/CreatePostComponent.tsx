/* eslint-disable max-lines */
import React, {
  ChangeEvent, useEffect, useRef, useState,
} from 'react';
import { regular, solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Row, Col, Button, Form, Image,
} from 'react-bootstrap';
import styled from 'styled-components';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import { getSuggestUserName } from '../../api/users';
import ErrorMessageList from './ErrorMessageList';
import ImagesContainer from './ImagesContainer';
import MessageTextarea from './MessageTextarea';
import RoundButton from './RoundButton';
import CharactersCounter from './CharactersCounter';
import RatingButtonGroups from './RatingButtonGroups';
import CustomWortItText from './CustomWortItText';
import { StyledBorder } from './StyledBorder';
import WorthWatchIcon from '../../routes/movies/components/WorthWatchIcon';
import { AdditionalMovieData, MovieData, WorthWatchingStatus } from '../../types';
import { getMoviesById, getMoviesDataById } from '../../api/movies';
import { StyledMoviePoster } from '../../routes/movies/movie-details/StyledUtils';
import { LG_MEDIA_BREAKPOINT, topToDivHeight } from '../../constants';

interface MentionProps {
  id: string;
  userName: string;
  profilePic: string;
}
interface FormatMentionProps {
  id: string;
  value: string;
  format: string;
}
interface Props {
  movieData?: MovieData;
  errorMessage?: string[] | undefined;
  createUpdatePost?: () => void;
  setPostMessageContent: (val: string) => void;
  imageArray?: any;
  setImageArray?: any;
  defaultValue?: string;
  formatMention: FormatMentionProps[];
  setFormatMention: (val: any) => void;
  deleteImageIds?: any;
  setDeleteImageIds?: any;
  postType?: string;
  titleContent?: string;
  setTitleContent?: (value: string) => void;
  containSpoiler?: boolean;
  setContainSpoiler?: (value: boolean) => void;
  rating?: number;
  setRating?: (value: number) => void;
  goreFactor?: number;
  setGoreFactor?: (value: number) => void;
  selectedPostType?: string;
  setSelectedPostType?: (value: string) => void;
  setWorthIt?: (val: number) => void;
  liked?: boolean;
  setLike?: (val: boolean) => void;
  disLiked?: boolean;
  setDisLike?: (val: boolean) => void;
  isWorthIt?: number;
  placeHolder?: string;
  showSaveButton?: boolean;
  reviewForm?: boolean;
  setReviewForm?: (value: boolean) => void;
  setShowReviewForm?: (value: boolean) => void;
}

const AddPhotosButton = styled(RoundButton)`
  background-color: #1F1F1F !important;
`;
const groupPostType: string[] = [
  'Review', 'Discussion', 'Help', 'Recommended', 'Opinions wanted', 'Hidden gem',
  'News', 'Event', 'Cosplay', 'My work', 'Collaboration', 'For sale', 'Want to buy',
];
const PostTypeButton = styled(Button)`
  border : 0.125rem solid #383838
`;

function CreatePostComponent({
  movieData, errorMessage, createUpdatePost, setPostMessageContent,
  imageArray, setImageArray, defaultValue, formatMention, setFormatMention,
  deleteImageIds, setDeleteImageIds, postType, titleContent, setTitleContent,
  containSpoiler, setContainSpoiler, rating, setRating, goreFactor, setGoreFactor,
  selectedPostType, setSelectedPostType, setWorthIt, liked, setLike,
  disLiked, setDisLike, isWorthIt, placeHolder, showSaveButton,
  reviewForm, setReviewForm, setShowReviewForm,
}: Props) {
  const inputFile = useRef<HTMLInputElement>(null);
  const [mentionList, setMentionList] = useState<MentionProps[]>([]);
  const [uploadPost, setUploadPost] = useState<string[]>([]);
  const [searchParams] = useSearchParams();
  const paramsType = searchParams.get('type');
  const params = useParams();
  const location = useLocation();
  const movieReviewRef = useRef<HTMLDivElement>(null);
  const movieId = searchParams.get('movieId');
  const [aboutMovieDetail, setAboutMovieDetail] = useState<AdditionalMovieData>();

  useEffect(() => {
    if (!movieId) { return; }

    getMoviesById(movieId)
      .then((res1) => getMoviesDataById(res1.data.movieDBId)
        .then((res2) => setAboutMovieDetail(res2.data)));
  }, [movieId]);

  const onMovieReviweCloseButton = () => {
    setShowReviewForm!(false);
  };
  const handleRemoveFile = (postImage: any) => {
    const removePostImage = imageArray.filter((image: File) => image !== postImage);
    setDeleteImageIds([...deleteImageIds, postImage._id].filter(Boolean));
    setImageArray(removePostImage);
  };

  const handleFileChange = (postImage: ChangeEvent<HTMLInputElement>) => {
    if (!postImage.target) {
      return;
    }
    if (postImage.target.name === 'post' && postImage.target && postImage.target.files) {
      const uploadedPostList = [...uploadPost] as any;
      const imageArrayList = [...imageArray];
      const fileList = postImage.target.files;
      for (let list = 0; list < fileList.length; list += 1) {
        if (uploadedPostList.length < 10) {
          const image = postImage.target.files[list];
          uploadedPostList.push(image);
          imageArrayList.push(postImage.target.files[list]);
        }
      }
      setUploadPost(uploadedPostList);
      setImageArray(imageArrayList);
    }
  };

  const handleSearch = (text: string) => {
    setMentionList([]);
    if (text) {
      getSuggestUserName(text)
        .then((res) => setMentionList(res.data));
    }
  };

  let actionText;
  if (postType === 'review') {
    actionText = 'Submit';
  } else if (showSaveButton) {
    actionText = 'Save';
  } else {
    actionText = 'Post';
  }

  useEffect(() => {
    setTimeout(() => {
      if (reviewForm || params['*'] === 'reviews' || (location.state && location.state.movieId && location.state.movieId.length)) {
        if (movieReviewRef.current) {
          window.scrollTo({
            top: movieReviewRef.current.offsetTop - (
              window.innerWidth >= parseInt(LG_MEDIA_BREAKPOINT.replace('px', ''), 10)
                ? topToDivHeight - 5
                : 10
            ),
            behavior: 'instant' as any,
          });
        }
        setReviewForm!(false);
      }
    }, 500);
  }, [reviewForm, params, location, setReviewForm]);

  return (

    <div ref={movieReviewRef} className={postType === 'review' ? 'bg-dark mb-3 px-4 pb-4 rounded-2' : ''}>
      {aboutMovieDetail
        && (
          <Row className="m-0">
            <Col className="p-0" xs={4} md={3} lg={3} xl={2}>
              <StyledMoviePoster>
                <Image src={aboutMovieDetail?.mainData?.poster_path} alt="movie poster" className="rounded-3 w-100 h-100" />
              </StyledMoviePoster>
            </Col>
            <Col className="m-auto ps-3">
              <div className="fw-bold mb-3">
                {aboutMovieDetail?.mainData.title}
              </div>
              <div className="text-light mb-3">
                {aboutMovieDetail?.mainData?.release_date
                  && DateTime.fromJSDate(new Date(aboutMovieDetail?.mainData?.release_date)).toFormat('yyyy')}
              </div>
            </Col>
          </Row>
        )}

      {postType === 'review' && (
        <>
          <div className="d-flex justify-content-between">
            <div className="d-block d-md-flex d-lg-block d-xl-flex align-items-center mb-4 pt-4">
              <div>
                <RatingButtonGroups
                  rating={rating}
                  setRating={setRating}
                  label="Your rating"
                  size="lg"
                />
              </div>
              <div className="mx-md-4 mx-lg-0 mx-xl-4 my-3 my-md-0 my-lg-3 my-xl-0">
                <RatingButtonGroups
                  rating={goreFactor}
                  setRating={setGoreFactor}
                  label="Gore factor"
                  size="lg"
                  isGoreFator
                />
              </div>
              <div>
                <Form.Label className="fw-bold h3">Worth watching?</Form.Label>
                <div className="d-flex align-items-center">
                  <WorthWatchIcon
                    movieData={movieData}
                    setWorthIt={setWorthIt}
                    liked={liked!}
                    setLike={setLike!}
                    disLiked={disLiked!}
                    setDisLike={setDisLike!}
                    postType={postType}
                    circleWidth="2.534rem"
                    circleHeight="2.534rem"
                    iconWidth="1.352rem"
                    iconHeight="1.352rem"
                    isWorthIt={isWorthIt}
                    clickType="form"
                  />
                  {isWorthIt !== WorthWatchingStatus.NoRating
                    && (
                      <CustomWortItText
                        divClass="mt-2 align-items-center px-3 bg-black rounded-pill py-2"
                        textClass="fs-4"
                        customCircleWidth="20px"
                        customCircleHeight="20px"
                        customIconWidth="10.67px"
                        customIconHeight="10.67px"
                        worthIt={isWorthIt}
                      />
                    )}
                </div>
              </div>
            </div>
            <div className="my-3">
              <FontAwesomeIcon icon={solid('xmark')} size="lg" className="mb-1" onClick={onMovieReviweCloseButton} style={{ cursor: 'pointer' }} />
            </div>
          </div>
          <h1 className="h3 mb-3">Write your review</h1>
        </>
      )}
      {(paramsType === 'group-post') && (
        <div className="position-relative">
          <Form.Control
            maxLength={150}
            type="text"
            value={titleContent}
            onChange={(e) => {
              setTitleContent!(e.target.value);
            }}
            placeholder="Title"
            className="bg-black"
            aria-label="Title"
            style={{ paddingRight: '150px' }}
          />
          <CharactersCounter
            counterClass="float-end fs-4 position-absolute"
            charCount={titleContent!.length}
            totalChar={150}
            right="10px"
          />
        </div>
      )}
      <div className="mt-3">
        <MessageTextarea
          rows={10}
          placeholder={placeHolder}
          handleSearch={handleSearch}
          mentionLists={mentionList}
          setMessageContent={setPostMessageContent}
          formatMentionList={formatMention}
          setFormatMentionList={setFormatMention}
          defaultValue={defaultValue}
        />
      </div>
      {paramsType === 'group-post' && (
        <>
          <div className="my-4">
            <h2 className="h3 fw-bold">
              Post type&nbsp;
              <span className="text-light fw-normal">
                (Optional)
              </span>
            </h2>
            {groupPostType.map((type: string) => (
              <PostTypeButton
                key={`${type}-1`}
                as="input"
                type="button"
                value={type}
                className={`${type === selectedPostType ? 'bg-primary text-black' : 'bg-secondary text-white'} rounded-pill px-3 m-1`}
                onClick={() => setSelectedPostType!(type)}
              />
            ))}
          </div>
          <StyledBorder />
        </>
      )}
      {(postType === 'review' || paramsType === 'group-post') && (
        <>
          <div className={paramsType === 'group-post' ? 'my-4' : 'mt-4'}>
            <h2 className="h3 fw-bold">Contains spoilers</h2>
            <label htmlFor="spoiler" className="d-flex text-light">
              <input
                id="spoiler"
                type="checkbox"
                checked={containSpoiler}
                onChange={() => setContainSpoiler!(!containSpoiler)}
                className="me-2"
              />
              Check this box if this post contains any spoilers.
            </label>
          </div>
          {paramsType === 'group-post' && <StyledBorder />}
        </>
      )}
      <input
        type="file"
        name="post"
        className="d-none"
        // eslint-disable-next-line no-useless-concat
        accept={'image/' + '*'}
        onChange={(post) => {
          handleFileChange(post);
        }}
        multiple
        ref={inputFile}
        aria-label="image"
      />
      <Row>
        <Col xs={12} className="order-1 order-md-0">
          <Row>
            {imageArray && imageArray.map((post: File) => (
              <Col xs="auto" key={post.name} className="mb-1">
                <ImagesContainer
                  containerWidth="7.25rem"
                  containerHeight="7.25rem"
                  containerBorder="0.125rem solid #3A3B46"
                  image={post}
                  alt="" // TODO: set any existing alt text here (when editing existing image)
                  // eslint-disable-next-line no-console
                  // onAltTextChange={(newValue) => { console.log(`New value is: ${newValue}`); }}
                  handleRemoveImage={handleRemoveFile}
                  containerClass="mt-4 position-relative d-flex justify-content-center align-items-center rounded border-0"
                  removeIconStyle={{
                    padding: '0.313rem 0.438rem',
                    top: '6.313rem',
                    left: '6.313rem',
                  }}
                />
              </Col>
            ))}
          </Row>
        </Col>
        <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
        {postType !== 'review'
          && (
            <Col md="auto" className="mb-3 mb-md-0 order-0 order-md-1 me-auto">
              <AddPhotosButton size="md" disabled={uploadPost && uploadPost.length >= 10} className="mt-4 border-0 btn btn-form w-100 rounded-5" onClick={() => inputFile.current?.click()}>
                <FontAwesomeIcon icon={regular('image')} className="me-2" />
                <span className="h3">Add photos</span>
              </AddPhotosButton>
            </Col>
          )}
        <Col md="auto" className={postType === 'review' ? '' : 'order-2 ms-auto'}>
          <RoundButton className="px-4 mt-4 w-100" size="md" onClick={createUpdatePost}>
            <span className="h3">{actionText}</span>
          </RoundButton>
        </Col>
      </Row>
    </div>
  );
}
CreatePostComponent.defaultProps = {
  movieData: undefined,
  defaultValue: '',
  deleteImageIds: [],
  setDeleteImageIds: () => { },
  createUpdatePost: undefined,
  imageArray: null,
  setImageArray: undefined,
  errorMessage: undefined,
  postType: '',
  titleContent: '',
  setTitleContent: undefined,
  containSpoiler: false,
  setContainSpoiler: undefined,
  rating: 0,
  setRating: undefined,
  goreFactor: 0,
  setGoreFactor: undefined,
  selectedPostType: '',
  setSelectedPostType: undefined,
  setWorthIt: () => { },
  liked: false,
  setLike: () => { },
  disLiked: false,
  setDisLike: () => { },
  isWorthIt: 0,
  placeHolder: 'Write a something...',
  showSaveButton: false,
  reviewForm: false,
  setReviewForm: undefined,
  setShowReviewForm: false,
};
export default CreatePostComponent;
