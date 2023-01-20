/* eslint-disable max-lines */
import React, { ChangeEvent, useState } from 'react';
import {
  Alert, Col, Form, Row,
} from 'react-bootstrap';
import {
  useNavigate, useLocation, useParams,
} from 'react-router-dom';
import Cookies from 'js-cookie';
import {
  uploadUserCoverImage, uploadUserProfileImage, updateUser,
} from '../../../api/users';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import PhotoUploadInput from '../../../components/ui/PhotoUploadInput';
import RoundButton from '../../../components/ui/RoundButton';
import { ProfileVisibility, User } from '../../../types';
import { updateUserName } from '../../../utils/session-utils';
import UnauthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/unauthenticated/UnauthenticatedPageWrapper';
import NotFound from '../../../components/NotFound';

interface Props {
  user: User
}
function ProfileEdit({ user }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [locallyStoredUserData, setLocallyStoredUserData] = useState<User>(user);
  const [errorMessage, setErrorMessages] = useState<string[]>();
  const [profilePhoto, setProfilePhoto] = useState<any>();
  const [coverPhoto, setCoverPhoto] = useState<any>();
  const [publicStatus, setPublic] = useState<boolean>(
    user.profile_status === ProfileVisibility.Public,
  );
  const [privateStatus, setPrivate] = useState<boolean>(
    user.profile_status === ProfileVisibility.Private,
  );
  const { userName } = useParams<string>();
  const userNameCookies = Cookies.get('userName');
  const isUnAuthorizedUser = userName !== userNameCookies;
  const updateProfile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let errorList: string[] = [];

    if (profilePhoto) {
      try {
        await uploadUserProfileImage(profilePhoto);
      } catch (requestError: any) {
        errorList = errorList.concat(requestError.response.data.message);
      }
    }

    if (coverPhoto) {
      try {
        await uploadUserCoverImage(coverPhoto);
      } catch (requestError: any) {
        errorList = errorList.concat(requestError.response.data.message);
      }
    }

    try {
      await updateUser(
        locallyStoredUserData.userName,
        locallyStoredUserData.firstName,
        locallyStoredUserData.email,
        locallyStoredUserData.id,
        locallyStoredUserData.profile_status,
      );
    } catch (requestError: any) {
      errorList = errorList.concat(requestError.response.data.message);
    }
    setErrorMessages(errorList);

    if (errorList.length === 0) {
      // After successful update, update locally-stored username
      updateUserName(locallyStoredUserData.userName);
      // And update current url to use latest userName (to handle possible userName change)
      navigate(
        location.pathname.replace(params.userName!, locallyStoredUserData.userName),
        { replace: true },
      );
    }
  };

  const handleChange = (value: string, key: string) => {
    setLocallyStoredUserData({ ...locallyStoredUserData, [key]: value });
  };

  if (isUnAuthorizedUser) {
    return (
      <UnauthenticatedPageWrapper>
        <NotFound />
      </UnauthenticatedPageWrapper>
    );
  }

  const radioButtonLabelDescription = (radioButtonLable: string, description: string) => (
    <>
      <span className="fs-3 fw-normal">{radioButtonLable}</span>
      <p className="text-light">{description}</p>
    </>
  );

  const privateChangeHandler = () => {
    setPrivate(true);
    setPublic(false);
    handleChange('1', 'profile_status');
  };

  const publicChangeHandler = () => {
    setPublic(true);
    setPrivate(false);
    handleChange('0', 'profile_status');
  };
  return (
    <AuthenticatedPageWrapper rightSidebarType="profile-self">
      {locallyStoredUserData.profilePic.includes('default_user_icon')
        && <Alert variant="info">Hey! It looks like you don’t have a profile image yet!   Adding one will make people more likely to friend you!</Alert>}
      <Form>
        <div className="bg-dark p-4 rounded bg-mobile-transparent">
          <Row>
            <Col md={6} lg={12} xl={6}>
              <div className="d-block d-md-flex align-items-center">
                <PhotoUploadInput
                  className="mx-auto mx-md-0 me-md-3"
                  height="10rem"
                  variant="outline"
                  imagePreview={locallyStoredUserData.profilePic}
                  onChange={(file) => { setProfilePhoto(file); }}
                />
                <div className="text-center text-md-start mt-4 mt-md-0">
                  <h1 className="h3 mb-2 fw-bold">Change profile photo</h1>
                  <div className="d-block justify-content-center">
                    <p className="fs-5 text-light mb-0">
                      Recommended size: 180x180 pixels
                    </p>
                    <p className="fs-5 text-light mb-0">
                      (jpg, png)
                    </p>
                  </div>
                </div>
              </div>
            </Col>
            <Col md={6} lg={12} xl={6} className="mt-5 mt-md-0 mt-lg-5 mt-xl-0">
              <div className="d-block d-md-flex align-items-center">
                <PhotoUploadInput
                  className="mx-auto mx-md-0 me-md-3"
                  height="10rem"
                  variant="outline"
                  imagePreview={locallyStoredUserData.coverPhoto}
                  onChange={(file) => { setCoverPhoto(file); }}
                />
                <div className="text-center text-md-start mt-4 mt-md-0">
                  <h1 className="h3 mb-2 fw-bold">Change cover photo</h1>
                  <div className="d-block justify-content-center">
                    <p className="fs-5 text-light mb-0">
                      Recommended size: 830x467 pixels
                    </p>
                    <p className="fs-5 text-light mb-0">
                      (jpg, png)
                    </p>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <div className="bg-dark p-4 mt-4 rounded bg-mobile-transparent">
          <h1 className="h2 fw-bold mb-4">Edit information</h1>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="h3">Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Name"
                  value={locallyStoredUserData.firstName || ''}
                  onChange={
                    (changeData: ChangeEvent<HTMLInputElement>) => handleChange(changeData.target.value, 'firstName')
                  }
                  className="my-3 fs-5"
                />
                <div className="d-flex pe-5">
                  <Form.Text className="text-muted fs-4">
                    This is how your first name will appear in your profile.
                  </Form.Text>
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="h3">Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Username"
                  value={locallyStoredUserData.userName || ''}
                  onChange={
                    (changeData: ChangeEvent<HTMLInputElement>) => handleChange(changeData.target.value, 'userName')
                  }
                  className="my-3 fs-5"
                />
                <Form.Text className="text-muted fs-4">
                  This is how people will see you post and comment on Slasher.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="h3">Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={locallyStoredUserData.email || ''}
                  onChange={
                    (changeData: ChangeEvent<HTMLInputElement>) => handleChange(changeData.target.value, 'email')
                  }
                  className="my-3 fs-5"
                />
                <Form.Text className="text-muted fs-4">
                  In order to edit your email address, we will ask your
                  security question.
                </Form.Text>
                <Form.Text className="text-muted d-flex my-3 fs-4">
                  When you change your email address, we will send an email to that
                  address with an update button.
                </Form.Text>
                <Form.Text className="text-muted fs-4">
                  Be sure to click the button in the email to activate your new email address.
                  If you do not, this can cause issues with your account, such as your ability
                  to login.
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-4">
                <Form.Label className="h3">Profile visibility</Form.Label>
                <Form.Check
                  key="profileVisibility"
                  type="radio"
                  id="report-public"
                  checked={publicStatus}
                  className="mb-2"
                  label={radioButtonLabelDescription('Public', 'All elements of your profile will be publicly visible (posts, photos, etc.).')}
                  onChange={publicChangeHandler}
                />
                <Form.Check
                  key="profileVisibility"
                  type="radio"
                  id="report-private"
                  checked={privateStatus}
                  className="mb-2"
                  label={radioButtonLabelDescription('Private', 'People you are not friends with will only see your profile image, username, and about me info.')}
                  onChange={privateChangeHandler}
                />
              </Form.Group>
            </Col>
          </Row>
          {errorMessage && errorMessage.length > 0 && (
            <div className="mt-3 text-start">
              <ErrorMessageList errorMessages={errorMessage} className="m-0" />
            </div>
          )}
          <Row className="mt-2">
            <Col md={3} lg={4} xl={3}>
              <RoundButton type="submit" className="py-2 w-100  fs-3 fw-bold" onClick={updateProfile}>
                Update profile
              </RoundButton>
            </Col>
          </Row>
        </div>
      </Form>
    </AuthenticatedPageWrapper>
  );
}
export default ProfileEdit;
