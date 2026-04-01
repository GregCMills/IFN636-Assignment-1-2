import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => ({
  create: () => ({
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })
}));

jest.mock('./context/AuthContext', () => ({
  useAuth: () => ({ user: null, login: jest.fn(), logout: jest.fn() }),
  AuthProvider: ({ children }) => children,
}));

test('renders the navbar', () => {
  render(<App />);
  const navLink = screen.getByText(/Rental Equipment Application/i);
  expect(navLink).toBeInTheDocument();
});