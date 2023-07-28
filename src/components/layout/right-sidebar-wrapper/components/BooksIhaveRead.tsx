import React from 'react';
import { Col, Row } from 'react-bootstrap';
import ExperienceListItem from './ExperienceListItem';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';

const books = [
  {
    image: 'https://i.pravatar.cc/300?img=63', title: "Salem's Lot", year: 1975, rating: 3.0, thumbRating: 'up',
  },
  {
    image: 'https://i.pravatar.cc/300?img=66', title: 'The Haunting of Hill House', year: 1959, rating: 2.1, thumbRating: 'down',
  },
  {
    image: 'https://i.pravatar.cc/300?img=69', title: "The bookiest book you'll ever book", year: 2022, rating: 4.9, thumbRating: 'up',
  },
];

function BooksIhaveRead() {
  return (
    <>
      <SidebarHeaderWithLink headerLabel="Books I've read" linkLabel="See All" linkTo="/" />
      <div className="p-3 bg-dark rounded-3">
        <Row>
          {books.map((book) => (
            <Col xs="4" key={book.title}>
              <ExperienceListItem
                image={book.image}
                title={book.title}
                year={book.year}
                numericRating={book.rating}
                // thumbRating={book.thumbRating as 'up' | 'down'}
              />
            </Col>
          ))}
        </Row>
      </div>
    </>
  );
}

export default BooksIhaveRead;
