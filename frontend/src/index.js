import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App';
import axios from 'axios';

// Set the base URL for API requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'https://excel-analytics-platform-7n32.onrender.com';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
