import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import CustomModal from './CustomModal';
import FriendActionButtons from './Friend/FriendActionButtons';
import { friendship } from '../../api/friends';
import { getUser } from '../../api/users';

export default function FriendshipStatusModal({
  friendShipStatusModal, setFriendShipStatusModal, friendStatus,
  setFriendStatus, setFriendData, friendData, userId,
}: any) {
  const [friendshipStatus, setFriendshipStatus] = useState<any>(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser(userId!)
      .then((res) => {
        setUser(res.data);
      });
  }, [userId]);

  useEffect(() => {
    if (friendshipStatus !== null) {
      friendship(userId).then((res) => {
        setFriendData(res.data);
        setFriendStatus(res.data.reaction);
      });
    }
  }, [friendshipStatus, setFriendData, setFriendStatus, userId]);

  return (
    <div>
      {user
        && (
          <CustomModal show={friendShipStatusModal} centered size="sm" onHide={() => setFriendShipStatusModal(false)}>
            <Modal.Header className="border-0 shadow-none justify-content-end" closeButton />
            <Modal.Body className="d-flex flex-column align-items-center text-center pt-0">
              <p className="px-3">
                Would you like to add this person as a friend?
                {' '}
                <br />
                <br />
                You can interact with posts:
                <br />
                If they contain hashtags you follow
                <br />
                or
                <br />
                If you&apos;re friends with that person
              </p>
              <FriendActionButtons
                user={user}
                friendData={friendData}
                friendStatus={friendStatus}
                setFriendshipStatus={setFriendshipStatus}
                buttonType="send-message"
              />
            </Modal.Body>
          </CustomModal>
        )}
    </div>
  );
}
