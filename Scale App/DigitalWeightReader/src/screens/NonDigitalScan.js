import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import colors from '../styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import {
  getDBConnection,
  createTable,
  insertScan,
  getAllScans,
  updateScanQuantity,
  getScansByDate,
} from '../utils/DB_Scan';
import { Camera } from 'react-native-vision-camera';
import OCR_Product_Name_MLKit from '../utils/OCR_Product_Name_MLKit';
import ImageSaveLocally from '../utils/ImageSaveLocally';

const { width: screenWidth } = Dimensions.get('window');

// Date formatting function
const formatDateTime = (date = new Date()) => {
  const n = date;
  const d = String(n.getDate()).padStart(2, '0');
  const m = String(n.getMonth() + 1).padStart(2, '0');
  const y = n.getFullYear();
  const h = n.getHours() % 12 || 12;
  const mm = String(n.getMinutes()).padStart(2, '0');
  const a = n.getHours() >= 12 ? 'PM' : 'AM';
  return `${d}/${m}/${y} ${String(h).padStart(2, '0')}:${mm} ${a}`;
};

// Function to format display date and time from stored datetime string
const formatDisplayDateTime = (dateTimeString) => {
  if (!dateTimeString) return 'N/A';
  
  // If it's already in your format, return as is
  if (dateTimeString.includes('/') && (dateTimeString.includes('AM') || dateTimeString.includes('PM'))) {
    return dateTimeString;
  }
  
  // If it's in ISO format or other format, convert it
  try {
    const date = new Date(dateTimeString);
    return formatDateTime(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateTimeString;
  }
};

// Function to extract only date part for display
const formatDisplayDate = (dateTimeString) => {
  const fullDateTime = formatDisplayDateTime(dateTimeString);
  return fullDateTime.split(' ')[0]; // Returns only "DD/MM/YYYY"
};

// Function to extract only time part for display
const formatDisplayTime = (dateTimeString) => {
  const fullDateTime = formatDisplayDateTime(dateTimeString);
  const parts = fullDateTime.split(' ');
  if (parts.length >= 3) {
    return `${parts[1]} ${parts[2]}`; // Returns "HH:MM AM/PM"
  }
  return fullDateTime;
};

const NonDigitalScanScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { autoLaunchCamera, capturedImageUri } = route.params || {};

  const [ndCapturedImage, setNDCapturedImage] = useState(null);
  const [ndDb, setNDDb] = useState(null);
  const [ndScans, setNDScans] = useState([]);
  const [ndQuantityMap, setNDQuantityMap] = useState({});
  const [ndScaleAnim] = useState(new Animated.Value(1));
  const [quantityUp, setQuantityUp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputErrors, setInputErrors] = useState({});
  const [validationCache, setValidationCache] = useState({});

  // ---------------- DB INIT ----------------
  useEffect(() => {
    let isMounted = true;

    const initNDDb = async () => {
      let dbConn;
      try {
        setIsLoading(true);
        dbConn = await getDBConnection();
        if (!isMounted) return;

        setNDDb(dbConn);
        await createTable(dbConn);
        const allScans = await getScansByDate(dbConn);
        const nonDigitalScans = allScans.filter(scan => scan.type === 'Non digital');
        setNDScans(nonDigitalScans);

        const map = {};
        nonDigitalScans.forEach(scan => {
          map[scan.sr1] = scan.quantity?.toString() || '';
        });
        setNDQuantityMap(map);
      } catch (err) {
        console.error('DB Init Error:', err);
        showDialog('Error', 'Failed to load scans. Please restart the app.', ALERT_TYPE.DANGER);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initNDDb();

    return () => {
      isMounted = false;
    };
  }, []);

  // ---------------- ALERT HELPER FUNCTIONS ----------------
  const showDialog = useCallback((title, message, type = ALERT_TYPE.INFO, onConfirm = null) => {
    const alertConfig = {
      type: type,
      title: title,
      textBody: message,
      button: 'OK',
      closeOnOverlayTap: true,
      autoClose: false,
    };

    if (onConfirm) {
      alertConfig.onPressButton = onConfirm;
    }

    Dialog.show(alertConfig);
  }, []);

  const showToast = useCallback((message, type = ALERT_TYPE.INFO, title = null) => {
    const alertTitle = title || getDefaultTitle(type);
    
    Toast.show({
      type: type,
      title: alertTitle,
      textBody: message,
      autoClose: 2000,
    });
  }, []);

  const getDefaultTitle = (type) => {
    switch (type) {
      case ALERT_TYPE.SUCCESS: return 'Success';
      case ALERT_TYPE.DANGER: return 'Error';
      case ALERT_TYPE.WARNING: return 'Warning';
      default: return 'Information';
    }
  };

  // ---------------- Refresh data when screen focuses ----------------
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        if (ndDb) {
          try {
            console.log('Refreshing data...');
            const allScans = await getAllScans(ndDb);
            const nonDigitalScans = allScans.filter(scan => scan.type === 'Non digital');
            setNDScans(nonDigitalScans);

            const map = {};
            nonDigitalScans.forEach(scan => {
              map[scan.sr1] = scan.quantity?.toString() || '';
            });
            setNDQuantityMap(map);
            
            console.log('Data refreshed. Non-digital scans:', nonDigitalScans.length);
          } catch (error) {
            console.error('Error refreshing data:', error);
          }
        }
      };

      refreshData();
    }, [ndDb])
  );

  // ---------------- Set captured image from navigation ----------------
  useEffect(() => {
    if (capturedImageUri) {
      setNDCapturedImage(capturedImageUri);
      setQuantityUp('');
      setInputErrors({});
    }
  }, [capturedImageUri]);

  // ---------------- Auto launch camera ----------------
  useEffect(() => {
    if (autoLaunchCamera) openNDCamera();
  }, [autoLaunchCamera]);

  // ---------------- Enhanced Validation functions ----------------
  const validateQuantity = useCallback((quantity, fieldId = 'main') => {
    if (!quantity || quantity.trim() === '') {
      return { isValid: false, message: 'Please enter a quantity', errorText: 'Quantity is required' };
    }

    const numValue = Number(quantity);
    if (isNaN(numValue)) {
      return { isValid: false, message: 'Quantity must be a number', errorText: 'Must be a number' };
    }

    if (numValue < 1) {
      return { isValid: false, message: 'Quantity must be at least 1', errorText: 'Must be at least 1' };
    }

    if (numValue > 99) {
      return { isValid: false, message: 'Quantity cannot exceed 99', errorText: 'Cannot exceed 99' };
    }

    if (!Number.isInteger(numValue)) {
      return { isValid: false, message: 'Quantity must be a whole number', errorText: 'Must be whole number' };
    }

    return { isValid: true, message: '', errorText: '' };
  }, []);

  // Update errors separately
  const updateInputErrors = useCallback((fieldId, errorText) => {
    setInputErrors(prev => ({ ...prev, [fieldId]: errorText }));
  }, []);

  const handleQuantityChange = useCallback((text) => {
    // Only allow numbers and empty string
    if (text === '' || /^\d+$/.test(text)) {
      setQuantityUp(text);
      if (text) {
        const validation = validateQuantity(text, 'main');
        updateInputErrors('main', validation.errorText);
      } else {
        updateInputErrors('main', '');
      }
    }
  }, [validateQuantity, updateInputErrors]);

  const handleTableQuantityChange = useCallback((sr1, value) => {
    // Only allow numbers and empty string
    if (value === '' || /^\d+$/.test(value)) {
      setNDQuantityMap(prev => ({ ...prev, [sr1]: value }));
      if (value) {
        const validation = validateQuantity(value, sr1);
        updateInputErrors(sr1, validation.errorText);
      } else {
        updateInputErrors(sr1, '');
      }
    }
  }, [validateQuantity, updateInputErrors]);

  // ---------------- Helper functions ----------------
  const animateNDPress = () => {
    Animated.sequence([
      Animated.timing(ndScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(ndScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const openNDCamera = async () => {
    try {
      const permission = await Camera.requestCameraPermission();
      if (permission === 'denied') {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: 'Camera Permission Required',
          textBody: 'This app needs camera access to capture product images.',
          button: 'Open Settings',
          closeOnOverlayTap: true,
          onPressButton: () => Linking.openSettings(),
        });
        return;
      }
      navigation.navigate('NonDigitalCamera');
    } catch (error) {
      console.error('Camera error:', error);
      showDialog('Camera Error', 'Unable to open camera. Please try again.', ALERT_TYPE.DANGER);
    }
  };

  const handleNDGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        selectionLimit: 1,
      });
      if (!result.didCancel && result.assets?.length) {
        setNDCapturedImage(result.assets[0].uri);
        setQuantityUp('');
        setInputErrors({});
      }
    } catch (error) {
      console.error('Gallery error:', error);
      showDialog('Gallery Error', 'Unable to access photos. Please check permissions.', ALERT_TYPE.DANGER);
    }
  };

  const handleNDImagePicker = () => {
    animateNDPress();
    Dialog.show({
      type: ALERT_TYPE.INFO,
      title: 'Select Image Source',
      textBody: 'Choose where to get your product image',
      button: 'Take Photo',
      closeOnOverlayTap: true,
      onPressButton: () => {
        Dialog.hide();
        openNDCamera();
      },
      buttons: [
        {
          text: 'Take Photo',
          onPress: openNDCamera,
        },
        {
          text: 'Choose from Gallery',
          onPress: handleNDGallery,
        },
      ],
    });
  };

  // ---------------- Save new scan ----------------
  const handleNDSaveNewScan = async () => {
    animateNDPress();

    if (!ndCapturedImage) {
      showDialog('No Image Selected', 'Please capture or select an image first.', ALERT_TYPE.WARNING);
      return;
    }

    // Validate quantity
    const quantityValidation = validateQuantity(quantityUp, 'main');
    if (!quantityValidation.isValid) {
      showDialog('Invalid Quantity', quantityValidation.message, ALERT_TYPE.WARNING);
      updateInputErrors('main', quantityValidation.errorText);
      return;
    }

    try {
      setIsProcessing(true);

      // Use the formatted datetime function
      const datetime = formatDateTime();

      // OCR for product name
      const product_name = await OCR_Product_Name_MLKit(ndCapturedImage);
      const imagePath = await ImageSaveLocally(ndCapturedImage);
      
      console.log('Saving scan:', { datetime, product_name, quantityUp, imagePath });

      await insertScan(
        ndDb,
        datetime,
        product_name,
        'Non digital',
        null,
        quantityUp,
        imagePath,
        null,
        null,
        null,
      );

      showToast('Product scan saved successfully!', ALERT_TYPE.SUCCESS, 'Success ✅');

      // Refresh scans
      const allScans = await getAllScans(ndDb);
      const nonDigitalScans = allScans.filter(scan => scan.type === 'Non digital');
      setNDScans(nonDigitalScans);

      const map = {};
      nonDigitalScans.forEach(scan => {
        map[scan.sr1] = scan.quantity?.toString() || '';
      });
      setNDQuantityMap(map);

      // Reset UI
      setNDCapturedImage(null);
      setQuantityUp('');
      setInputErrors({});
    } catch (error) {
      console.error('Error saving scan:', error);
      showDialog('Save Failed ❌', 'Unable to save scan. Please check storage and try again.', ALERT_TYPE.DANGER);
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------- Quantity Handling for existing scans ----------------
  const handleNDSaveQuantity = async (sr1) => {
    const newQty = ndQuantityMap[sr1];

    // Validate quantity
    const quantityValidation = validateQuantity(newQty, sr1);
    if (!quantityValidation.isValid) {
      showDialog('Invalid Quantity', quantityValidation.message, ALERT_TYPE.WARNING);
      updateInputErrors(sr1, quantityValidation.errorText);
      return;
    }

    try {
      setIsProcessing(true);
      await updateScanQuantity(ndDb, sr1, newQty);

      showToast('Quantity updated successfully!', ALERT_TYPE.SUCCESS, 'Updated ✅');

      // Refresh scans to ensure data consistency
      const allScans = await getAllScans(ndDb);
      const nonDigitalScans = allScans.filter(scan => scan.type === 'Non digital');
      setNDScans(nonDigitalScans);
    } catch (error) {
      console.error('Error updating quantity:', error);
      showDialog('Update Failed ❌', 'Unable to update quantity. Please try again.', ALERT_TYPE.DANGER);
    } finally {
      setIsProcessing(false);
    }
  };

  // Memoized validation results for render
  const mainQuantityValidation = validateQuantity(quantityUp, 'main');

  // ---------------- Render ----------------
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your scans...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Non Digital Weight Reader</Text>
          <Text style={styles.subtitle}>Capture and manage product scans</Text>
        </View>

        {/* --- ORIGINAL UPLOAD BOX UI (unchanged) --- */}
        <Animated.View style={{ transform: [{ scale: ndScaleAnim }] }}>
          <TouchableOpacity 
            style={styles.uploadBox} 
            onPress={handleNDImagePicker} 
            disabled={isProcessing}
          >
            <Icon name="cloud-upload" size={50} color={colors.primary} />
            <Text style={styles.uploadText}>Upload image from camera or gallery</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Image Preview with Enhanced UI */}
        {ndCapturedImage && (
          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>Image Preview</Text>
            <View style={styles.previewWrapper}>
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: ndCapturedImage }} 
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              </View>
              
              <View style={styles.quantitySection}>
                <View style={styles.quantityHeader}>
                  <Text style={styles.quantityLabel}>Enter Quantity <Text style={{ color: 'red' }}>*</Text></Text>
                  <Text style={styles.quantityHint}>(1-99)</Text>
                </View>
                <TextInput
                  style={[
                    styles.quantityInput,
                    inputErrors.main && styles.inputError
                  ]}
                  placeholder="Enter quantity..."
                  placeholderTextColor="#999"
                  value={quantityUp}
                  onChangeText={handleQuantityChange}
                  keyboardType="number-pad"
                  maxLength={2}
                  editable={!isProcessing}
                  returnKeyType="done"
                />
                {inputErrors.main ? (
                  <Text style={styles.errorText}>⚠️ {inputErrors.main}</Text>
                ) : (
                  <Text style={styles.helperText}>Enter a number between 1 and 99</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Save Button with Enhanced UI */}
        {ndCapturedImage && (
          <Animated.View style={{ transform: [{ scale: ndScaleAnim }] }}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!quantityUp || !mainQuantityValidation.isValid || isProcessing) && 
                styles.saveButtonDisabled
              ]}
              onPress={handleNDSaveNewScan}
              disabled={!quantityUp || !mainQuantityValidation.isValid || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Icon name="save" size={20} color={colors.white} />
              )}
              <Text style={styles.saveButtonText}>
                {isProcessing ? 'Saving...' : 'Save New Scan'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Previous Scans Section with Enhanced UI */}
        <View style={styles.previousScansSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Previous Scans</Text>
            <View style={styles.scansCountBadge}>
              <Text style={styles.scansCountText}>{ndScans.length}</Text>
            </View>
          </View>

          {ndScans.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="inbox" size={48} color={colors.border} />
              <Text style={styles.emptyStateTitle}>No scans yet</Text>
              <Text style={styles.emptyStateText}>
                Your scanned products will appear here
              </Text>
            </View>
          ) : (
            <View style={styles.tableContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={true}
                style={styles.horizontalScroll}
              >
                <View>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, styles.colSr]}>Sr #</Text>
                    <Text style={[styles.headerCell, styles.colDateTime]}>Date & Time</Text>
                    <Text style={[styles.headerCell, styles.colProduct]}>Product</Text>
                    <Text style={[styles.headerCell, styles.colQty]}>Quantity</Text>
                    <Text style={[styles.headerCell, styles.colImage]}>Image</Text>
                    <Text style={[styles.headerCell, styles.colAction]}>Action</Text>
                  </View>

                  {/* Table Rows */}
                  {ndScans.map((scan, index) => {
                    const rowValidation = validateQuantity(ndQuantityMap[scan.sr1], scan.sr1);
                    
                    return (
                      <View 
                        key={scan.sr1} 
                        style={[
                          styles.tableRow,
                          index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
                        ]}
                      >
                        <Text style={[styles.cell, styles.colSr]}>{scan.sr1}</Text>
                        
                        {/* Combined Date & Time Column */}
                        <View style={[styles.cell, styles.colDateTime]}>
                          <Text style={styles.dateText}>
                            {formatDisplayDate(scan.datetime)}
                          </Text>
                          <Text style={styles.timeText}>
                            {formatDisplayTime(scan.datetime)}
                          </Text>
                        </View>

                        <Text style={[styles.cell, styles.colProduct]} numberOfLines={2}>
                          {scan.product_name || 'Unnamed Product'}
                        </Text>

                        <View style={[styles.cell, styles.colQty]}>
                          <TextInput
                            style={[
                              styles.tableInput,
                              inputErrors[scan.sr1] && styles.inputError
                            ]}
                            value={ndQuantityMap[scan.sr1]}
                            keyboardType="number-pad"
                            onChangeText={(val) => handleTableQuantityChange(scan.sr1, val)}
                            maxLength={2}
                            editable={!isProcessing}
                            textAlign="center"
                          />
                          {inputErrors[scan.sr1] && (
                            <Text style={styles.tableErrorText}>!</Text>
                          )}
                        </View>

                        <View style={[styles.cell, styles.colImage]}>
                          {scan.image_uri ? (
                            <View style={styles.tableImageContainer}>
                              <Image
                                source={{
                                  uri: Platform.OS === 'android' 
                                    ? 'file://' + scan.image_uri 
                                    : scan.image_uri,
                                }}
                                style={styles.productImage}
                                resizeMode="cover"
                              />
                            </View>
                          ) : (
                            <View style={styles.noImagePlaceholder}>
                              <Icon name="picture-o" size={16} color="#999" />
                            </View>
                          )}
                        </View>

                        <View style={[styles.cell, styles.colAction]}>
                          <TouchableOpacity
                            style={[
                              styles.updateButton,
                              (!ndQuantityMap[scan.sr1] || 
                              !rowValidation.isValid || 
                              isProcessing) && 
                              styles.updateButtonDisabled
                            ]}
                            onPress={() => handleNDSaveQuantity(scan.sr1)}
                            disabled={
                              !ndQuantityMap[scan.sr1] || 
                              !rowValidation.isValid || 
                              isProcessing
                            }
                          >
                            <Icon 
                              name="check" 
                              size={16} 
                              color={
                                (!ndQuantityMap[scan.sr1] || 
                                !rowValidation.isValid || 
                                isProcessing) ? '#ccc' : colors.white
                              } 
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Global Processing Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingModal}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.processingText}>Processing...</Text>
            <Text style={styles.processingSubtext}>Please wait</Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default NonDigitalScanScreen;

// Styles remain exactly the same as your original
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 40,
  },
  centered: { 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 16, 
    color: colors.textLight,
    fontWeight: '500',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  uploadBox: {
    height: 180,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginBottom: 15,
  },
  uploadText: {
    marginTop: 10,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  previewSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 12,
  },
  previewWrapper: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  quantitySection: {
    marginTop: 8,
  },
  quantityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  quantityHint: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  quantityInput: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.textDark,
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fffafa',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  helperText: {
    color: colors.textLight,
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#28a745',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#a0a0a0',
    shadowColor: '#a0a0a0',
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 10,
  },
  previousScansSection: {
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textDark,
  },
  scansCountBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scansCountText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginTop: 10,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  tableContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  horizontalScroll: {
    maxHeight: 400,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 60,
  },
  tableRowEven: {
    backgroundColor: '#f8f9fa',
  },
  tableRowOdd: {
    backgroundColor: colors.white,
  },
  colSr: { width: 60 },
  colDateTime: { width: 120 },
  colProduct: { width: 140 },
  colQty: { width: 80 },
  colImage: { width: 80 },
  colAction: { width: 70 },
  headerCell: {
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 12,
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 11,
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: '500',
  },
  tableInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: colors.white,
    color: colors.textDark,
    width: 50,
    textAlign: 'center',
  },
  tableErrorText: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc3545',
    color: colors.white,
    borderRadius: 8,
    width: 16,
    height: 16,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: 'bold',
  },
  tableImageContainer: {
    width: 50,
    height: 40,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    width: 50,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  updateButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
  updateButtonDisabled: {
    backgroundColor: '#e9ecef',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingModal: {
    backgroundColor: colors.white,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
  processingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textLight,
  },
});