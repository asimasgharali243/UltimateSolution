// CameraCropper.js
import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import PhotoManipulator from "react-native-photo-manipulator";

const CameraCropper = ({ onCapture, onCancel, rectWidth = 280, rectHeight = 160 }) => {
  const camera = useRef(null);
  const devices = useCameraDevices();
  const device = devices.back;

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Calculate crop rectangle position (centered)
  const offsetX = (screenWidth - rectWidth) / 2;
  const offsetY = (screenHeight - rectHeight) / 2;

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermission();
      if (permission !== "granted") {
        Alert.alert("Permission Denied", "Camera access is required!");
        onCancel && onCancel();
      }
    })();
  }, []);

  if (!device) return <View style={{ flex: 1, backgroundColor: "black" }} />;

  const capturePhoto = async () => {
    try {
      const photo = await camera.current.takePhoto({
        qualityPrioritization: "quality",
      });

      const originalUri = `file://${photo.path}`;

      // Define the crop region (relative to captured image)
      const cropRegion = {
        x: offsetX,
        y: offsetY,
        width: rectWidth,
        height: rectHeight,
      };

      // Perform crop using react-native-photo-manipulator
      const croppedUri = await PhotoManipulator.crop(originalUri, cropRegion);

      onCapture && onCapture(croppedUri);
    } catch (error) {
      console.error("Capture Error:", error);
      Alert.alert("Error", "Failed to capture or crop photo.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Overlay with crop rectangle */}
      <View style={styles.overlay}>
        <View style={[styles.rectangle, { width: rectWidth, height: rectHeight }]}>
          <Text style={styles.label}>Align Product & Weight Here</Text>
        </View>
      </View>

      {/* Control buttons */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.text}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={capturePhoto} style={styles.captureBtn}>
          <Text style={styles.text}>Capture</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CameraCropper;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  rectangle: {
    borderWidth: 3,
    borderColor: "#00FF00",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,255,0,0.1)",
  },
  label: {
    color: "#fff",
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    fontSize: 14,
  },
  controls: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  captureBtn: {
    backgroundColor: "#28a745",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  cancelBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  text: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
