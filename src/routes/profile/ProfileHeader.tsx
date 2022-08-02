import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Image, Tab, Tabs,
} from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

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
function ProfileHeader() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');

  const handleChange = (tab: string) => {
    navigate(`/${params.userName}/${tab}`);
  };
  return (
    <div className="bg-dark bg-mobile-transparent rounded">
      <div className="d-flex bg-dark justify-content-between p-md-4 px-2 py-2">
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
          <Button size="lg" className="btn btn-form bg-black w-100 rounded-5 d-flex py-2">
            {queryParam === 'self' ? (
              <>
                <FontAwesomeIcon icon={solid('pen')} className="me-2" />
                <h3 className="mb-0">Edit profile</h3>
              </>
            )
              : <h3 className="mb-0">Unfriend</h3>}
          </Button>
        </div>
      </div>
      <StyledBorder className="d-md-block d-none" />
      <div className="px-4">
        <StyleTabs
          onSelect={(tab: any) => handleChange(tab)}
          defaultActiveKey="posts"
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
