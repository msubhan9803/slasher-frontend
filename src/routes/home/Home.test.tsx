import React from 'react';
import { render, screen } from '@testing-library/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createMemoryHistory } from 'history'; // TODO: remove temporary eslint ignore above
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import Home from './Home';
import { store } from '../../redux/store';

test('renders the expected text', () => {
  const history = createMemoryHistory();
  render(
    <Provider store={store}>
      <Router location={history.location} navigator={history}>
        <Home />
      </Router>
    </Provider>,
  );
  const linkElement = screen.getByText(/Suggested friends/i);
  expect(linkElement).toBeInTheDocument();
});
