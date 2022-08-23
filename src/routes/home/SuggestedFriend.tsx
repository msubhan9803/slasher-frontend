import React, { useState } from 'react';
import styled from '@emotion/styled';
import {
  Button, Col, Image, Row,
} from 'react-bootstrap';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import RoundButton from '../../components/ui/RoundButton';

interface Props {
  id: number;
  profileImage: string;
  userName: string;
  addFriend: boolean;

}
const ProfileImage = styled(Image)`
  height:6.25rem;
  width:6.25rem;
  border:.12rem solid #FFFFFF;
`;

const StyleFriend = styled(Row)`
  overflow-x: auto;
  overflow-y: hidden;
  .casts-image {
    aspect-ratio: 1;
  }
  &::-webkit-scrollbar {
    display: none;
}
`;
const CancelRequestButton = styled(RoundButton)`
  display: inline-block;
  white-space: nowrap;
  border: 0.063rem solid #3A3B46;
  &:hover {
  border: 0.063rem solid #3A3B46;
  }
`;
const ButtonContainer = styled.div`
  width:100%;
  text-align: center;
`;
const friendList = [
  {
    id: 1, profileImage: 'https://i.pravatar.cc/300?img=23', userName: 'Olive Yew', addFriend: false,
  },
  {
    id: 2, profileImage: 'https://i.pravatar.cc/300?img=13', userName: 'Olive Yew', addFriend: true,
  },
  {
    id: 3, profileImage: 'https://i.pravatar.cc/300?img=14', userName: 'Olive Yew', addFriend: false,
  },
  {
    id: 4, profileImage: 'https://i.pravatar.cc/300?img=35', userName: 'Olive Yew', addFriend: false,
  },
  {
    id: 5, profileImage: 'https://i.pravatar.cc/300?img=28', userName: 'Olive Yew', addFriend: false,
  },
  {
    id: 6, profileImage: 'https://i.pravatar.cc/300?img=22', userName: 'Olive Yew', addFriend: false,
  },
];

const slideFriendRight = () => {
  const slider = document.getElementById('slideFriend');
  if (slider !== null) {
    slider.scrollLeft += 300;
  }
};
const slideFriendLeft = () => {
  const slider = document.getElementById('slideFriend');
  if (slider !== null) {
    slider.scrollLeft -= 300;
  }
};
function SuggestedFriend() {
  const [friendListData, setFriendListData] = useState(friendList);
  const toggleAddFriendButton = (id: number) => {
    const data = friendListData.map((datas: Props) => {
      if (datas.id === id) {
        return { ...datas, addFriend: !datas.addFriend };
      }
      return datas;
    });
    setFriendListData(data);
  };
  return (
    <div className="p-md-4 pt-md-1 rounded-2">
      <div className="d-flex align-items-center">
        <Button className="d-block ps-0 prev bg-transparent border-0 shadow-none" onClick={slideFriendLeft}>
          <FontAwesomeIcon icon={solid('chevron-left')} size="lg" className="text-white" />
        </Button>
        <StyleFriend
          id="slideFriend"
          className="d-flex flex-nowrap w-100"
        >
          {friendListData.map((user: any) => (
            <Col xs={6} md={3} lg={6} xl={4} xxl={3} key={user.id}>
              <div className="bg-dark rounded p-3">
                <div className=" d-flex justify-content-center position-relative">
                  <ProfileImage src={user.profileImage} className="rounded-circle" />
                  <div className="position-absolute" style={{ right: '0' }}>
                    <FontAwesomeIcon role="button" icon={solid('xmark')} size="lg" />
                  </div>
                </div>
                <p className="text-center my-2">{user.userName}</p>
                {user.addFriend
                  ? (
                    <ButtonContainer>
                      <CancelRequestButton className="bg-black fs-3 w-100 text-center text-white px-2" onClick={() => toggleAddFriendButton(user.id)}>
                        Cancel Request
                      </CancelRequestButton>
                    </ButtonContainer>
                  )
                  : (
                    <RoundButton className="w-100 fs-3" onClick={() => toggleAddFriendButton(user.id)}>
                      Add friend
                    </RoundButton>
                  )}
              </div>
            </Col>
          ))}
        </StyleFriend>
        <Button className="d-block pe-0 next bg-transparent border-0 shadow-none" onClick={slideFriendRight}>
          <FontAwesomeIcon icon={solid('chevron-right')} size="lg" className="text-white" />
        </Button>
      </div>
    </div>

  );
}

export default SuggestedFriend;
