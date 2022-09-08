import React from 'react';
import styled from 'styled-components';
import RoundButton from '../../../components/ui/RoundButton';
import UserCircleImage from '../../../components/ui/UserCircleImage';

interface Props {
  id: number;
  profile: string;
  name: string;
  email: string;
  sendMessage: boolean;
}
const SmallText = styled.p`
  font-size: .75rem;
`;
const modalData = [
  {
    id: 1, profile: 'https://i.pravatar.cc/300?img=12', name: 'John Noakes', email: '@username', sendMessage: false,
  },
  {
    id: 2, profile: 'https://i.pravatar.cc/300?img=11', name: 'Bernadette Audrey', email: '@username', sendMessage: false,
  },
  {
    id: 3, profile: 'https://i.pravatar.cc/300?img=14', name: 'Carol Ava', email: '@username', sendMessage: false,
  },
  {
    id: 4, profile: 'https://i.pravatar.cc/300?img=13', name: 'Michelle Ruth', email: '@username', sendMessage: false,
  },
  {
    id: 5, profile: 'https://i.pravatar.cc/300?img=16', name: 'Stephanie Sue', email: '@username', sendMessage: true,
  },
  {
    id: 6, profile: 'https://i.pravatar.cc/300?img=15', name: 'Christopher', email: '@username', sendMessage: true,
  },
  {
    id: 7, profile: 'https://i.pravatar.cc/300?img=18', name: 'Wendy Zoe', email: '@username', sendMessage: false,
  },
];
function LikeShareModalContent() {
  return (
    <>
      {modalData.map((data: Props) => (
        <div className="pb-4 pt-0 py-3 d-flex align-items-center" key={data.id}>
          <div>
            <UserCircleImage src={data.profile} />
          </div>
          <div className="px-3 flex-grow-1 min-width-0">
            <p className="mb-0">
              {data.name}
            </p>
            <SmallText className="text-light mb-0">{data.email}</SmallText>
          </div>
          {data.sendMessage
            ? (
              <RoundButton
                className="bg-black fw-bold text-white"
              >
                Send message
              </RoundButton>
            )
            : (
              <RoundButton
                className="fw-bold"
              >
                Add friend
              </RoundButton>
            )}
        </div>
      ))}
    </>
  );
}

export default LikeShareModalContent;
