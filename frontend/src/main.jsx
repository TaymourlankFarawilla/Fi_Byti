import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { setupClientApiMock } from './services/clientApiMock.js';

// Setup client API fallback interceptor for static GitHub Pages hosting
setupClientApiMock();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
