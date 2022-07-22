import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ExperienceListItem from './ExperienceListItem';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

const postcastItems = [
  { image: 'https://i.pravatar.cc/300?img=20', title: 'The No Sleep Podcast' },
  { image: 'https://i.pravatar.cc/300?img=13', title: 'The Small Amount of Sleep Podcast' },
  { image: 'https://i.pravatar.cc/300?img=24', title: 'The Wide Awake Thanks To Coffee Podcast' },
];

function Podcasts() {
  return (
    <>
      <SidebarHeaderWithLink headerLabel="Podcasts" linkLabel="See All" linkTo="/" />
      <div className="p-3 bg-dark rounded-3">
        <Row>
          {postcastItems.map((podcastItem) => (
            <Col xs="4" key={podcastItem.title}>
              <ExperienceListItem
                image={podcastItem.image}
                title={podcastItem.title}
              />
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}

export default Podcasts;
