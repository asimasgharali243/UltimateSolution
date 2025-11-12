// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import axios from 'axios';
import ENV from '../env';
import { getUserDBConnection, createUserTable, insertUser, getUser } from '../utils/User_DB';

const API_URL = ENV.BaseURL + '/api/User';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  // For dialog alerts (with buttons)
  const showDialog = (message, type = ALERT_TYPE.INFO, title = null, onConfirm = null) => {
    const alertTitle = title || getDefaultTitle(type);
    
    const alertConfig = {
      type: type,
      title: alertTitle,
      textBody: message,
      button: 'OK',
      closeOnOverlayTap: true,
      autoClose: false,
    };

    // Add onPressButton if onConfirm is provided
    if (onConfirm) {
      alertConfig.onPressButton = onConfirm;
    }

    Dialog.show(alertConfig);
  };

  // For toast notifications (auto-close)
  const showToast = (message, type = ALERT_TYPE.INFO, title = null) => {
    const alertTitle = title || getDefaultTitle(type);
    
    Toast.show({
      type: type,
      title: alertTitle,
      textBody: message,
      autoClose: 2000, // Auto close after 2 seconds
    });
  };

  const getDefaultTitle = (type) => {
    switch (type) {
      case ALERT_TYPE.SUCCESS: return 'Success';
      case ALERT_TYPE.DANGER: return 'Error';
      case ALERT_TYPE.WARNING: return 'Warning';
      default: return 'Information';
    }
  };

  const handleLogin = async () => {
    if (!username || !password || !pin) {
      showDialog('Please fill all fields.', ALERT_TYPE.WARNING, 'Missing Fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API_URL, {
        userName: username,
        password: password,
        pin: pin,
      });

      // Use toast for success message (auto-closes)
      showToast('Login successful!', ALERT_TYPE.SUCCESS, 'Success');
      
      // Store user in database and navigate
      const db = await getUserDBConnection();
      await createUserTable(db);
      await insertUser(db, response.data.userId, username);

      const user = await getUser(db);
      
      // Small delay to show success message before navigating
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'Home', 
            params: { 
              userName: user.username,
              userId: response.data.userId 
            }
          }],
        });
      }, 1500);

    } catch (error) {
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Use dialog for errors (requires user action)
      showDialog(errorMessage, ALERT_TYPE.DANGER, 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/digital_weight.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Weight Reader App</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Icon name="account" size={24} color={colors.primary} style={styles.icon} />
            <TextInput
              placeholder="Username"
              placeholderTextColor={colors.textLight}
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="lock" size={24} color={colors.primary} style={styles.icon} />
            <TextInput
              placeholder="Password"
              placeholderTextColor={colors.textLight}
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="numeric" size={24} color={colors.primary} style={styles.icon} />
            <TextInput
              placeholder="PIN"
              placeholderTextColor={colors.textLight}
              style={styles.input}
              keyboardType="numeric"
              value={pin}
              onChangeText={setPin}
              maxLength={6}
              editable={!loading}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>Secure Access • Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
  },
  title: {
    fontSize: 22,
    color: colors.textDark,
    fontWeight: '700',
    marginTop: 10,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textDark,
    paddingVertical: 12,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerText: {
    marginTop: 30,
    color: colors.footer,
    fontSize: 13,
  },
});

export default LoginScreen;