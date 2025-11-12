// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

// assets
import 'assets/scss/style.scss';

// project import
import App from 'layout/App';
import store from './store/store';
import * as serviceWorker from 'serviceWorker';

const root = createRoot(document.getElementById('root'));

// ==============================|| MAIN - REACT DOM RENDER  ||============================== //

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter basename={import.meta.env.VITE_APP_BASE_NAME}>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
