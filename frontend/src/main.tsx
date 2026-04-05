import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Define your text overrides here
const localization = {
  signIn: {
    start: {
      title: "Sign in to Rental Manager",
    },
  },
  signUp: {
    start: {
      title: "Create your Rental Manager account",
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ClerkProvider 
    publishableKey={publishableKey} 
    localization={localization} // Text changes happen here
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>
);