import React from 'react';
import { render, screen } from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createMemoryHistory } from 'history'; // TODO: remove temporary eslint ignore above
import { Router } from 'react-router-dom';
import Home from './Home';

test('renders the expected text', () => {
  const history = createMemoryHistory();
  render(
    <Router location={history.location} navigator={history}>
      <Home />
    </Router>,
  );
  const linkElement = screen.getByText(/Suggested friends/i);
  expect(linkElement).toBeInTheDocument();
});
