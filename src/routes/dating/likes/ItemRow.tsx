import React from 'react';
import styled from 'styled-components';
import { Button, Image } from 'react-bootstrap';
import SlasherQuestionMark from '../../../images/slasher-question-mark.png';
import CustomPopover from '../../../components/ui/CustomPopover';

const ProfileImage = styled(Image)`
  height: 3.334rem;
  width: 3.334rem;
`;
const UnsubscribeProfileImage = styled.div`
  height: 3.334rem;
  width: 3.334rem;
`;
const StyledBorder = styled.div`
  border-bottom: 1px solid #3A3B46;
  &:last-of-type {
    border-bottom: none !important;
    padding-bottom: 0 !important;
  }
`;

interface ItemRowProps {
  item: SubscriberListProps;
  popoverOptions: string[];
  handlePopover?: (value: string) => void;
  handleLikesOption?: (value: string) => void; // useful for unsubscribed probably
}
interface SubscriberListProps {
  id: number;
  imageUrl: string;
  name: string;
  email: string;
  time: string;
}

function ItemRow({
  item, handleLikesOption, popoverOptions, handlePopover,
}: ItemRowProps) {
  const shouldShowPopover = popoverOptions?.length !== 0;

  return (
    <StyledBorder key={item.id} className="d-flex justify-content-between py-2">
      <Button className="px-0 shadow-none text-white text-start d-flex align-items-center bg-transparent border-0" onClick={() => handleLikesOption && handleLikesOption('')}>
        {!item.imageUrl
          ? (
            <UnsubscribeProfileImage className="text-white d-flex justify-content-center align-items-center rounded-circle me-3">
              <Image src={SlasherQuestionMark} alt="Unsubscribed user profile question mark" />
            </UnsubscribeProfileImage>
          )
          : <ProfileImage src={item.imageUrl} className="rounded-circle me-2" />}

        <div>
          <h3 className="h3 mb-0">{item.name}</h3>
          <div className="fw-normal mb-0 text-light mt-2 fs-6">{item.time}</div>
        </div>
      </Button>
      {
        shouldShowPopover && (
        <div className="d-flex align-self-center">
          <CustomPopover
            popoverOptions={shouldShowPopover ? popoverOptions : []}
            onPopoverClick={handlePopover}
          />
        </div>
        )
      }

    </StyledBorder>
  );
}

ItemRow.defaultProps = {
  handlePopover: () => { },
  handleLikesOption: () => { },
};

export default ItemRow;
