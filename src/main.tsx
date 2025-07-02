// main.tsx
// This is the entry point of the React application.
// It renders the App component into the root HTML element.

import { StrictMode } from 'react' // StrictMode helps find potential problems in the app
import { createRoot } from 'react-dom/client' // createRoot is used to render the React app
import App from './App.tsx' // Import the main App component
import './index.css' // Import global CSS styles

// Find the HTML element with id 'root' and render the App component inside it
// <StrictMode> is a wrapper that enables additional checks and warnings for its children
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
