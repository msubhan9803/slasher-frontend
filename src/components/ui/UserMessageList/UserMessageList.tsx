import React from 'react';

interface Props {
  children: React.ReactNode,
  className?: string
}

function UserMessageList({ children, className }: Props) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

UserMessageList.defaultProps = {
  className: '',
};

export default UserMessageList;
