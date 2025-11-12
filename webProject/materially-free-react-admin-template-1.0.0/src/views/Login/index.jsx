import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';

// project import
import AuthLogin from './AuthLogin';

// assets
import Logo from 'assets/images/ultimateLogo.png';

// ==============================|| LOGIN ||============================== //

const Login = () => {
  const theme = useTheme();
  const phoneNumber = '+923006468177';

  // Array of beautiful nature background images from Unsplash
  const natureBackgrounds = [
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Mountain landscape
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Forest path
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Mountain lake
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Misty forest
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Colorful landscape
    'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Mountain river
    'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Rocky beach
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Lake mountains
    'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80', // Forest waterfall
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' // Sunrise landscape
  ];

  const [currentBackground, setCurrentBackground] = useState('');

  // Set random background on component mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * natureBackgrounds.length);
    setCurrentBackground(natureBackgrounds[randomIndex]);
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: currentBackground ? `url(${currentBackground})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for better text readability
          zIndex: 1
        }
      }}
    >
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{
          height: '100%',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 2
        }}
      >
        <Grid item xs={11} sm={7} md={6} lg={4}>
          <Card
            sx={{
              overflow: 'visible',
              display: 'flex',
              position: 'relative',
              '& .MuiCardContent-root': {
                flexGrow: 1,
                flexBasis: '50%',
                width: '50%'
              },
              maxWidth: '475px',
              margin: '24px auto',
              backgroundColor: 'rgba(255, 255, 255, 0.95)', // Semi-transparent white
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
            }}
          >
            <CardContent sx={{ p: theme.spacing(5, 4, 3, 4) }}>
              <Grid container direction="column" spacing={4} justifyContent="center">
                <Grid item xs={12}>
                  <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                      <Typography color="textPrimary" gutterBottom variant="h2">
                        Sign in
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        To keep connected with us.
                      </Typography>
                    </Grid>
                    <Grid item>
                      <RouterLink to={`https://wa.me/${phoneNumber.replace(/\D/g, '')}`} target="_blank">
                        <img
                          style={{
                            width: '150px',
                            height: '50px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                          alt="Ultimate Logo"
                          src={Logo}
                        />
                      </RouterLink>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <AuthLogin />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Login;
