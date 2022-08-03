import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Image, OverlayTrigger, Popover, Tab, Tabs,
} from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import RoundButton from '../../components/ui/RoundButton';

const ProfileImage = styled(Image)`
  height:3.125rem;
  width:3.125rem;
`;
const StyledBorder = styled.div`
  border-top: .063rem solid #3A3B46
`;
const StyleTabs = styled(Tabs)`
  overflow-x: auto;
  overflow-y: hidden;
  .nav-link {
    width: max-content;
    padding-bottom: 1rem;
    border: none;
    color: #ffffff;
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
    svg{
      color: var(--bs-primary);
    }
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
      <div className="d-flex bg-dark justify-content-between p-md-3 p-2">
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
