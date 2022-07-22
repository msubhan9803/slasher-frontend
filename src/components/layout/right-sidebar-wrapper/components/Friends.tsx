import React from 'react';
import { Row, Col } from 'react-bootstrap';
import FriendCircleWithLabel from './FriendCircleWithLabel';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

const friends = [
  { image: 'https://i.pravatar.cc/300?img=3', userName: 'Robert.Plant' },
  { image: 'https://i.pravatar.cc/300?img=11', userName: 'Jimmy_Page' },
  { image: 'https://i.pravatar.cc/300?img=6', userName: 'john.bonham' },
  { image: 'https://i.pravatar.cc/300?img=12', userName: 'John-Paul-Jones' },
  { image: 'https://i.pravatar.cc/300?img=8', userName: 'jason.bonham' },
  { image: 'https://i.pravatar.cc/300?img=52', userName: 'Paul-Martinez' },
];

function Friends() {
  return (
    <>
      <SidebarHeaderWithLink headerLabel="Friends" linkLabel="See All" linkTo="/" />
      <div className="p-3 bg-dark rounded-3">
        <Row>
          {friends.map((photo, i) => (
            <Col xs="4" key={photo.image} className={i > 2 ? 'mt-3' : ''}>
              <FriendCircleWithLabel
                className="mx-auto"
                photo={photo.image}
                label={photo.userName}
                photoAlt={`${i}`}
                linkTo="/"
              />
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}

export default Friends;
