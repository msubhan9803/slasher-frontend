import React from 'react';
import styled from 'styled-components';
import UserMessageList from '../../../../components/ui/UserMessageList/UserMessageList';
import UserMessageListItem from '../../../../components/ui/UserMessageList/UserMessageListItem';
import slasherLogo from '../../../../placeholder-images/placeholder-user.jpg';

const RowLine = styled.div`
  border: 0.063rem solid #171718;
`;

function DatingRecentMessages() {
  return (
    <UserMessageList>
      <UserMessageListItem
        userName="Maureen Biologist"
        message="We ask only to be reassured"
        count={6}
        image={slasherLogo}
      />
      <RowLine />
      <UserMessageListItem
        userName="Teri Dactyl"
        message="There was a knock on the door and "
        count={6}
        image={slasherLogo}
      />
    </UserMessageList>
  );
}

export default DatingRecentMessages;
