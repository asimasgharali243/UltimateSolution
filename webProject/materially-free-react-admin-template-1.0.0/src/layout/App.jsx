// layout/App.js
import React, { useEffect } from 'react';

// material-ui
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// third-party
import { useSelector, useDispatch } from 'react-redux';

// project import
import theme from 'themes';
import Routes from 'routes/index';
import NavigationScroll from './NavigationScroll';
import { checkTokenExpiry } from '../store/slices/authSlice';

// ==============================|| APP ||============================== //

const TokenChecker = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check token on app start
    dispatch(checkTokenExpiry());

    // Set up periodic token check
    const interval = setInterval(() => {
      dispatch(checkTokenExpiry());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [dispatch]);

  return null;
};

const App = () => {
  const customization = useSelector((state) => state.customization);

  return (
    <>
      <TokenChecker />
      <NavigationScroll>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme(customization)}>
            <CssBaseline />
            <Routes />
          </ThemeProvider>
        </StyledEngineProvider>
      </NavigationScroll>
    </>
  );
};

export default App;
