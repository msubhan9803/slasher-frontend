import React from 'react';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import Home from './Home';
import { store } from '../../redux/store';

test('renders the expected text', () => {
  const routes = [
    {
      path: '/app/home',
      element: <Home />,
    },
  ];
  const router = createMemoryRouter(routes, {
    initialEntries: ['/', '/app/home'],
    initialIndex: 1,
  });
  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );
  const linkElement = screen.getByText(/Suggested friends/i);
  expect(linkElement).toBeInTheDocument();
});
