import React from 'react';
import { Image } from 'react-bootstrap';
import styled from 'styled-components';
import CustomPopover from '../../../../components/ui/CustomPopover';

interface LikesUserCardProps {
  likesDetail: SubscriberListProps;
  popoverOptions: string[];
  handlePopover: (value: string) => void;
}
interface SubscriberListProps {
  id: number;
  imageUrl: string;
  name: string;
  email: string;
}
const Container = styled.div`
  background: #171717;
  @media (max-width: 991px) {
    background: #1B1B1B;
  }
`;
const ProfileImage = styled(Image)`
  height: 2.667rem;
  width: 2.667rem;
`;
function LikesUserCard({ likesDetail, popoverOptions, handlePopover }: LikesUserCardProps) {
  return (
    <Container className="d-flex p-3 justify-content-between w-100 rounded mb-3">
      <div className="d-flex align-items-center">
        <ProfileImage src={likesDetail.imageUrl} className="rounded-circle me-2" />
        <div>
          <h1 className="h3 mb-0">{likesDetail.name}</h1>
          <p className="fs-6 mb-0 text-light">{likesDetail.email}</p>
        </div>
      </div>
      <div className="d-flex align-self-center">
        <CustomPopover popoverOptions={popoverOptions} onPopoverClick={handlePopover} />
      </div>
    </Container>
  );
}

export default LikesUserCard;
