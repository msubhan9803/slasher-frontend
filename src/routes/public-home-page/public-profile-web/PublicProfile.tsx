import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Navigate, useParams } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import PublicHomeFooter from '../public-home-footer/PublicHomeFooter';
import PublicHomeHeader from '../public-home-header/PublicHomeHeader';
import ProfileAbout from '../../profile/ProfileAbout/ProfileAbout';
import PublicHomeBody from '../public-home-body/PublicHomeBody';
import { userIsLoggedIn } from '../../../utils/session-utils';
import HeroImage from '../../../images/public-home-hero-header.png';
import ProfileLimitedView from '../../profile/ProfileLimitedView/ProfileLimitedView';
import { getPublicProfile } from '../../../api/users';
import LoadingIndicator from '../../../components/ui/LoadingIndicator';
import { ProfileVisibility, User } from '../../../types';

const StyleSection = styled.div`
background: url(${HeroImage}) top center;
padding-top:100px;
background-repeat: no-repeat;
    background-size: contain;
`;
function PublicProfile() {
  const { userName } = useParams();
  const [user, setUser] = useState<any>();
  const [errorMessage, setErrorMessage] = useState<string[]>();
  useEffect(() => {
    getPublicProfile(userName!)
      .then((res) => {
        setUser(res.data);
      })
      .catch((error: any) => setErrorMessage(error.response.data.message));
  }, [userName]);

  const renderProfile = (profileData: User) => {
    if (!profileData && !errorMessage) {
      return <LoadingIndicator />;
    }

    if (errorMessage && errorMessage.length > 0) {
      return (
        <div className="bg-dark rounded p-4 my-3">
          User not found.
        </div>
      );
    }
    return (
      <StyleSection>
        <Row className="d-flex justify-content-center px-2">
          <Col lg={9} className="px-lg-4 px-3">
            <PublicHomeBody>
              {profileData.profile_status === ProfileVisibility.Private
                ? <ProfileLimitedView user={user!} />
                : <ProfileAbout user={user!} />}
            </PublicHomeBody>
          </Col>
        </Row>
      </StyleSection>
    );
  };
  return (
    <div>
      {userIsLoggedIn()
        ? <Navigate to={`/${userName}/about`} replace />
        : (
          <>
            <PublicHomeHeader />
            {renderProfile(user)}
            <PublicHomeFooter />
          </>
        )}
    </div>
  );
}

export default PublicProfile;
