/* eslint-disable max-lines */
import React, { useEffect, useRef, useState } from 'react';
import {
  Row, Image, Col,
} from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  Navigate,
  Route, Routes, useNavigate, useParams, useSearchParams,
} from 'react-router-dom';
import Switch from '../../../components/ui/Switch';
import AboutDetails from './AboutDetails';
import TabLinks from '../../../components/ui/Tabs/TabLinks';
import MovieOverview from './MovieOverview';
import MovieCasts from './MovieCasts';
import MovieTrailers from './MovieTrailers';
import MovieEdit from '../movie-edit/MovieEdit';
import MoviePosts from '../movie-posts/MoviePosts';
import { AdditionalMovieData, MovieData, MovieType } from '../../../types';
import RoundButton from '../../../components/ui/RoundButton';
import BorderButton from '../../../components/ui/BorderButton';
import CustomGroupIcons from '../../../components/ui/CustomGroupIcons';
import { StyledBorder } from '../../../components/ui/StyledBorder';
import MovieReviews from '../movie-reviews/MovieReviews';
import { addMovieUserStatus, deleteMovieUserStatus, getMoviesIdList } from '../../../api/movies';
import MovieReviewDetails from '../movie-reviews/MovieReviewDetails';
import { StyledMoviePoster } from './StyledUtils';
import { enableDevFeatures } from '../../../env';
import { generateAmazonAffiliateLinkForMovie } from '../../../utils/text-utils';
import TpdAd from '../../../components/ui/TpdAd';
import { tpdAdSlotIdZ } from '../../../utils/tpd-ad-slot-ids';
import getYouTubeEmbedId from '../../../utils/youtube-embed-id-utils';
import BusinessListingPosts from '../../../components/ui/BusinessListing/BusinessListingPosts';

interface MovieIconProps {
  label: string;
  key: string;
  icon: IconDefinition;
  iconColor: string;
  margin?: string;
  width: string;
  height: string;
  addMovie: boolean;
}
interface AboutMovieData {
  aboutMovieData: AdditionalMovieData
  movieData: MovieData
  setMovieData: React.Dispatch<React.SetStateAction<MovieData | undefined>>
}
const MovieIconList = [
  {
    label: 'Favorite', key: 'favorite', icon: solid('heart'), iconColor: '#8F00FF', width: '1.354rem', height: '1.185rem', addMovie: false,
  },
  {
    label: 'Watched', key: 'watched', icon: solid('check'), iconColor: '#32D74B', width: '1.354rem', height: '0.968rem', addMovie: false,
  },
  {
    label: 'Watch list', key: 'watch', icon: solid('list-check'), iconColor: '#FF8A00', width: '1.404rem', height: '1.185rem', addMovie: false,
  },
  {
    label: 'Buy', key: 'buy', icon: solid('bag-shopping'), iconColor: '#FF1800', width: '1.029rem', height: '1.185rem', addMovie: false,
  },
];

type OptionType = { value: string, label: string, devOnly?: boolean };

const tabsForAllViews: OptionType[] = [
  { value: 'details', label: 'Details' },
  {
    value: 'posts', label: 'Posts', devOnly: true,
  },
  { value: 'reviews', label: 'Reviews' },
];
const tabsForBusinessListings: OptionType[] = [
  { value: 'details', label: 'Details' },
  { value: 'posts', label: 'Posts' },
  { value: 'reviews', label: 'Reviews' },
];
const tabsForSelf: OptionType[] = [
  ...tabsForAllViews,
  { value: 'edit', label: 'Edit' },
];
const tabsForViewer = tabsForAllViews;

const filterEnableDevFeatures = (t: OptionType) => (enableDevFeatures ? true : (!t.devOnly));

function AboutMovie({ aboutMovieData, movieData, setMovieData }: AboutMovieData) {
  const [searchParams] = useSearchParams();
  const [movieIdList, setMovieIdList] = useState();
  const [isReviewDetail, setReviewDetail] = useState<boolean>(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const selfView = searchParams.get('view') === 'self';
  const tabs = (selfView ? tabsForSelf : tabsForViewer).filter(filterEnableDevFeatures);
  const navigate = useNavigate();
  const params = useParams();
  const [reviewForm, setReviewForm] = useState(false);
  const movieReviewRef = useRef<HTMLDivElement>(null);
  const reviewButtonRef = useRef<HTMLDivElement>(null);
  const reviewSmallButtonRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (params['*'] === 'edit' && !selfView) { navigate(`/app/movies/${params.id}/details`); }
  });

  useEffect(() => {
    if (params && params['*']!.startsWith('reviews/') && isReviewDetail && movieReviewRef?.current) {
      document.documentElement.style.scrollBehavior = 'auto';
      movieReviewRef?.current?.scrollIntoView({
        behavior: 'instant' as any,
        block: 'start',
        inline: 'nearest',
      });

      const showContent = () => {
        document.documentElement.style.scrollBehavior = 'smooth';
        document.body.classList.remove('no-scroll');
      };
      setTimeout(showContent, 10);
    }
  }, [isReviewDetail, params]);

  // TODO: Can this be removed, now that the comment button no longer links to the comment input?
  useEffect(() => {
    if (params && params['*']!.startsWith('reviews/')) {
      setReviewDetail(true);
    } else {
      setReviewDetail(false);
    }
  }, [params]);

  const [bgColor, setBgColor] = useState<boolean>(false);
  const [movieIconListData, setMovieIconListData] = useState(MovieIconList);
  const handleMovieAddRemove = (labelName: string, isFavorite: boolean) => {
    if (params.id && !isFavorite) {
      addMovieUserStatus(params.id, labelName)
        .then((res) => {
          if (res.data.success) {
            const tempMovieIconList = [...movieIconListData];
            tempMovieIconList.forEach((movieIcon) => {
              if (movieIcon.key === labelName) {
                // eslint-disable-next-line no-param-reassign
                movieIcon.addMovie = !movieIcon.addMovie;
              }
            });
            setMovieIconListData(tempMovieIconList);
          }
        });
    } else if (params.id && isFavorite) {
      deleteMovieUserStatus(params.id, labelName)
        .then((res) => {
          if (res.data.success) {
            const tempMovieIconList = [...movieIconListData];
            tempMovieIconList.forEach((movieIcon) => {
              if (movieIcon.key === labelName) {
                // eslint-disable-next-line no-param-reassign
                movieIcon.addMovie = !movieIcon.addMovie;
              }
            });
            setMovieIconListData(tempMovieIconList);
          }
        });
    }
  };
  useEffect(() => {
    if (params) {
      getMoviesIdList(params.id)
        .then((res) => setMovieIdList(res.data));
    }
  }, [params]);

  useEffect(() => {
    const updateMovieIconList = () => {
      if (movieIdList) {
        const updatedMovieIconList = MovieIconList.map((movieIcon) => {
          const { key } = movieIcon;
          if (key in movieIdList) {
            // eslint-disable-next-line no-param-reassign
            movieIcon.addMovie = !!movieIdList[key];
          }
          return movieIcon;
        });
        setMovieIconListData(updatedMovieIconList);
      }
    };
    updateMovieIconList();
  }, [movieIdList]);

  // eslint-disable-next-line max-len
  // This function probably (?) focusses the "Write a review" form when user press the respective button for it
  // TODO: Confirm with Avadh if the below code still needed? (in my testing experience it isn't).
  const handleScroll = () => {
    // setTimeout(() => {
    //   if (reviewButtonRef.current) {
    //     reviewButtonRef.current.scrollIntoView({
    //       behavior: 'instant' as any,
    //       inline: 'nearest',
    //       block: 'center',
    //     });
    //   }
    //   if (reviewSmallButtonRef.current) {
    //     reviewSmallButtonRef.current.scrollIntoView({
    //       behavior: 'instant' as any,
    //       inline: 'nearest',
    //       block: 'center',
    //     });
    //   }
    // }, 0);
  };
  const to = aboutMovieData?.mainData?.watchUrl
    ? aboutMovieData?.mainData?.watchUrl
    : generateAmazonAffiliateLinkForMovie(aboutMovieData?.mainData?.title);

  return (
    <div>
      <div className="bg-dark my-3 p-4 pb-0 rounded-2">
        <Row className="justify-content-center">
          <Col xs={10} sm={7} lg={8} xl={5} className="text-center">
            <div>
              <StyledMoviePoster className="mx-4">
                <Image src={aboutMovieData?.mainData?.poster_path} alt="movie poster" className="rounded-3 w-100 h-100" />
              </StyledMoviePoster>
              <div className="d-none d-xl-block mt-3">
                <p className="fs-5">Your lists</p>
                <div className="mt-2 d-flex justify-content-between">
                  {movieIconListData.map((iconList: MovieIconProps) => (
                    <CustomGroupIcons
                      key={iconList.key}
                      label={iconList.label}
                      icon={iconList.icon}
                      iconColor={iconList.iconColor}
                      width={iconList.width}
                      height={iconList.height}
                      addData={iconList.addMovie}
                      onClickIcon={() => handleMovieAddRemove(
                        iconList.key,
                        iconList.addMovie,
                      )}
                    />
                  ))}
                </div>
              </div>
              {enableDevFeatures
                && (
                  <div className="p-3 d-none d-xl-block">
                    <RoundButton variant="black" className="w-100">Add to list</RoundButton>
                  </div>
                )}
            </div>
          </Col>
          <Col xl={7}>
            <AboutDetails
              setReviewForm={setReviewForm}
              movieData={movieData}
              setMovieData={setMovieData}
              aboutMovieDetail={aboutMovieData as AdditionalMovieData}
              reviewButtonRef={reviewButtonRef}
              reviewSmallButtonRef={reviewSmallButtonRef}
              handleScroll={handleScroll}
              setShowReviewForm={setShowReviewForm}
            />
          </Col>
        </Row>
        <Row className="d-xl-none justify-content-center mt-3">
          <Col xs={12} sm={7} md={5} lg={9} className="text-center">
            <span className="fs-5">Your lists</span>
            <div className="mt-2 d-flex justify-content-around">
              {movieIconListData.map((iconList: MovieIconProps) => (
                <CustomGroupIcons
                  key={iconList.key}
                  label={iconList.label}
                  icon={iconList.icon}
                  iconColor={iconList.iconColor}
                  width={iconList.width}
                  height={iconList.height}
                  addData={iconList.addMovie}
                  onClickIcon={() => handleMovieAddRemove(iconList.key, iconList.addMovie)}
                />
              ))}
            </div>
            {enableDevFeatures
              && (
                <div className="p-3 d-xl-none justify-content-center mt-xl-2">
                  <RoundButton variant="black" className="w-100">Add to list</RoundButton>
                </div>
              )}
          </Col>
          <div className="d-block d-md-none d-lg-block mb-2">
            <a href={to} target="_blank" className="text-decoration-none" rel="noreferrer">
              <RoundButton className="w-100">Buy now</RoundButton>
            </a>
          </div>
        </Row>

        {enableDevFeatures
          && (
            <Row className="d-lg-none text-center">
              <StyledBorder />
              <Col xs={12}>
                <p className="text-center fw-bold  mt-3">Get updates for this movie</p>
              </Col>
              <Col xs={12} sm={7} md={5} className="m-auto">
                <BorderButton
                  customButtonCss="width: 100% !important;"
                  buttonClass=""
                  variant="lg"
                  toggleBgColor={bgColor}
                  handleClick={setBgColor}
                  toggleButton
                />
              </Col>
            </Row>
          )}

        {enableDevFeatures
          && (
            <Row className="align-items-center justify-content-center mt-4 d-lg-none">
              <Col sm={6} md={5}>
                <div className="align-items-center d-flex justify-content-evenly">
                  <span className="mb-2">Push notifications</span>
                  <Switch id="pushNotificationsSwitch" className="ms-4" />
                </div>
              </Col>
            </Row>
          )}

        <div ref={movieReviewRef}>
          <Row className="justify-content-center">
            <Col xs={12}>
              <TabLinks
                tabsClass="start"
                tabsClassSmall="start"
                tabLink={
                  movieData.type === MovieType.UserDefined
                  && movieData.businessListingRef
                    ? tabsForBusinessListings
                    : tabs
                }
                toLink={`/app/movies/${params.id}`}
                selectedTab={params && params['*']!.startsWith('reviews/') ? 'reviews' : params['*']}
                params={selfView ? '?view=self' : ''}
              />
            </Col>
          </Row>
        </div>
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="details" replace />} />
        <Route
          path="details"
          element={(
            <>
              <MovieOverview overView={aboutMovieData?.mainData?.overview} />

              {/* {
                movieData.type === MovieType.UserDefined && movieData.businessListingRef && (
                  <BusinessListingPosts
                    businessListingRef={movieData.businessListingRef as string}
                  />
                )
              } */}

              <TpdAd className="my-3" id="about-movie-ad-placeholder" slotId={tpdAdSlotIdZ} />
              <MovieCasts castList={aboutMovieData?.cast as any} />
              {
                aboutMovieData?.video?.length > 0
                && (
                  <MovieTrailers
                    trailerList={
                      aboutMovieData
                      && aboutMovieData.video.map((video: any) => (
                        { key: getYouTubeEmbedId(video.key) })).filter((item) => item.key) as any
                    }
                  />
                )
              }
            </>
          )}
        />
        <Route
          path="reviews"
          element={(
            <MovieReviews
              reviewForm={reviewForm}
              setReviewForm={setReviewForm}
              movieData={movieData}
              setMovieData={setMovieData}
              handleScroll={handleScroll}
              showReviewForm={showReviewForm}
              setShowReviewForm={setShowReviewForm}
            />
          )}
        />
        <Route path="reviews/:postId" element={<MovieReviewDetails />} />
        <Route path="posts" element={<MoviePosts movieData={movieData} />} />
        <Route path="edit" element={<MovieEdit />} />
      </Routes>
    </div>
  );
}

export default AboutMovie;
