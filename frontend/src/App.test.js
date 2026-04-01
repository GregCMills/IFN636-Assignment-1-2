import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the navbar', () => {
  render(<App />);
  const navLink = screen.getByText(/Rental Equipment Application/i);
  expect(navLink).toBeInTheDocument();
});
