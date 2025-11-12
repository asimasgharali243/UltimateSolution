import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ENV from '../env';
import { useRoute } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform } from 'react-native';

export default function ProfileScreen({ navigation }) {
  const route = useRoute();
  const [username] = useState(route.params.userName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Get first letter of username for fallback
  const getInitial = () => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  // Check if image exists in storage
  const checkExistingImage = async () => {
    try {
      const imagePath = `${RNFS.DocumentDirectoryPath}/${username}_profile.jpg`;
      const exists = await RNFS.exists(imagePath);
      if (exists) {
        setProfileImage(`file://${imagePath}`);
      }
    } catch (error) {
      console.log('No existing profile image found');
    }
  };

  useEffect(() => {
    checkExistingImage();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'App Camera Permission',
            message: 'App needs access to your camera',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const selectImage = async () => {
    setImageLoading(true);

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission denied',
        'Camera permission is required to select images',
      );
      setImageLoading(false);
      return;
    }

    const options = {
      title: 'Select Profile Picture',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      includeBase64: false,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', 'Failed to select image');
      } else if (response.assets && response.assets[0]) {
        const source = response.assets[0];

        try {
          // Save image to local storage
          const imagePath = `${RNFS.DocumentDirectoryPath}/${username}_profile.jpg`;
          await RNFS.copyFile(source.uri, imagePath);
          setProfileImage(`file://${imagePath}`);
          Alert.alert('Success', 'Profile picture updated successfully');
        } catch (error) {
          console.log('Error saving image:', error);
          Alert.alert('Error', 'Failed to save profile picture');
        }
      }
      setImageLoading(false);
    });
  };

  const handleSave = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${ENV.BaseURL}/api/Auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: username,
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message);
        setCurrentPassword('');
        setNewPassword('');
      } else {
        Alert.alert('Error', data.message || 'Password update failed.');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again later.');
      console.error('Reset password error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Profile Image Section */}
      <TouchableOpacity onPress={selectImage} style={styles.imageContainer}>
        {imageLoading ? (
          <View style={[styles.profileImage, styles.loadingContainer]}>
            <ActivityIndicator size="small" color="#007bff" />
          </View>
        ) : profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.initialContainer}>
            <Text style={styles.initialText}>{getInitial()}</Text>
          </View>
        )}
        <View style={styles.cameraIconContainer}>
          <Text style={styles.cameraIcon}>📷</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.imageHint}>Tap to change profile picture</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput style={styles.input} value={username} editable={false} />

      <Text style={styles.label}>Current Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Enter current password"
      />

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Enter new password"
      />

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.disabledButton]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'Updating...' : 'Save Password'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
  },
  initialContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  initialText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#007bff',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraIcon: {
    fontSize: 16,
  },
  imageHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
    fontSize: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    color: '#333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
