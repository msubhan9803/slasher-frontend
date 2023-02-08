import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { Link } from 'react-router-dom';
import CircleButton from '../../../ui/CircleButton';
import UserCircleImage from '../../../ui/UserCircleImage';

interface Props {
  image: string;
  userName: string;
  className?: string;
  onRejectClick: any;
  onAcceptClick: any;
  id: string;
}

function FriendRequestItem({
  image, userName, id, className, onRejectClick, onAcceptClick,
}: Props) {
  return (
    <div className={`px-2 py-3 d-flex align-items-center rounded-3 bg-dark ${className}`}>
      <Link to={`/${userName}`} className="d-flex align-items-center flex-grow-1 text-decoration-none">
        <UserCircleImage size="2.5rem" src={image} alt="user picture" className="me-2 bg-secondary position-relative" />
        <p className="mb-0">{userName}</p>
      </Link>
      <CircleButton
        variant="black"
        className="me-2 text-success"
        icon={solid('check')}
        userId={id}
        onAcceptRejectClick={onAcceptClick}
        label="check button"
      />
      <CircleButton
        variant="black"
        className="me-2 text-primary"
        icon={solid('times')}
        userId={id}
        onAcceptRejectClick={onRejectClick}
        label="remove button"
      />
    </div>
  );
}

FriendRequestItem.defaultProps = {
  className: '',
};

export default FriendRequestItem;
