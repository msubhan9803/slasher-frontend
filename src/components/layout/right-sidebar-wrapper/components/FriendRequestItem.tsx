import React from 'react';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import CircleButton from '../../../ui/CircleButton';
import UserCircleImage from '../../../ui/UserCircleImage';

interface Props {
  id: number;
  image: string;
  userName: string;
  className?: string;
}

function FriendRequestItem({
  id, image, userName, className,
}: Props) {
  return (
    <div key={id} className={`px-2 py-3 d-flex align-items-center rounded-3 bg-dark ${className}`}>
      <UserCircleImage size="2.5rem" src={image} className="me-2 rounded-circle bg-secondary position-relative" />
      <p className="mb-0 flex-grow-1">{userName}</p>
      <CircleButton variant="black" className="me-2 text-success" icon={solid('check')} />
      <CircleButton variant="black" className="me-2 text-primary" icon={solid('times')} />
    </div>
  );
}

FriendRequestItem.defaultProps = {
  className: '',
};

export default FriendRequestItem;
