// screens/CameraScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../styles/colors';
import { useNavigation } from '@react-navigation/native';
import PhotoManipulator from 'react-native-photo-manipulator';

const { width, height: screenHeight } = Dimensions.get('window');

const CameraScreen = () => {
  const navigation = useNavigation();
  const cameraRef = useRef(null);
  const device = useCameraDevice('back');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(false);
 
console.log(width,screenHeight);
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status === 'granted') {
        setHasPermission(true);
      } else {
        Alert.alert(
          'Permission Denied',
          'Please enable camera access in settings.'
        );
        navigation.goBack();
      }
    })();
  }, [navigation]);

const capturePhoto = async () => {
  try {
    if (!cameraRef.current || !isCameraReady) return;

    setLoading(true);
    const photo = await cameraRef.current.takePhoto({
      qualityPrioritization: 'speed',
    });

    const photoPath = `file://${photo.path}`;
    const photoWidth = photo.width;
    const photoHeight = photo.height;
    console.log('Photo dimensions:', photoWidth, photoHeight);

    // Screen dimensions and rectangle dimensions
    const rectWidth = width * 0.9; // Your rectangle is 80% of screen width
    const rectHeight = width * 0.3;
    const offsetX = (width - rectWidth) / 2;
    const offsetY = (screenHeight - rectHeight) / 2;

    // Calculate scale factors
    const scaleX = photoWidth / width;
    const scaleY = photoHeight / screenHeight;

    // Convert screen coordinates to photo coordinates
    const cropX = offsetX * scaleX;
    const cropY = offsetY * scaleY;
    const cropWidth = rectWidth * scaleX;
    const cropHeight = rectHeight * scaleY;

    console.log('Crop area:', {
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight
    });

    // Crop image using PhotoManipulator
    const croppedUri = await PhotoManipulator.crop(photoPath, {
      x: Math.round(cropX),
      y: Math.round(cropY),
      width: Math.round(cropWidth),
      height: Math.round(cropHeight),
    });

    setLoading(false);
    navigation.navigate('NonDigitalScan', { capturedImageUri: croppedUri });

  } catch (error) {
    console.error('Capture error:', error);
    setLoading(false);
    Alert.alert('Error', 'Failed to capture image.');
  }
};

  if (!hasPermission || !device) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: 'white', marginTop: 10 }}>
          {hasPermission ? 'Loading Camera...' : 'Requesting Camera Permission...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={() => setIsCameraReady(true)}
        onError={(e) => console.error('Camera error:', e)}
      />

      <View style={styles.overlay}>
        <View style={styles.rectangle} />
      </View>

       {/* Loading indicator while capturing */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: 'white', marginTop: 10 }}>Processing...</Text>
        </View>
      )}

      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <Icon name="arrow-left" size={28} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity onPress={capturePhoto} style={styles.captureButton}>
          <Icon name="camera" size={32} color={colors.white} />
        </TouchableOpacity>

        <View style={{ width: 40 }} />
      </View>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  rectangle: {
    width: width * 0.9,
    height: width * 0.3,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconButton: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 25, padding: 8 },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
