// screens/CameraScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator
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
      
      // Capture photo
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'quality',
        skipMetadata: false,
        enableAutoStabilization: true,
      });

      const photoPath = `file://${photo.path}`;
      const photoWidth = photo.width;
      const photoHeight = photo.height;
      
      console.log('Photo dimensions:', photoWidth, photoHeight);
      console.log('Screen dimensions:', width, screenHeight);

      // Rectangle dimensions (matching the overlay)
      const rectWidth = width * 0.8;
      const rectHeight = width * 0.6;
      const offsetX = (width - rectWidth) / 2;
      const offsetY = (screenHeight - rectHeight) / 2;

      console.log('Rectangle position:', {
        rectWidth, rectHeight, offsetX, offsetY
      });

      // Calculate scale factors
      const scaleX = photoWidth / width;
      const scaleY = photoHeight / screenHeight;

      // Calculate crop coordinates
      const cropX = Math.round(offsetX * scaleX);
      const cropY = Math.round(offsetY * scaleY);
      const cropWidth = Math.round(rectWidth * scaleX);
      const cropHeight = Math.round(rectHeight * scaleY);

      const cropCoordinates = {
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight
      };

      console.log('Crop coordinates:', cropCoordinates);

      // Validate crop coordinates don't exceed image boundaries
      if (cropX + cropWidth > photoWidth) {
        cropCoordinates.width = photoWidth - cropX;
      }
      if (cropY + cropHeight > photoHeight) {
        cropCoordinates.height = photoHeight - cropY;
      }

      console.log('Validated crop coordinates:', cropCoordinates);

      // Crop image using PhotoManipulator
      const croppedUri = await PhotoManipulator.crop(photoPath, cropCoordinates);

      console.log('Final cropped image URI:', croppedUri);

      setLoading(false);
      
      // Navigate with cropped image
      navigation.navigate('DigitalScaleScan', { 
        capturedImageUri: croppedUri 
      });

    } catch (error) {
      console.error('Capture error:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to capture image: ' + error.message);
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
        <Text style={styles.orientationHint}>
          Align scale inside the rectangle
        </Text>
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

        <TouchableOpacity 
          onPress={capturePhoto} 
          style={styles.captureButton}
          disabled={loading}
        >
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
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  rectangle: {
    width: width * 0.8,
    height: width * 0.6,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  orientationHint: {
    position: 'absolute',
    top: 100,
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
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
  iconButton: { 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    borderRadius: 25, 
    padding: 8 
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});