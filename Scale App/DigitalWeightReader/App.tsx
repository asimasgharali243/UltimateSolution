import React, { useState, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AlertNotificationRoot, ALERT_TYPE, Dialog } from 'react-native-alert-notification';

import LoginScreen from './src/screens/LoginScreen';
import ScanScreen from './src/screens/Scan_Screen';
import DashboardScreen from './src/screens/DashboardScreen';
import CameraScreen from './src/screens/CameraScreen';
import NonDigitalScan from './src/screens/NonDigitalScan';
import NonDigitalCamera from './src/screens/NonDigitalCamera';
import Test from "./src/screens/test"
import SearchScreen from "./src/screens/SearchProduct"
import { ProductProvider } from './src/contexts/ProductContext'; // ADD THIS IMPORT

// Define the root stack param list
type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  CameraScreen: undefined;
  DigitalScaleScan: undefined;
  NonDigitalScan: undefined;
  NonDigitalCamera: undefined;
  Search: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  const handleLogoutPress = () => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: 'Confirm Logout',
      textBody: 'Are you sure you want to logout?',
      button: 'Logout',
      closeOnOverlayTap: true,
      autoClose: false,
      onPressButton: () => {
        // Perform logout action
        navigationRef.current?.navigate('Login');
        Dialog.hide();
      },
    });
  };

  const LogoutButton = () => (
    <TouchableOpacity
      onPress={handleLogoutPress}
      style={{ marginRight: 15, padding: 8 }}
    >
      <Icon name="power-off" size={20} color="red" />
    </TouchableOpacity>
  );

  return (
    <AlertNotificationRoot>
      {/* WRAP WITH PRODUCT PROVIDER */}
      <ProductProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Home"
              component={DashboardScreen}
              options={{
                title: 'Dashboard',
                headerRight: () => <LogoutButton />,
              }}
            />

            <Stack.Screen
              name="CameraScreen"
              component={CameraScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="DigitalScaleScan"
              component={ScanScreen}
              options={{ title: 'Digital Scale Scan' }}
            />

            <Stack.Screen
              name="NonDigitalScan"
              component={NonDigitalScan}
              options={{ title: 'Non-Digital Scan' }}
            />

            <Stack.Screen
              name="NonDigitalCamera"
              component={NonDigitalCamera}
              options={{ headerShown: false }}
            />

            <Stack.Screen 
              name="Search" 
              component={SearchScreen}
              options={{ title: 'Product Search' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ProductProvider>
    </AlertNotificationRoot>
  );
};

export default App;