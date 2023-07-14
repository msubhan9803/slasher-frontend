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
import { BREAK_POINTS, topToDivHeight } from '../../constants';
import FriendActionButtons from '../../components/ui/Friend/FriendActionButtons';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import SignInModal from '../../components/ui/SignInModal';
import { getLastNonProfilePathname } from '../../utils/url-utils';
import useSessionToken from '../../hooks/useSessionToken';

interface Props {
  tabKey?: string;
  user: User | undefined;
  showTabs?: boolean;
}
const AboutProfileImage = styled(UserCircleImage)`
  border: 0.25rem solid #1B1B1B;
`;
const tabs = [
  { value: 'about', label: 'About' },
  { value: 'posts', label: 'Posts' },
  { value: 'friends', label: 'Friends' },
  { value: 'photos', label: 'Photos' },
  { value: 'watched-list', label: 'Watched list' },
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

function ProfileHeader({
  tabKey, user, showTabs,
}: Props) {
  const [showSignIn, setShowSignIn] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const [friendshipStatus, setFriendshipStatus] = useState<any>();
  const [friendStatus, setFriendStatus] = useState<FriendRequestReaction | null>(null);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const popoverOption = ['Report', 'Block user'];
  const loginUserName = useAppSelector((state) => state.user.user.userName);
  const userId = useAppSelector((state) => state.user.user.id);
  const { userName } = useParams();
  const navigate = useNavigate();
  const param = useParams();
  const location = useLocation();
  const [clickedUserId, setClickedUserId] = useState<string>('');
  const [friendData, setFriendData] = useState<FriendType>(null);
  const positionRef = useRef<HTMLDivElement>(null);
  const scrollPosition: any = useAppSelector((state: any) => state.scrollPosition);
  const dispatch = useAppDispatch();
  const pathnameHistory = useAppSelector((state) => state.user.pathnameHistory);
  const token = useSessionToken();

  const isSelfUserProfile = userName === loginUserName;
  const userIsLoggedIn = !token.isLoading && token.value;

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

  useLayoutEffect(() => {
    if (token.isLoading) { return; }
    if (!userIsLoggedIn) { return; }

    const element = positionRef.current;
    if (!element) { return; }

    const isPublicProfile = location?.state?.publicProfile;
    if (isPublicProfile) { return; }

    // Scroll so that "About-Posts-Friends-Photos-Watched_list" nav-bar sticks to top of the
    // viewport.
    if (!location.pathname.includes('about')) {
      window.scrollTo({
        top: element.offsetTop - (window.innerWidth >= BREAK_POINTS.lg ? (topToDivHeight - 18) : 0),
        behavior: 'instant' as any,
      });
    }
  }, [positionRef, friendStatus, dispatch, scrollPosition.scrollToTab,
    param, location, token, userIsLoggedIn]);

  const onBlockYesClick = () => {
    createBlockUser(clickedUserId)
      .then(() => setDropDownValue('BlockUserSuccess'))
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };

  const afterBlockUser = () => {
    const lastNonProfilePathname = getLastNonProfilePathname(pathnameHistory!, userName!);
    navigate(lastNonProfilePathname);
  };

  const reportUserProfile = (reason: string) => {
    const reportPayload = {
      targetId: clickedUserId,
      reason,
      reportType: 'profile',
    };
    reportData(reportPayload).then(() => {
      setShow(false);
    })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
  };

  if (!user || (!isSelfUserProfile && typeof friendStatus === null)) {
    return <LoadingIndicator />;
  }
  const handleSignInDialog = (e: any) => {
    if (userIsLoggedIn) {
      e.preventDefault();
    } else {
      setShowSignIn(!showSignIn);
    }
  };
  return (
    <div className="bg-dark bg-mobile-transparent rounded mb-4">
      <div className="p-md-4 g-0">
        <div>
          <ProfileCoverImage src={user.coverPhoto || defaultCoverImage} alt="Cover picture" className="mt-3 mt-md-0 w-100 rounded" onClick={handleSignInDialog} />
        </div>
        <Row className="d-flex ps-md-4">
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
              <Col xs={12} md={4} lg={12} xl={4} className="text-center text-md-start text-lg-center text-xl-start  mt-4 mt-md-0 ps-md-0">
                <h1 className="mb-md-0 text-nowrap">
                  {user?.firstName}
                </h1>
                <p className="fs-5 text-light">
                  @
                  {user?.userName}
                </p>
              </Col>
              <Col xs={12} md={8} lg={12} xl={8}>
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
                    <div className="d-flex align-items-center justify-content-md-end justify-content-lg-center justify-content-xl-end justify-content-center">
                      <FriendActionButtons
                        user={user}
                        friendData={friendData}
                        friendStatus={friendStatus}
                        setFriendshipStatus={setFriendshipStatus}
                        buttonType="send-message"
                      />
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
                tabLink={tabs}
                toLink={`/${user?.userName}`}
                selectedTab={tabKey}
                overrideOnClick={userIsLoggedIn ? () => { } : handleSignInDialog}
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
      />
      {
        showSignIn
        && <SignInModal show={showSignIn} setShow={setShowSignIn} isPublicProfile />
      }
    </div>
  );
}

ProfileHeader.defaultProps = {
  showTabs: true,
  tabKey: tabs[0].value,
};

export default ProfileHeader;
