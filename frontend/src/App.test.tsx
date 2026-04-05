import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

vi.mock('@clerk/clerk-react', () => ({
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({ isSignedIn: false, getToken: vi.fn() }),
  useUser: () => ({ isSignedIn: false, user: null }),
  useClerk: () => ({ signOut: vi.fn() }),
  SignIn: () => <div>Sign In</div>,
  SignUp: () => <div>Sign Up</div>,
}));

test('renders the navbar', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const navLink = screen.getByText(/Login/i);
  expect(navLink).toBeInTheDocument();
});
