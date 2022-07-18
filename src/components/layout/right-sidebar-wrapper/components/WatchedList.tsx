import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ExperienceListItem from './ExperienceListItem';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

const watchListItems = [
  {
    image: 'https://i.pravatar.cc/300?img=56', title: 'Dreamcatcher: Get ready for a killer night out', year: 2022, rating: 3.0, thumbRating: 'up',
  },
  {
    image: 'https://i.pravatar.cc/300?img=57', title: 'Short title', year: 2021, rating: 2.1, thumbRating: 'down',
  },
  {
    image: 'https://i.pravatar.cc/300?img=58', title: 'Medium length title', year: 1980, rating: 4.9, thumbRating: 'up',
  },
];

function WatchedList() {
  return (
    <div>
      <SidebarHeaderWithLink headerLabel="Watched list" linkLabel="See All" linkTo="/" />
      <div className="p-3 bg-dark rounded-3">
        <Row>
          {watchListItems.map((watchListItem) => (
            <Col xs="4" key={watchListItem.title}>
              <ExperienceListItem
                image={watchListItem.image}
                title={watchListItem.title}
                year={watchListItem.year}
                numericRating={watchListItem.rating}
                thumbRating={watchListItem.thumbRating as 'up' | 'down'}
              />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
}

export default WatchedList;
