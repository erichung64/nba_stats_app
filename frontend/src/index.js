import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

// Load Google Fonts dynamically
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
document.head.appendChild(link);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
