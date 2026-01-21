/**
 * MAIN REACT ENTRY POINT
 * 
 * This file is the first JavaScript file executed by the browser.
 * It is responsible for:
 * 1. Importing React and ReactDOM
 * 2. Finding the HTML element (#root) created in index.html
 * 3. Creating a React root
 * 4. Rendering the <App /> component into the DOM
 * 
 * Flow: index.html → index.jsx → App.jsx → (entire React app)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
// Import the main App component that contains all routing and pages
import App from './App';

// Log that the entry point has loaded (helpful for debugging)
console.log('index.jsx loaded');

// Get the HTML element where React will mount (defined in index.html)
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

// Throw error if root element doesn't exist (prevents silent failures)
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a React root object that will manage the entire app
const root = ReactDOM.createRoot(rootElement);
console.log('React root created');

// Render the App component inside the root
// React.StrictMode helps identify potential issues during development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('App rendered');
