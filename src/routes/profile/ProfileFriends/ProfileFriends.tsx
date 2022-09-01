import React, { useState } from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button, Col, Image, OverlayTrigger, Popover, Row,
} from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import AuthenticatedPageWrapper from '../../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import CustomSearchInput from '../../../components/ui/CustomSearchInput';
import ProfileHeader from '../ProfileHeader';

const ProfileImage = styled(Image)`
  height: 3.125rem;
  width: 3.125rem;
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
const Container = styled.div`
  background: #1F1F1F;
`;
const friendList = [
  {
    id: 1, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 2, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 3, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 4, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 5, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 6, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 7, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 8, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 9, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 10, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 11, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 12, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 13, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 14, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
  {
    id: 15, imageUrl: 'https://i.pravatar.cc/300?img=12', name: 'Benjamin Lucas', email: '@maureenbio122',
  },
];
function ProfileFriends() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('view');
  const [search, setSearch] = useState<string>('');
  const vieweOptions = ['View profile', 'Report', 'Block user'];
  const selfOptions = ['View profile', 'Message', 'Unfriend', 'Report', 'Block user'];

  const popover = (
    <CustomPopover id="popover-basic" className="py-2 rounded-2">
      {queryParam === 'self'
        ? selfOptions.map((option) => (
          <PopoverText key={option} className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">{option}</PopoverText>

        ))
        : vieweOptions.map((option) => (
          <PopoverText key={option} className="ps-4 pb-2 pe-5 pt-2 mb-0 fs-5 text-light" role="button">{option}</PopoverText>

        ))}
    </CustomPopover>
  );
  return (
    <AuthenticatedPageWrapper rightSidebarType={queryParam === 'self' ? 'profile-self' : 'profile-other-user'}>
      <ProfileHeader tabKey="friends" />
      <div className="mt-3">
        <div className="d-md-flex d-block justify-content-between">
          <div>
            <CustomSearchInput label="Search friends..." setSearch={setSearch} search={search} />
          </div>
          <div className="d-flex align-self-center mt-3 mt-md-0">
            <p className="fs-3 text-primary me-3 my-auto">310 friends</p>
          </div>
        </div>
        <div className="bg-mobile-transparent border-0 rounded-3 bg-dark mb-0 p-md-3 pb-md-1 my-3">
          <Row>
            {friendList.map((friend) => (
              <Col md={4} lg={6} xl={4} key={friend.id}>
                <Container className="d-flex p-2 justify-content-between pe-2 w-100 rounded mb-3">
                  <div>
                    <div className="d-flex align-items-center">
                      <div>
                        <ProfileImage src={friend.imageUrl} className="rounded-circle me-2" />
                      </div>
                      <div>
                        <h1 className="h3 mb-0">{friend.name}</h1>
                        <p className="fs-6 mb-0 text-light">{friend.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-self-center">
                    <StyledPopover>
                      <OverlayTrigger trigger="click" placement="left" rootClose overlay={popover}>
                        <Button variant="link" className="bg-transparent pe-0 text-white">
                          <FontAwesomeIcon role="button" icon={solid('ellipsis-vertical')} size="lg" />
                        </Button>
                      </OverlayTrigger>
                    </StyledPopover>
                  </div>
                </Container>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </AuthenticatedPageWrapper>
  );
}

export default ProfileFriends;
