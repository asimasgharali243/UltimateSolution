// views/Login/AuthLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { Formik } from 'formik';
import * as Yup from 'yup';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const AuthLogin = ({ ...rest }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard/default';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  return (
    <>
      <Formik
        initialValues={{
          username: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          username: Yup.string().required('Username is required'),
          password: Yup.string().max(255).required('Password is required')
        })}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            const result = await dispatch(
              loginUser({
                UserName: values.username,
                Password: values.password
              })
            ).unwrap();

            if (result.success) {
              navigate(from, { replace: true });
            }
          } catch (error) {
            setErrors({ submit: error });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit} {...rest}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              error={Boolean(touched.username && errors.username)}
              fullWidth
              helperText={touched.username && errors.username}
              label="Username"
              margin="normal"
              name="username"
              onBlur={handleBlur}
              onChange={handleChange}
              type="text"
              value={values.username}
              variant="outlined"
              disabled={loading}
            />

            <FormControl fullWidth error={Boolean(touched.password && errors.password)} sx={{ mt: theme.spacing(3), mb: theme.spacing(1) }}>
              <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
              <OutlinedInput
                id="outlined-adornment-password"
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                name="password"
                onBlur={handleBlur}
                onChange={handleChange}
                label="Password"
                disabled={loading}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      size="large"
                      disabled={loading}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {touched.password && errors.password && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.password}
                </Typography>
              )}
            </FormControl>

            {/* <Grid container justifyContent="flex-end">
              <Grid item>
                <Typography variant="subtitle2" color="primary" sx={{ textDecoration: 'none', cursor: 'pointer' }}>
                  Forgot Password?
                </Typography>
              </Grid>
            </Grid> */}

            {errors.submit && (
              <Box mt={3}>
                <Alert severity="error">{errors.submit}</Alert>
              </Box>
            )}

            <Box mt={2}>
              <Button
                color="primary"
                disabled={loading || isSubmitting}
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                startIcon={loading || isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {loading || isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </Box>

            <Box mt={2} textAlign="center">
              <Typography variant="body2" color="textSecondary">
                Developed by :{' '}
                <Link
                  to="https://www.ultsol.biz"
                  style={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    fontWeight: 500
                  }}
                >
                  Ultimate Solutions
                </Link>
              </Typography>
            </Box>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthLogin;
