import React, { useState } from 'react';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerContentComponentProps } from '@react-navigation/drawer';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AccountLedgerScreen from './src/screens/AccountLedgerScreen';
import DueBillsScreen from './src/screens/DueBillsScreen';
import BillDetailScreen from './src/screens/BillDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// ✅ Types
type RootStackParamList = {
  Login: undefined;
  Main: { userName: string; consumerID: number };
  BillDetailScreen: { bill: any };
};

// In your navigation types, add BillDetailScreen parameters
type DrawerParamList = {
  Dashboard: { userName: string; consumerID: number };
  AccountLedger: { userName: string; consumerID: number };
  DueBillsScreen: { userName: string; consumerID: number };
  BillDetailScreen: { bill: any }; // Add this line
  ProfileScreen: { userName: string; consumerID: number };
};
// ✅ Stack & Drawer
const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();
const { height } = Dimensions.get('window');

// ✅ Custom Drawer Content
function CustomDrawerContent({
  navigation,
  state,
  route,
}: DrawerContentComponentProps & { route?: any }) {
  const userName = route?.params?.userName ?? 'Guest';
  const userImage = route?.params?.userImage ?? null;
  const firstLetter = userName[0].toUpperCase();
  const [activeRoute, setActiveRoute] = useState('Dashboard');

  const menuItems = [
    {
      name: 'Dashboard',
      icon: 'dashboard',
      label: 'Dashboard',
      screen: 'Dashboard'
    },
    {
      name: 'AccountLedger',
      icon: 'book',
      label: 'Account Ledger',
      screen: 'AccountLedger'
    },
    {
      name: 'DueBillsScreen',
      icon: 'file-text',
      label: 'Due Bills',
      screen: 'DueBillsScreen'
    },
    {
      name: 'ProfileScreen',
      icon: 'user',
      label: 'Profile Settings',
      screen: 'ProfileScreen'
    },
  ];

  const handleNavigation = (screenName: string) => {
    setActiveRoute(screenName);
    navigation.navigate(screenName);
  };

  const handleLogout = () => {
    // You can add confirmation dialog here
    navigation.navigate('Login');
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Profile Section - Single Row */}
      <View style={styles.profileSection}>
        <View style={styles.profileRow}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            {userImage ? (
              <Image source={{ uri: userImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profileInitial}>{firstLetter}</Text>
              </View>
            )}
          </View>

          {/* User Info */}
          <View style={styles.userInfoContainer}>
            <Text style={styles.username}>{userName}</Text>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <View style={styles.statusContainer}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu Buttons */}
      <View style={styles.menuSection}>
        <Text style={styles.menuTitle}>MAIN NAVIGATION</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.drawerButton,
              activeRoute === item.screen && styles.activeDrawerButton
            ]}
            onPress={() => handleNavigation(item.screen)}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <View style={[
                styles.iconContainer,
                activeRoute === item.screen && styles.activeIconContainer
              ]}>
                <Icon 
                  name={item.icon} 
                  size={16} 
                  color={activeRoute === item.screen ? '#fff' : '#007bff'} 
                />
              </View>
              <Text style={[
                styles.drawerButtonText,
                activeRoute === item.screen && styles.activeDrawerButtonText
              ]}>
                {item.label}
              </Text>
            </View>
            {activeRoute === item.screen && (
              <View style={styles.activeIndicator}>
                <Icon name="chevron-right" size={10} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Section - Fixed at bottom */}
      <View style={styles.bottomSection}>
        <View style={styles.divider} />
        
        {/* Support & Logout Buttons */}
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity
            style={[styles.bottomButton, styles.supportButton]}
            activeOpacity={0.8}
          >
            <View style={styles.bottomButtonContent}>
              <Icon name="headphones" size={14} color="#007bff" />
              <Text style={styles.supportButtonText}>Support</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomButton, styles.logoutButton]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.bottomButtonContent}>
              <Icon name="sign-out" size={14} color="#fff" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Your Company</Text>
        </View>
      </View>
    </View>
  );
}

// ✅ Drawer Navigator
// ✅ Drawer Navigator (only visible menu screens)
function DrawerNavigator({ route }: { route: RouteProp<RootStackParamList, 'Main'> }) {
  const userName = route?.params?.userName ?? 'Guest';
  const consumerID = route?.params?.consumerID ?? 0;

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawerContent
          {...props}
          route={{ params: { userName, consumerID } }}
        />
      )}
      screenOptions={{
        headerStyle: { 
          backgroundColor: '#007bff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        drawerType: 'slide',
        drawerStyle: {
          width: 300,
        },
        swipeEnabled: true,
      }}
    >
      {/* These appear in the Drawer */}
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        initialParams={{ userName, consumerID }}
        options={{
          title: 'Dashboard Overview',
          drawerIcon: ({ color, size }) => (
            <Icon name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="AccountLedger"
        component={AccountLedgerScreen}
        initialParams={{ userName, consumerID }}
        options={{
          title: 'Account Ledger',
          drawerIcon: ({ color, size }) => (
            <Icon name="book" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="DueBillsScreen"
        component={DueBillsScreen}
        initialParams={{ userName, consumerID }}
        options={{
          title: 'Due Bills',
          drawerIcon: ({ color, size }) => (
            <Icon name="file-text" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        initialParams={{ userName, consumerID }}
        options={{
          title: 'Profile Settings',
          drawerIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

// ✅ Main App
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={DrawerNavigator}
          options={{ headerShown: false }}
        />
        {/* 👇 BillDetailScreen stays in the stack, not in Drawer */}
        <Stack.Screen
          name="BillDetailScreen"
          component={BillDetailScreen}
          options={{
            title: 'Bill Details',
            headerStyle: { backgroundColor: '#007bff' },
            headerTintColor: '#fff',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



// ✅ Enhanced Professional Styles with Single Row Profile
const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 20,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#007bff',
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#007bff',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  profileInitial: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#28a745',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  menuSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  menuTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6c757d',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: 5,
  },
  drawerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activeDrawerButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  drawerButtonText: {
    color: '#495057',
    fontWeight: '600',
    fontSize: 15,
  },
  activeDrawerButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  activeIndicator: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 4,
    borderRadius: 8,
    marginLeft: 5,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 'auto',
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginBottom: 15,
  },
  bottomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  bottomButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  supportButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  bottomButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportButtonText: {
    color: '#007bff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  versionContainer: {
    alignItems: 'center',
  },
  versionText: {
    color: '#6c757d',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  copyrightText: {
    color: '#adb5bd',
    fontSize: 10,
  },
});