// routes/index.js
import { useRoutes } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkTokenExpiry } from '../store/slices/authSlice';

// routes
import MainRoutes from './MainRoutes';
import AuthenticationRoutes from './AuthenticationRoutes';

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Additional token check when routes change
    dispatch(checkTokenExpiry());
  }, [dispatch]);

  return useRoutes([MainRoutes, AuthenticationRoutes]);
}
