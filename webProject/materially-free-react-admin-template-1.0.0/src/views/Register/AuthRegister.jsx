import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  FormHelperText,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import * as Yup from 'yup';
import { Formik } from 'formik';

// ==============================|| AUTH REGISTER COMPONENT ||============================== //

const AuthRegister = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleMouseDownPassword = (event) => event.preventDefault();

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard/default', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <Formik
      initialValues={{
        fullName: '',
        userName: '',
        password: ''
      }}
      validationSchema={Yup.object({
        fullName: Yup.string().max(255).required('Full Name is required'),
        userName: Yup.string()
          .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
          .min(3, 'Username must be at least 3 characters')
          .max(20, 'Username must be at most 20 characters')
          .required('Username is required'),
        password: Yup.string()
          .min(8, 'Password must be at least 8 characters')
          .max(255)
          .required('Password is required')
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase, one lowercase, and one number')
      })}
      onSubmit={async (values, { setSubmitting, setErrors }) => {
        try {
          const result = await dispatch(
            registerUser({
              userFullName: values.fullName,
              userName: values.userName,
              password: values.password
            })
          ).unwrap();

          if (result.success) navigate('/dashboard/default', { replace: true });
        } catch (err) {
          setErrors({ submit: err.message || 'Registration failed' });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            margin="normal"
            label="Full Name"
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(touched.fullName && errors.fullName)}
            helperText={touched.fullName && errors.fullName}
            disabled={loading || isSubmitting}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Username"
            name="userName"
            value={values.userName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(touched.userName && errors.userName)}
            helperText={touched.userName && errors.userName}
            disabled={loading || isSubmitting}
          />

          <FormControl
            fullWidth
            sx={{ mt: 3, mb: 1 }}
            variant="outlined"
            error={Boolean(touched.password && errors.password)}
            disabled={loading || isSubmitting}
          >
            <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? 'text' : 'password'}
              value={values.password}
              name="password"
              onBlur={handleBlur}
              onChange={handleChange}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    disabled={loading || isSubmitting}
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
            {touched.password && errors.password && <FormHelperText>{errors.password}</FormHelperText>}
          </FormControl>

          {errors.submit && (
            <Box mt={2}>
              <Alert severity="error">{errors.submit}</Alert>
            </Box>
          )}

          <Box my={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  color="primary"
                  disabled={loading || isSubmitting}
                />
              }
              label={
                <>
                  I have read the &nbsp;
                  <Link to="#" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                    Terms and Conditions
                  </Link>
                </>
              }
            />
          </Box>

          <Button
            fullWidth
            size="large"
            variant="contained"
            color="primary"
            type="submit"
            disabled={!checked || loading || isSubmitting}
            startIcon={loading || isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {loading || isSubmitting ? 'Registering...' : 'Register'}
          </Button>

          <Box mt={2} textAlign="center">
            <Typography variant="body2" color="textSecondary">
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  fontWeight: 500
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </form>
      )}
    </Formik>
  );
};

export default AuthRegister;
