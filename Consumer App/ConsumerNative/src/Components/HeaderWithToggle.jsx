import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const HeaderWithToggle = ({ username = 'Hashim Ali' }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSavePassword = () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    Alert.alert('Success', 'Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <View style={styles.headerContainer}>
      {/* Left: Toggle button */}
      <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
        <Icon name="menu" size={26} color="#fff" />
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Dashboard</Text>

      {/* Right: User icon */}
      <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
        <Image
          source={{ uri: 'https://via.placeholder.com/40' }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {/* Offcanvas Menu */}
      {menuVisible && (
        <Animated.View style={styles.offCanvas}>
          <View style={styles.profileSection}>
            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('ProfileScreen', { username });
              }}
            >
              <Image
                source={{ uri: 'https://via.placeholder.com/80' }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <Text style={styles.username}>{username}</Text>
          </View>

          {/* Reset Password Section */}
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
            style={styles.saveButton}
            onPress={handleSavePassword}
          >
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

export default HeaderWithToggle;

const styles = StyleSheet.create({
  headerContainer: {
    height: 60,
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    position: 'relative',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  offCanvas: {
    position: 'absolute',
    top: 60,
    right: 0,
    width: 280,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    elevation: 10,
    padding: 15,
    zIndex: 999,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  username: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  saveText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '700',
  },
});
