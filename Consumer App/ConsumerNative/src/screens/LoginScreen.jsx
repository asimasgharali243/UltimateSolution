import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import ENV from '../env';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Validation Error', 'Username and password are required.');
      return;
    }
    console.log(`${ENV.BaseURL}/api/auth/login`);
    setLoading(true);

    try {
      const response = await axios.post(
        `${ENV.BaseURL}/api/auth/login`,
        {
          UserName: username,
          Password: password,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );

      setLoading(false);

      if (response.status === 200) {
        Alert.alert(
          'Success',
          response.data.userName + ' ' + response.data.message,
        );

        navigation.replace('Main', {
          userName: response.data.userName,
          consumerID: response.data.consumerID,
        });
      }
    } catch (error) {
      setLoading(false);
      if (error.response) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Server is unreachable.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.jpeg')} style={styles.logo} />
      </View>

      <Text style={styles.title}>Consumer App</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
    backgroundColor: '#f5f5f5',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 100,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    color: '#333',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    height: 50,
    backgroundColor: '#1e90ff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#666',
    fontSize: 14,
  },
});
