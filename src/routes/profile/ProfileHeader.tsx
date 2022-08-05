import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Image, OverlayTrigger, Popover, Row, Tab, Tabs,
} from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import RoundButton from '../../components/ui/RoundButton';
import postImage from '../../images/about-post.jpg';

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
const StyleTabs = styled(Tabs)`
  overflow-x: auto;
  overflow-y: hidden;
  .nav-link {
    padding-bottom: 1rem !important;
    border: none;
    color: #ffffff;
    width: max-content;
    &:hover {
      border-color: transparent;
      color: var(--bs-primary);
    }
    &.active {
      color: var(--bs-primary);
      background-color: transparent;
      border-bottom:  0.188rem solid var(--bs-primary);
    }
  }
`;
const StyledPopover = styled.div`
  .btn[aria-describedby="popover-basic"]{
    svg{color: var(--bs-primary);}
  }
`;
const PopoverText = styled.p`
  &:hover {
    background: red;
  }
`;
const CustomPopover = styled(Popover)`
  z-index :1;
  background:rgb(27,24,24);
  border: 1px solid rgb(56,56,56);
  position:absolute;
  top: 0px !important;
  .popover-arrow{
    &:after{
      border-left-color:rgb(56,56,56);
    }
  }
`;
const CustomCol = styled(Col)`
  margin-top: -3.938rem;
`;
const ImageContainer = styled.div`
  aspectRatio: '1.78'
`;
const popover = (
  <CustomPopover id="popover-basic" className="py-2 rounded-2">
    <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">Report</PopoverText>
    <PopoverText className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">Block user</PopoverText>
  </CustomPopover>
);
function ProfileHeader({ tabKey }: any) {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const handleChange = (tab: string) => {
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
              <CustomCol md={3} className="text-center text-lg-start position-relative">
                <AboutProfileImage src="https://i.pravatar.cc/300?img=12" className="rounded-circle" />
                {queryParam === 'self'
                  && (
                    <StyledPopover className="d-block d-md-none position-absolute" style={{ top: '55px', right: '0px' }}>
                      <OverlayTrigger trigger="click" placement="left" rootClose overlay={popover}>
                        <Button className="bg-transparent shadow-none border-0 py-0 pe-3">
                          <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" className="ps-0" />
                        </Button>
                      </OverlayTrigger>
                    </StyledPopover>
                  )}
              </CustomCol>
              <Col className="w-100 mt-md-4">
                <Row className="d-flex justify-content-between">
                  <Col xs={12} md={6} className="text-center text-md-start mt-4 mt-md-0 ps-md-0">
                    <h1 className="mb-md-0">Aly khan</h1>
                    <p className="fs-5 mb-md-0 text-light">@aly-khan</p>
                  </Col>
                  <Col xs={12} md={6}>
                    {queryParam === 'self'
                      && (
                        <RoundButton className="btn btn-form bg-black rounded-5 d-flex px-4 py-2 ms-md-auto mx-auto me-md-1">
                          <FontAwesomeIcon icon={solid('pen')} className="me-2 align-self-center" />
                          <h3 className="mb-0"> Edit profile</h3>
                        </RoundButton>
                      )}
                    {queryParam !== 'self'
                      && (
                        <div className="d-flex align-items-center justify-content-md-end justify-content-center">
                          <Button className="btn btn-form bg-black rounded-5 d-flex px-4 me-2">
                            <h3 className="mb-0">Unfriend</h3>
                          </Button>
                          <StyledPopover className="d-none d-md-block">
                            <OverlayTrigger trigger="click" placement="left" rootClose overlay={popover}>
                              <Button className="bg-transparent shadow-none border-0 py-0 pe-1">
                                <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                              </Button>
                            </OverlayTrigger>
                          </StyledPopover>
                        </div>
                      )}
                  </Col>
                </Row>
              </Col>
            </Row>
          </Row>
        )
        : (
          <div className="d-flex justify-content-between  p-md-3 p-2">
            <div className="d-flex">
              <div>
                <ProfileImage src="https://i.pravatar.cc/300?img=12" className="rounded-circle me-2" />
              </div>
              <div>
                <p className="fs-3 mb-0">@aly-khan</p>
                <p className="fs-5 text-light mb-0">Aly khan</p>
              </div>
            </div>
            <div>
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
                    <Button className="btn btn-form bg-black w-100 rounded-5 d-flex px-4">
                      <h3 className="mb-0">Unfriend</h3>
                    </Button>
                    <StyledPopover>
                      <OverlayTrigger trigger="click" placement="left" rootClose overlay={popover}>
                        <Button className="bg-transparent shadow-none border-0 py-0">
                          <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                        </Button>
                      </OverlayTrigger>
                    </StyledPopover>
                  </div>
                )}
            </div>
          </div>
        )}
      <StyledBorder className="d-md-block d-none" />
      <div className="px-md-4">
        <StyleTabs
          onSelect={(tab: any) => handleChange(tab)}
          activeKey={tabKey}
          id="uncontrolled-tab-example"
          className="border-0 mb-4 mt-1 justify-content-between fs-3 text-light flex-nowrap"
        >
          <Tab eventKey="about" title="About" />
          <Tab eventKey="posts" title="Posts" />
          <Tab eventKey="friends" title="Friends" />
          <Tab eventKey="photos" title="Photos" />
          <Tab eventKey="watchedList" title="Watched List" />
        </StyleTabs>
      </div>
    </div>
  );
}
export default ProfileHeader;
