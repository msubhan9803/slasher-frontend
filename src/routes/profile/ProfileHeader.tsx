/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, Image, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import styled from 'styled-components';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';
import postImage from '../../images/about-post.jpg';
import CustomPopover, { PopoverClickProps } from '../../components/ui/CustomPopover';
import UserCircleImage from '../../components/ui/UserCircleImage';
import ReportModal from '../../components/ui/ReportModal';
import { User, FriendRequestReaction } from '../../types';
import {
  acceptFriendsRequest, addFriend, friendship, rejectFriendsRequest,
} from '../../api/friends';
import RoundButtonLink from '../../components/ui/RoundButtonLink';
import { createBlockUser } from '../../api/blocks';
import { reportData } from '../../api/report';

interface Props {
  tabKey: string;
  user: User | undefined;
}
const AboutProfileImage = styled(UserCircleImage)`
  border: 0.25rem solid #1B1B1B;
`;
const StyledBorder = styled.div`
  border-top: 1px solid #3A3B46
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
const ImageContainer = styled.div`
  acpect-ratio: '1.78'
`;
const RoundDiv = styled.div`
  border-top-left-radius:50%;
  border-top-right-radius:50%;
`;
const StyledPopoverContainer = styled.div`
  top: 70px;
  right: 10px;
`;
function ProfileHeader({ tabKey, user }: Props) {
  const [show, setShow] = useState<boolean>(false);
  const [friendshipStatus, setFriendshipStatus] = useState<any>();
  const [friendStatus, setFriendStatus] = useState<any>();
  const [dropDownValue, setDropDownValue] = useState<string>('');
  const popoverOption = ['Report', 'Block user'];
  const loginUserName = Cookies.get('userName');
  const loginUserId = Cookies.get('userId');
  const { userName } = useParams();
  const navigate = useNavigate();
  const [clickedUserId, setClickedUserId] = useState<string>('');

  const handlePopoverOption = (value: string, popoverClickProps: PopoverClickProps) => {
    if (popoverClickProps.userId) {
      setClickedUserId(popoverClickProps.userId);
    }

    setShow(true);
    setDropDownValue(value);
  };

  useEffect(() => {
    if (user && (loginUserName !== userName)) {
      friendship(user.id).then((res) => {
        if (res.data.reaction === FriendRequestReaction.Pending
          && res.data.from === loginUserId
          && res.data.to === user.id) {
          setFriendStatus('Cancel pending request');
        } else if (res.data.reaction === FriendRequestReaction.Pending
          && res.data.from === user.id
          && res.data.to === loginUserId) {
          setFriendStatus('Accept friend request');
        } else if (res.data.reaction === FriendRequestReaction.Accepted) {
          setFriendStatus('Remove friend');
        } else if (res.data.reaction === FriendRequestReaction.DeclinedOrCancelled
          || res.data.reaction === null) {
          setFriendStatus('Add friend');
        }
      });
    }
  }, [user, friendshipStatus]);

  const friendRequestApi = (status: string) => {
    if (user && user.id) {
      if (status === 'Add friend') {
        addFriend(user.id).then(() => setFriendshipStatus(status));
      } else if (status === 'Accept friend request') {
        acceptFriendsRequest(user.id).then(() => setFriendshipStatus(status));
      } else if (status === 'Remove friend' || status === 'Cancel pending request') {
        rejectFriendsRequest(user.id).then(() => setFriendshipStatus(status));
      }
    }
  };

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

  return (
    <div className="bg-dark bg-mobile-transparent rounded mb-4">
      {tabKey === 'about'
        ? (
          <Row className="p-md-4">
            <Col>
              <ImageContainer>
                <Image src={postImage} alt="Banner image" className="w-100 rounded" />
              </ImageContainer>
            </Col>
            <Row className="d-flex ms-3">
              <CustomCol md={3} lg={12} xl="auto" className="text-center text-lg-center text-xl-start  position-relative">
                <AboutProfileImage size="11.25rem" src={user?.profilePic} />
                {loginUserName !== userName
                  && (
                    <StyledPopoverContainer className="d-block d-md-none d-lg-block d-xl-none position-absolute">
                      <CustomPopover
                        popoverOptions={popoverOption}
                        onPopoverClick={handlePopoverOption}
                        userId={user?.id}
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
                    {loginUserName === userName
                      && (
                        <div className="d-flex justify-content-md-end justify-content-lg-center justify-content-xl-end justify-content-center">
                          <RoundButton className="btn btn-form bg-black rounded-5 d-flex px-4 py-2" onClick={() => navigate(`/${userName}/edit`)}>
                            <FontAwesomeIcon icon={solid('pen')} className="me-2 align-self-center" />
                            <h3 className="mb-0"> Edit profile</h3>
                          </RoundButton>
                        </div>
                      )}
                    {loginUserName !== userName
                      && (
                        <div className="d-flex align-items-center justify-content-md-end justify-content-lg-center justify-content-xl-end justify-content-center">
                          <RoundButtonLink variant="black" to={`/messages/conversation/user/${user?.id}`} className="me-2 px-4 border-1 border-primary">Send message</RoundButtonLink>
                          <RoundButton className="px-4 me-2 fs-3" variant={`${friendStatus === 'Cancel pending request' || friendStatus === 'Remove friend' ? 'black' : 'primary'}`} onClick={() => friendRequestApi(friendStatus)}>
                            {friendStatus}
                          </RoundButton>

                          <StyledPopoverContainer className="d-none d-md-block d-lg-none d-xl-block">
                            <CustomPopover
                              popoverOptions={popoverOption}
                              onPopoverClick={handlePopoverOption}
                              userId={user?.id}
                            />
                          </StyledPopoverContainer>
                        </div>
                      )}
                  </Col>
                </Row>
              </Col>
            </Row>
          </Row>
        )
        : (
          <RoundDiv className="d-flex bg-dark justify-content-between p-md-3 p-2">
            <div className="d-flex">
              <div>
                <UserCircleImage src={user?.profilePic} className="me-2" />
              </div>
              <div className="text-capitalize">
                <p className="fs-3 mb-0">
                  @
                  {user?.userName}
                </p>
                <p className="fs-5 text-light mb-0">
                  {user?.firstName}
                </p>
              </div>
            </div>

            <div className="align-self-center">
              {loginUserName === userName
                && (
                  <RoundButton className="btn btn-form bg-black w-100 rounded-5 d-flex px-4 py-2" onClick={() => navigate(`/${userName}/edit`)}>
                    <FontAwesomeIcon icon={solid('pen')} className="me-2 align-self-center" />
                    <h3 className="mb-0"> Edit profile</h3>
                  </RoundButton>
                )}
              {loginUserName !== userName
                && (
                  <div className="d-flex align-items-center">
                    <RoundButton className="px-4 me-2 fs-3" variant={`${friendStatus === 'Cancel pending request' ? 'black' : 'primary'}`} onClick={() => friendRequestApi(friendStatus)}>
                      {friendStatus}
                    </RoundButton>
                    <CustomPopover
                      popoverOptions={popoverOption}
                      onPopoverClick={handlePopoverOption}
                      userId={user?.id}
                    />
                  </div>
                )}
            </div>
          </RoundDiv>
        )}
      <StyledBorder className="d-md-block d-none" />
      <TabLinks tabLink={tabs} toLink={`/${user?.userName}`} selectedTab={tabKey} />
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

export default ProfileHeader;
