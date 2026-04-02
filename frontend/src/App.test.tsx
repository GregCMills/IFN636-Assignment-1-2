import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import App from './App';

vi.mock('axios', () => ({
  default: {
    create: () => ({
      get: vi.fn(),
      post: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    })
  }
}));

vi.mock('./context/AuthContext', () => ({
  useAuth: () => ({ user: null, login: vi.fn(), logout: vi.fn() }),
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

test('renders the navbar', () => {
  render(<App />);
  const navLink = screen.getByText(/Rental Equipment Application/i);
  expect(navLink).toBeInTheDocument();
});