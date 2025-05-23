/* eslint-disable max-lines */
import React, {
  useEffect, useState, useRef, useLayoutEffect,
} from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';
import defaultCoverImage from '../../images/default-cover-image.jpg';
import CustomPopover, { PopoverClickProps } from '../../components/ui/CustomPopover';
import UserCircleImage from '../../components/ui/UserCircleImage';
import ReportModal from '../../components/ui/ReportModal';
import { User, FriendRequestReaction, FriendType } from '../../types';
import { friendship } from '../../api/friends';
import { createBlockUser } from '../../api/blocks';
import { reportData } from '../../api/report';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { StyledBorder } from '../../components/ui/StyledBorder';
import { BREAK_POINTS, MD_MEDIA_BREAKPOINT, topToDivHeight } from '../../constants';
import FriendActionButtons from '../../components/ui/Friend/FriendActionButtons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import SignInModal from '../../components/ui/SignInModal';
import { getLastNonProfilePathname } from '../../utils/url-utils';
import useSessionToken from '../../hooks/useSessionToken';
import { setScrollToTabsPosition } from '../../redux/slices/scrollPositionSlice';
import { formatNumberWithUnits } from '../../utils/number.utils';
import ZoomableImageModal from '../../components/ui/ZoomingImageModal';
import useProgressButton from '../../components/ui/ProgressButton';
import NotificationBell from '../../components/ui/NotificationBell';
import { checkFollowNotificationStatus, deleteNotificationStatus, updateNotificationStatus } from '../../api/user-follow';

interface Props {
  tabKey?: string;
  user: User | undefined;
  showTabs?: boolean;
}
const AboutProfileImage = styled(UserCircleImage)`
  border: 0.25rem solid #1B1B1B;
`;
export const StyledButtonIcon = styled.div`  
  min-height:2.356rem;
  .main {
    width:25.8px;
  }
  .toggle {
    line-height: 0.625;
  }
  .res-div {
    width : 100%;
  }
  @media (min-width: ${MD_MEDIA_BREAKPOINT}) {
    .res-div {
      width : auto;
    }
  }
`;
const tabs = [
  { value: 'about', label: 'About' },
  { value: 'posts', label: 'Posts' },
  { value: 'friends', label: 'Friends' },
  { value: 'photos', label: 'Photos' },
  { value: 'watched-list', label: 'Watched list' },
  { value: 'following', label: 'Following', user: 'self' },
];
const CustomCol = styled(Col)`
  margin-top: -3.938rem;
`;
const ProfileCoverImage = styled.img`
  width: 100%;
  object-fit: cover;
  aspect-ratio: 2.59375;
`;
const StyledPopoverContainer = styled.div`
  top: 70px;
  right: 10px;
`;
// type FriendType = { from: string, to: string, reaction: FriendRequestReaction } | null;

const StyleDot = styled(FontAwesomeIcon)`
  width: 0.267rem;
  height: 0.267rem;
`;

const NotificationBellWrapper = styled.div`
  width: 100%;
  @media (min-width: 767.98px) { 
    width: auto;
  }
  @media (min-width: 991.98px) { 
    width: 100%;
  } 
  @media (min-width: 1199.98px) { 
    width: auto;
  } 
`;

function ProfileHeader({
  tabKey, user, showTabs,
}: Props) {
  const [showSignIn, setShowSignIn] = useState<boolean>(false);
  const [showProfileImage, setShowProfileImage] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const [friendshipStatus, setFriendshipStatus] = useState<any>();
  const [friendStatus, setFriendStatus] = useState<FriendRequestReaction | null>(null);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const [isNotify, setNotify] = useState(false);
  const [ProgressButton, setProgressButtonStatus] = useProgressButton();
  const popoverOption = ['Report', 'Block user'];
  const loginUserName = useAppSelector((state) => state.user.user.userName);
  const userId = useAppSelector((state) => state.user.user.id);
  const { userName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [clickedUserId, setClickedUserId] = useState<string>('');
  const [friendData, setFriendData] = useState<FriendType>(null);
  const positionRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useAppSelector((state) => state.scrollPosition);
  const dispatch = useAppDispatch();
  const pathnameHistory = useAppSelector((state) => state.user.pathnameHistory);
  const token = useSessionToken();

  const isSelfUserProfile = userName === loginUserName;
  const userIsLoggedIn = !token.isLoading && token.value;
  const customTabs = isSelfUserProfile ? tabs : tabs.filter((t) => t.user !== 'self');
  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    if (popoverClickProps.userId) {
      setClickedUserId(popoverClickProps.userId);
    }

    setShow(true);
    setDropDownValue(value);
  };

  useEffect(() => {
    if (token.isLoading) { return; }
    if (user && !isSelfUserProfile && token.value) {
      friendship(user._id).then((res) => {
        setFriendData(res.data);
        setFriendStatus(res.data.reaction);
      });
    }
  }, [user, friendshipStatus, isSelfUserProfile, userId, token]);

  useEffect(() => {
    if (friendStatus === 3 && !isSelfUserProfile && user) {
      checkFollowNotificationStatus(user?._id)
        .then((res) => {
          setNotify(res.data.success);
        });
    }
  }, [friendStatus, user, isSelfUserProfile]);

  useLayoutEffect(() => {
    if (token.isLoading) { return; }
    if (!userIsLoggedIn) { return; }

    const element = positionRef.current;
    if (!element) { return; }

    const isPublicProfile = location?.state?.publicProfile;
    if (isPublicProfile) { return; }

    if (!scrollPosition.scrollToTab) { return; }

    // Scroll so that "About-Posts-Friends-Photos-Watched_list" nav-bar sticks to top of the
    // viewport.
    if (!location.pathname.includes('about')) {
      window.scrollTo({
        // eslint-disable-next-line max-len
        top: element.offsetTop - (window.innerWidth >= BREAK_POINTS.lg ? (topToDivHeight - 18) : 0) + 10,
        behavior: 'instant' as any,
      });
    }
    dispatch(setScrollToTabsPosition(false));
  }, [positionRef, friendStatus, location, token, userIsLoggedIn, scrollPosition.scrollToTab,
    dispatch]);

  const onBlockYesClick = () => {
    setProgressButtonStatus('loading');
    createBlockUser(clickedUserId)
      .then(() => {
        setProgressButtonStatus('default');
        setDropDownValue('BlockUserSuccess');
      })
      /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
  };

  const afterBlockUser = () => {
    const lastNonProfilePathname = getLastNonProfilePathname(pathnameHistory!, userName!);
    navigate(lastNonProfilePathname);
  };

  const reportUserProfile = (reason: string) => {
    setProgressButtonStatus('loading');
    const reportPayload = {
      targetId: clickedUserId,
      reason,
      reportType: 'profile',
    };
    reportData(reportPayload).then(() => {
      setProgressButtonStatus('default');
    })
      /* eslint-disable no-console */
      .catch((error) => { console.error(error); setProgressButtonStatus('failure'); });
    setDropDownValue('PostReportSuccessDialog');
  };

  if (!user || (!isSelfUserProfile && typeof friendStatus === null)) {
    return <LoadingIndicator />;
  }
  const handleSignInDialog = (e: any) => {
    if (userIsLoggedIn) {
      e.preventDefault();
      setShowProfileImage(!showProfileImage);
    } else {
      setShowSignIn(!showSignIn);
    }
  };
  const handleScrollToTab = () => dispatch(setScrollToTabsPosition(true));

  const onOffNotificationClick = () => {
    const requestBody = {
      followUserId: user?._id,
      notification: isNotify,
    };
    if (isNotify) {
      deleteNotificationStatus(user?._id).then(() => setNotify(false));
    } else {
      updateNotificationStatus(requestBody)
        .then(() => setNotify(true));
    }
  };

  // Fix bug of 1071: Use `visibility` style variable so that `ProfileHeader` details
  // like profile-name, profile-image are not shown when we switch tabs i.e,.,Posts,
  // Friends, Photos, etc. (bug was only replicable on capacitor app and not on mobile-web)
  const visibility = scrollPosition.scrollToTab ? 'hidden' : 'visible';
  return (
    <div className="bg-dark bg-mobile-transparent rounded mb-4">
      <div style={{ visibility }} className="p-md-4 g-0">
        <div>
          <ProfileCoverImage src={user.coverPhoto || defaultCoverImage} alt="Cover picture" className="mt-3 mt-md-0 w-100 rounded" onClick={handleSignInDialog} />
        </div>
        <Row className="d-flex ps-md-4 md:ps-md-2 lg:ps-md-4">
          <CustomCol md={3} lg={12} xl="auto" className="text-center text-lg-center text-xl-start  position-relative">
            <AboutProfileImage size="11.25rem" src={user?.profilePic} alt="user picture" onClick={handleSignInDialog} />
            {!isSelfUserProfile
              && (
                <StyledPopoverContainer className="d-block d-md-none d-lg-block d-xl-none position-absolute">
                  <CustomPopover
                    popoverOptions={popoverOption}
                    onPopoverClick={handlePopoverOption}
                    userId={user?._id}
                  />
                </StyledPopoverContainer>
              )}
          </CustomCol>
          <Col className="w-100 mt-md-4">
            <Row className="d-flex justify-content-between">
              <Col xs={12} md={6} lg={12} xl={5} className="text-center text-md-start text-lg-center text-xl-start  mt-4 mt-md-0 ps-md-0">
                <h1 className="mb-md-0 text-break">
                  {user?.firstName}
                </h1>
                <div className="fs-5 text-light">
                  @
                  {user?.userName}
                </div>
                <div className="text-nowrap mb-2">
                  Friends:
                  <span className="ps-1">{formatNumberWithUnits(user.friendsCount)}</span>
                  <StyleDot icon={solid('circle')} size="xs" className="my-1 mx-2 text-primary" />
                  Posts:
                  <span className="ps-1">{formatNumberWithUnits(user.postsCount)}</span>
                </div>
              </Col>
              <Col xs={12} md={6} lg={12} xl={7}>
                {isSelfUserProfile
                  && (
                    <div className="d-flex justify-content-md-end justify-content-lg-center justify-content-xl-end justify-content-center">
                      <RoundButton className="btn btn-form bg-black rounded-5 d-flex px-4" onClick={() => navigate(`/${userName}/edit`)}>
                        <FontAwesomeIcon icon={solid('pen')} className="me-2 align-self-center" />
                        Edit profile
                      </RoundButton>
                    </div>
                  )}
                {!isSelfUserProfile && userIsLoggedIn
                  && (
                    <div className="d-flex flex-wrap-reverse flex-md-nowrap flex-lg-wrap-reverse flex-xl-nowrap align-items-center justify-content-md-end justify-content-lg-center justify-content-xl-end justify-content-center">
                      <FriendActionButtons
                        user={user}
                        friendData={friendData}
                        friendStatus={friendStatus}
                        setFriendshipStatus={setFriendshipStatus}
                        buttonType="send-message"
                      />
                      {friendStatus === 3 && (
                        <NotificationBellWrapper className="d-flex justify-content-center mb-2 mb-md-0 mb-lg-2 mb-xl-0">
                          <StyledButtonIcon className="d-flex align-items-center ms-md-2 justify-content-end">
                            {!isSelfUserProfile && friendStatus === 3 && (
                              <NotificationBell
                                onButtonClick={() => onOffNotificationClick()}
                                toggle={isNotify}
                              />
                            )}
                          </StyledButtonIcon>
                        </NotificationBellWrapper>
                      )}
                      <StyledPopoverContainer className="d-none d-md-block d-lg-none d-xl-block">
                        <CustomPopover
                          popoverOptions={popoverOption}
                          onPopoverClick={handlePopoverOption}
                          userId={user?._id}
                        />
                      </StyledPopoverContainer>
                    </div>
                  )}
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
      {
        showTabs && (
          <>
            <StyledBorder className="d-md-block d-none" />
            <div ref={positionRef} aria-hidden="true">
              <TabLinks
                tabLink={customTabs}
                toLink={`/${user?.userName}`}
                selectedTab={tabKey}
                overrideOnClick={userIsLoggedIn ? handleScrollToTab : handleSignInDialog}
              />
            </div>
          </>
        )
      }
      <ReportModal
        show={show}
        setShow={setShow}
        slectedDropdownValue={dropDownValue}
        onBlockYesClick={onBlockYesClick}
        afterBlockUser={afterBlockUser}
        handleReport={reportUserProfile}
        ProgressButton={ProgressButton}
      />
      {
        showSignIn
        && <SignInModal show={showSignIn} setShow={setShowSignIn} isPublicProfile />
      }
      {
        showProfileImage
        && (
          <ZoomableImageModal
            imgSrc={user?.profilePic}
            imgAlt="user profile pic"
            show={showProfileImage}
            onHide={() => setShowProfileImage(false)}
          />
        )
      }
    </div>
  );
}

ProfileHeader.defaultProps = {
  showTabs: true,
  tabKey: tabs[0].value,
};

export default ProfileHeader;
