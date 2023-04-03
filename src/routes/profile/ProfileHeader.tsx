/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import styled from 'styled-components';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';
import defaultCoverImage from '../../images/default-cover-image.jpg';
import CustomPopover, { PopoverClickProps } from '../../components/ui/CustomPopover';
import UserCircleImage from '../../components/ui/UserCircleImage';
import ReportModal from '../../components/ui/ReportModal';
import { User, FriendRequestReaction } from '../../types';
import { friendship } from '../../api/friends';
import { createBlockUser } from '../../api/blocks';
import { reportData } from '../../api/report';
import LoadingIndicator from '../../components/ui/LoadingIndicator';
import { StyledBorder } from '../../components/ui/StyledBorder';
import { enableDevFeatures } from '../../utils/configEnvironment';
import FriendActionButtons from '../../components/ui/Friend/FriendActionButtons';

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
const allTabs = enableDevFeatures ? tabs : tabs.filter((t) => t.label !== 'Watched list');
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
type FriendType = { from: string, to: string, reaction: FriendRequestReaction } | null;

function ProfileHeader({ tabKey, user, showTabs }: Props) {
  const [show, setShow] = useState<boolean>(false);
  const [friendshipStatus, setFriendshipStatus] = useState<any>();
  const [friendStatus, setFriendStatus] = useState<FriendRequestReaction | null>(null);
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const popoverOption = ['Report', 'Block user'];
  const loginUserName = Cookies.get('userName');
  const loginUserId = Cookies.get('userId');
  const { userName } = useParams();
  const navigate = useNavigate();
  const [clickedUserId, setClickedUserId] = useState<string>('');
  const [friendData, setFriendData] = useState<FriendType>(null);

  const isSelfUserProfile = userName === loginUserName;

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    if (popoverClickProps.userId) {
      setClickedUserId(popoverClickProps.userId);
    }

    setShow(true);
    setDropDownValue(value);
  };

  useEffect(() => {
    if (user && !isSelfUserProfile) {
      friendship(user._id).then((res) => {
        setFriendData(res.data);
        setFriendStatus(res.data.reaction);
      });
    }
  }, [user, friendshipStatus, isSelfUserProfile, loginUserId]);

  const onBlockYesClick = () => {
    createBlockUser(clickedUserId)
      .then(() => {
        setShow(false);
      })
      /* eslint-disable no-console */
      .catch((error) => console.error(error));
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

  return (
    <div className="bg-dark bg-mobile-transparent rounded mb-4">
      <Row className="p-md-4">
        <Col>
          <ProfileCoverImage src={user.coverPhoto || defaultCoverImage} alt="Cover picture" className="mt-3 mt-md-0 w-100 rounded" />
        </Col>
        <Row className="d-flex ms-3">
          <CustomCol md={3} lg={12} xl="auto" className="text-center text-lg-center text-xl-start  position-relative">
            <AboutProfileImage size="11.25rem" src={user?.profilePic} alt="user picture" />
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
              <Col xs={12} md={4} lg={12} xl={4} className="text-center text-capitalize text-md-start text-lg-center text-xl-start  mt-4 mt-md-0 ps-md-0">
                <h1 className="mb-md-0">
                  {user?.firstName}
                </h1>
                <p className="fs-5  text-light">
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
                {!isSelfUserProfile
                  && (
                    <div className="d-flex align-items-center justify-content-md-end justify-content-lg-center justify-content-xl-end justify-content-center">
                      <FriendActionButtons
                        user={user}
                        friendData={friendData}
                        friendStatus={friendStatus}
                        setFriendshipStatus={setFriendshipStatus}
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
      </Row>
      {
        showTabs && (
          <>
            <StyledBorder className="d-md-block d-none" />
            <TabLinks tabLink={allTabs} toLink={`/${user?.userName}`} selectedTab={tabKey} />
          </>
        )
      }
      <ReportModal
        show={show}
        setShow={setShow}
        slectedDropdownValue={dropDownValue}
        onBlockYesClick={onBlockYesClick}
        handleReport={reportUserProfile}
      />
    </div>
  );
}

ProfileHeader.defaultProps = {
  showTabs: true,
  tabKey: tabs[0].value,
};

export default ProfileHeader;
