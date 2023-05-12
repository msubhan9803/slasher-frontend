import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Navigate, useParams } from 'react-router';
import { Col, Row } from 'react-bootstrap';
import PublicHomeFooter from '../public-home-footer/PublicHomeFooter';
import PublicHomeHeader from '../public-home-header/PublicHomeHeader';
import ProfileAbout from '../../profile/ProfileAbout/ProfileAbout';
import PublicHomeBody from '../public-home-body/PublicHomeBody';
import { userIsLoggedIn } from '../../../utils/session-utils';
import { getPublicProfile } from '../../../api/users';
import ErrorMessageList from '../../../components/ui/ErrorMessageList';
import HeroImage from '../../../images/public-home-hero-header.png';

const StyleSection = styled.div`
background: url(${HeroImage}) top center;
padding-top:100px;
background-repeat: no-repeat;
    background-size: contain;
`;
function PublicProfie() {
  const { userName } = useParams();
  const [user, setUser] = useState<any>({});
  const [errorMessage, setErrorMessage] = useState<string[]>();
  useEffect(() => {
    getPublicProfile(userName!)
      .then((res) => {
        setUser(res.data);
      })
      .catch((error: any) => setErrorMessage(error.response.data.message));
  }, [userName]);

  return (
    <div>
      {userIsLoggedIn()
        ? <Navigate to={`/${userName}`} replace />
        : (
          <>
            <PublicHomeHeader />
            <StyleSection>
              <Row className="d-flex justify-content-center px-2">
                <Col lg={9} className="px-lg-4 px-3">
                  <PublicHomeBody>
                    <ProfileAbout user={user} loadUser={() => { }} />
                  </PublicHomeBody>
                </Col>
              </Row>
            </StyleSection>
            <ErrorMessageList errorMessages={errorMessage} divClass="mt-3 text-start" className="m-0" />
            <PublicHomeFooter />
          </>
        )}
    </div>
  );
}

export default PublicProfie;
