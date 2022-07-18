import React from 'react';
import { Row, Col } from 'react-bootstrap';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

const photos = [
  { image: 'https://i.pravatar.cc/300?img=10' },
  { image: 'https://i.pravatar.cc/300?img=11' },
  { image: 'https://i.pravatar.cc/300?img=25' },
  { image: 'https://i.pravatar.cc/300?img=16' },
  { image: 'https://i.pravatar.cc/300?img=17' },
];

function Photos() {
  return (
    <>
      <SidebarHeaderWithLink headerLabel="Photos" linkLabel="See All" linkTo="/" />
      <div className="p-3 bg-dark rounded-3">
        <Row>
          {photos.map((photo, i) => (
            <Col xs="4" key={photo.image}>
              <img
                alt={`${i}`}
                src={photo.image}
                className={`img-fluid rounded-3 ${i > 2 ? 'mt-3' : ''}`}
              />
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}

export default Photos;
