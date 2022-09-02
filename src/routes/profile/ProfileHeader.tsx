import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Image, Row,
} from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import RoundButton from '../../components/ui/RoundButton';
import TabLinks from '../../components/ui/Tabs/TabLinks';
import postImage from '../../images/about-post.jpg';
import CustomPopover from '../../components/ui/CustomPopover';

const ProfileImage = styled(Image)`
  height:3.125rem;
  width:3.125rem;
`;
const AboutProfileImage = styled(Image)`
  border:0.25rem solid #1B1B1B;
  height:11.25rem;
  width:11.25rem;
`;
const StyledBorder = styled.div`
  border-top: .063rem solid #3A3B46
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
  aspectRatio: '1.78'
`;
const RoundDiv = styled.div`
  border-top-left-radius:50%;
  border-top-right-radius:50%;
`;
function ProfileHeader({ tabKey }: any) {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const popoverOption = ['Report', 'Block user'];
  const handlePopoverOption = (value: string) => {
    navigate(`/home/${value}`);
  };
  const changeTab = (tab: string) => {
    navigate(`/${params.userName}/${tab}`);
  };

  return (
    <div className="bg-dark bg-mobile-transparent rounded">
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
                <AboutProfileImage src="https://i.pravatar.cc/300?img=12" className="rounded-circle" />
                {queryParam !== 'self'
                  && (
                    <CustomPopover
                      popoverOptions={popoverOption}
                      onPopoverClick={handlePopoverOption}
                    />
                  )}
              </CustomCol>
              <Col className="w-100 mt-md-4">
                <Row className="d-flex justify-content-between">
                  <Col xs={12} md={6} lg={12} xl={6} className="text-center text-md-start text-lg-center text-xl-start  mt-4 mt-md-0 ps-md-0">
                    <h1 className="mb-md-0">Aly khan</h1>
                    <p className="fs-5  text-light">@aly-khan</p>
                  </Col>
                  <Col xs={12} md={6} lg={12} xl={6}>
                    {queryParam === 'self'
                      && (
                        <div className="d-flex justify-content-md-end justify-content-lg-center justify-content-xl-end justify-content-center">
                          <RoundButton className="btn btn-form bg-black rounded-5 d-flex px-4 py-2">
                            <FontAwesomeIcon icon={solid('pen')} className="me-2 align-self-center" />
                            <h3 className="mb-0"> Edit profile</h3>
                          </RoundButton>
                        </div>
                      )}
                    {queryParam !== 'self'
                      && (
                        <div className="d-flex align-items-center justify-content-md-end justify-content-lg-center justify-content-xl-end justify-content-center">
                          <Button className="btn btn-form bg-black rounded-5 d-flex px-4 me-2">
                            <h3 className="mb-0">Unfriend</h3>
                          </Button>
                          <CustomPopover
                            popoverOptions={popoverOption}
                            onPopoverClick={handlePopoverOption}
                          />
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
                <ProfileImage src="https://i.pravatar.cc/300?img=12" className="rounded-circle me-2" />
              </div>
              <div>
                <p className="fs-3 mb-0">@aly-khan</p>
                <p className="fs-5 text-light mb-0">Aly khan</p>
              </div>
            </div>

            <div className="align-self-center">
              {queryParam === 'self'
                && (
                  <RoundButton className="btn btn-form bg-black w-100 rounded-5 d-flex px-4 py-2">
                    <FontAwesomeIcon icon={solid('pen')} className="me-2 align-self-center" />
                    <h3 className="mb-0"> Edit profile</h3>
                  </RoundButton>
                )}
              {queryParam !== 'self'
                && (
                  <div className="d-flex align-items-center">
                    <Button className="btn btn-form bg-black w-100 rounded-5 d-flex px-4 text-white">
                      <h3 className="mb-0">Unfriend</h3>
                    </Button>
                    <CustomPopover
                      popoverOptions={popoverOption}
                      onPopoverClick={handlePopoverOption}
                    />
                  </div>
                )}
            </div>
          </RoundDiv>
        )}

      <StyledBorder className="d-md-block d-none" />
      <TabLinks tabLink={tabs} setSelectedTab={changeTab} selectedTab={tabKey} className="px-md-4 justify-content-between" />
    </div>
  );
}

export default ProfileHeader;
