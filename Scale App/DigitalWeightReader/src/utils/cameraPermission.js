import { Camera } from 'react-native-vision-camera';

export const requestCameraPermission = async () => {
  const permission = await Camera.requestCameraPermission();
  if (permission !== 'authorized') {
    throw new Error('Camera permission not granted');
  }
};
