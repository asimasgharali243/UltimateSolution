import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Animated,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import colors from '../styles/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconMa from 'react-native-vector-icons/MaterialIcons';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import {
  getDBConnection,
  createTable,
  insertScan,
  getAllScans,
  getSerialCounterState,
} from '../utils/DB_Scan';
import ENV from '../env';
import RNFS from 'react-native-fs';
import { Camera } from 'react-native-vision-camera';
import ImageCropper from '../utils/ImageCropper';
import OCR_Product_Name_MLKit from '../utils/OCR_Product_Name_MLKit';
import ImageSaveLocally from '../utils/ImageSaveLocally';
import formatDateTime from '../utils/formatDateTime';
import parseScanDate from '../utils/ParseDate';
import { useProduct } from '../contexts/ProductContext'; // ADD THIS IMPORT

// Error Boundary Component
class ScanScreenErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ScanScreen Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorSubtext}>{this.state.error?.message}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const ScanScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { autoLaunchCamera, capturedImageUri } = route.params || {};

  // ✅ USE PRODUCT CONTEXT INSTEAD OF LOCAL STATE
  const { selectedProduct, selectedProductId,selectedProductCode, selectProduct, clearProduct } = useProduct();

  const [capturedImage, setCapturedImage] = useState(null);
  const [db, setDb] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [counterState, setCounterState] = useState({
    nextSerial: 1,
    maxSerial: 0,
  });
  const [scaleAnim] = useState(new Animated.Value(1));

  // Global promise rejection handler
  useEffect(() => {
    const handlePromiseRejection = error => {
      console.error('Unhandled Promise Rejection:', error);
    };

    const originalConsoleError = console.error;
    console.error = (...args) => {
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // ---------------- ALERT HELPER FUNCTIONS ----------------
  const showDialog = useCallback(
    (title, message, type = ALERT_TYPE.INFO, onConfirm = null) => {
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
    },
    [],
  );

  const showToast = useCallback(
    (message, type = ALERT_TYPE.INFO, title = null) => {
      const alertTitle = title || getDefaultTitle(type);

      Toast.show({
        type: type,
        title: alertTitle,
        textBody: message,
        autoClose: 2000,
      });
    },
    [],
  );

  const getDefaultTitle = type => {
    switch (type) {
      case ALERT_TYPE.SUCCESS:
        return 'Success';
      case ALERT_TYPE.DANGER:
        return 'Error';
      case ALERT_TYPE.WARNING:
        return 'Warning';
      default:
        return 'Information';
    }
  };

  // ✅ Product validation function
  const validateProductSelection = useCallback(() => {
    if (!selectedProduct) {
      return { isValid: false, message: 'Please select a product first' };
    }
    return { isValid: true, message: 'Product selected' };
  }, [selectedProduct]);

  // ✅ Memoized load digital scans helper
  const loadDigitalScans = useCallback(async dbConn => {
    try {
      const allScans = await getAllScans(dbConn);
      const digitalScans = allScans.filter(scan => {
        let productdate = new Date(parseScanDate(scan.datetime)); 
        let currentdate = new Date();
        return scan.type === 'digital' && productdate.getDate() === currentdate.getDate();
      });
      console.log("digital ", digitalScans);
      setScans(digitalScans);
    } catch (error) {
      console.error('Error loading scans:', error);
      throw error;
    }
  }, []);

  // ✅ Load counter state
  const loadCounterState = useCallback(async dbConn => {
    try {
      const state = await getSerialCounterState(dbConn);
      setCounterState(state);
      console.log('Counter state loaded:', state);
    } catch (error) {
      console.error('Error loading counter state:', error);
    }
  }, []);

  // ✅ Initialize DB
  useEffect(() => {
    const initDB = async () => {
      try {
        setLoading(true);
        const dbConn = await getDBConnection();
        setDb(dbConn);
        await createTable(dbConn);
        await loadCounterState(dbConn);
        await loadDigitalScans(dbConn);
      } catch (error) {
        console.error('DB initialization error:', error);
        showDialog(
          'Error',
          'Failed to initialize the database.',
          ALERT_TYPE.DANGER,
        );
      } finally {
        setLoading(false);
      }
    };

    initDB();

    return () => {
      if (db) {
        db.close().catch(console.error);
      }
    };
  }, [loadDigitalScans, loadCounterState, showDialog]);

  // ✅ Refresh on focus - KEEP SELECTED PRODUCT (NOW PERSISTENT VIA CONTEXT)
  useFocusEffect(
    useCallback(() => {
      if (db) {
        loadDigitalScans(db).catch(console.error);
        loadCounterState(db).catch(console.error);
      }
      // ✅ Product is now persistent via context - no need to reset
    }, [db, loadDigitalScans, loadCounterState]),
  );

  // ✅ Set captured image from CameraScreen
  useEffect(() => {
    if (capturedImageUri) {
      setCapturedImage(capturedImageUri);
    }
  }, [capturedImageUri]);

  // ✅ Navigate to Search Screen
  const handleSelectProduct = () => {
    navigation.navigate('Search');
  };

  // ✅ Clear selected product manually using context
  const handleClearProduct = () => {
    clearProduct();
    showToast('Product selection cleared', ALERT_TYPE.INFO);
  };

  const openCameraScreen = async () => {
    try {
      const permission = await Camera.requestCameraPermission();
      if (permission === 'denied') {
        showDialog(
          'Camera Permission Required',
          'Please enable camera permission in settings.',
          ALERT_TYPE.WARNING,
        );
        return;
      }
      // ✅ Selected product is automatically available via context
      navigation.navigate('CameraScreen');
    } catch (error) {
      console.error('Camera error:', error);
      showDialog('Camera Error', 'Failed to open camera.', ALERT_TYPE.DANGER);
    }
  };

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        selectionLimit: 1,
      });

      if (!result.didCancel && result.assets?.length) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      showDialog(
        'Gallery Error',
        'Failed to pick image from gallery.',
        ALERT_TYPE.DANGER,
      );
    }
  };

  const handleImagePicker = () => {
    animatePress();
    Dialog.show({
      type: ALERT_TYPE.INFO,
      title: 'Select Image',
      textBody: 'Choose image source',
      button: 'Camera',
      closeOnOverlayTap: true,
      autoClose: false,
      onPressButton: () => {
        Dialog.hide();
        openCameraScreen();
      },
    });
  };

  // ✅ Fixed image analysis with comprehensive error handling
  const analyzeImage = async imageUri => {
    try {
      console.log('Starting image analysis...');

      // Check if API key exists
      if (
        !ENV.OPENAI_API_KEY ||
        ENV.OPENAI_API_KEY === 'your_openai_api_key_here'
      ) {
        console.warn('OpenAI API key not configured');
        return {
          weight_value: 'Unknown',
          input_token: '-',
          output_token: '-',
          total_token: '-',
        };
      }

      const base64 = await RNFS.readFile(imageUri, 'base64');
      console.log('Image converted to base64');

      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ENV.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          input: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: 'Extract weight value in pure JSON format like this: {"weight_value":"500g"}. No extra text.',
                },
                {
                  type: 'input_image',
                  image_url: `data:image/jpeg;base64,${base64}`,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response received');

      const text = data.output?.[0]?.content?.[0]?.text?.trim() || '';
      const cleaned = text.replace(/```json|```|`/g, '').trim();

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        parsed = { weight_value: 'Unknown' };
      }

      const usage = data.usage || {};
      return {
        ...parsed,
        input_token: usage.input_tokens?.toString() || '-',
        output_token: usage.output_tokens?.toString() || '-',
        total_token: usage.total_tokens?.toString() || '-',
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      return {
        weight_value: 'Unknown',
        input_token: '-',
        output_token: '-',
        total_token: '-',
      };
    }
  };

  // ✅ COMPLETELY FIXED Save Function
  const handleSave = async () => {
    if (!capturedImage) {
      showDialog(
        'No Image',
        'Please capture or upload an image before saving.',
        ALERT_TYPE.WARNING,
      );
      return;
    }

    if (!db) {
      showDialog(
        'Database Error',
        'Database not available.',
        ALERT_TYPE.DANGER,
      );
      return;
    }

    // ✅ Validate product selection
    const validation = validateProductSelection();
    if (!validation.isValid) {
      showDialog('Validation Error', validation.message, ALERT_TYPE.WARNING);
      return;
    }

    try {
      setSaving(true);
      setAnalyzing(true);
      animatePress();

      console.log('Starting save process...');
      console.log('Selected Product Code:', selectedProductCode);

      const now = new Date();
      const datetime = formatDateTime(now);

      // Step 1: Crop image with error handling
      console.log('Cropping image...');
      let product_name_image, weight_image;
      try {
        const cropResult = await ImageCropper(capturedImage);
        product_name_image = cropResult.product_name_image;
        weight_image = cropResult.weight_image;
        console.log('Image cropping completed');
      } catch (cropError) {
        console.error('Image cropping failed:', cropError);
        throw new Error(
          'Failed to crop image: ' + (cropError.message || 'Unknown error'),
        );
      }

      // Step 2: Get file info and perform OCR with better error handling
      console.log('Performing OCR and analysis...');
      let product_name = selectedProduct ? selectedProduct.name : 'Unknown Product';
      let extracted = {
        weight_value: 'Unknown',
        input_token: '-',
        output_token: '-',
        total_token: '-',
      };

      try {
        // ✅ Perform OCR to get scanned product code
        var scannedProductCode;
        try {
          scannedProductCode = await OCR_Product_Name_MLKit(product_name_image);
          console.log('Scanned product code:', scannedProductCode);
        } catch (ocrError) {
          console.error('OCR failed:', ocrError);
          scannedProductCode = 'Unknown';
        }

        // ✅ Validate if scanned code matches selected product code
        if (scannedProductCode !== selectedProductCode) {
          showDialog(
            'پروڈکٹ کوڈ مختلف ہے',
            `اسکین کیا گیا کوڈ: ${scannedProductCode}\nمنتخب کوڈ: ${selectedProductCode}\n\nاسکین کیا گیا کوڈ اور منتخب کوڈ ایک جیسے نہیں ہیں۔`,
            ALERT_TYPE.WARNING
          );
          setAnalyzing(false);
          setSaving(false);
          return; // Stop the save process
        }

        // ✅ If codes match, proceed with weight analysis
        try {
          const analysisResult = await analyzeImage(weight_image);
          if (analysisResult) {
            extracted = analysisResult;
          }
        } catch (analysisError) {
          console.error('Image analysis failed:', analysisError);
          return;
        }
      } catch (parallelError) {
        console.error('Parallel processing failed:', parallelError);
      }

      const { weight_value, input_token, output_token, total_token } = extracted;

      // Step 3: Save image locally with error handling
      console.log('Saving image locally...');
      let imagePath = null;
      try {
        imagePath = await ImageSaveLocally(capturedImage);
        console.log('Image saved locally:', imagePath);
      } catch (saveError) {
        console.error('Local image save failed:', saveError);
        imagePath = null;
      }

      // Step 4: Insert to database WITH PRODUCT CODE
      console.log('Inserting into database...');
      let insertedRecord;
      try {
        insertedRecord = await insertScan(
          db,
          datetime,
          product_name,
          selectedProductId,
          scannedProductCode,
          'digital',
          weight_value,
          1,
          imagePath,
          input_token,
          output_token,
          total_token,
        );
        console.log(
          'Record saved with serial number:',
          insertedRecord.serial_number,
          'Product Code:',
          selectedProductCode
        );
      } catch (dbError) {
        console.error('Database insertion failed:', dbError);
        throw new Error(
          'Failed to save to database: ' + (dbError.message || 'Unknown error'),
        );
      }

      showToast(
        `Image analyzed and saved successfully! (Serial #${insertedRecord.serial_number})`,
        ALERT_TYPE.SUCCESS,
        'Success',
      );

      // Reload both scans and counter state with error handling
      console.log('Refreshing data...');
      try {
        await Promise.all([
          loadDigitalScans(db).catch(error =>
            console.error('Failed to load scans:', error),
          ),
          loadCounterState(db).catch(error =>
            console.error('Failed to load counter state:', error),
          ),
        ]);
      } catch (refreshError) {
        console.error('Refresh failed:', refreshError);
      }

      // ✅ ONLY clear captured image, KEEP selected product for next scan (NOW PERSISTENT)
      setCapturedImage(null);
      console.log('Save process completed successfully - Product selection preserved');
    } catch (error) {
      console.error('Error in handleSave:', error);
      showDialog(
        'Save Error',
        error.message || 'Something went wrong while saving your scan.',
        ALERT_TYPE.DANGER,
      );
    } finally {
      setSaving(false);
      setAnalyzing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadDigitalScans(db).catch(error =>
          console.error('Failed to load scans:', error),
        ),
        loadCounterState(db).catch(error =>
          console.error('Failed to load counter state:', error),
        ),
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
      showToast('Failed to refresh scans', ALERT_TYPE.DANGER, 'Refresh Error');
    } finally {
      setRefreshing(false);
    }
  }, [db, loadDigitalScans, loadCounterState, showToast]);

  // ✅ Show spinner until DB is ready
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading scans...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header with Select Product Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.selectProductButton}
          onPress={handleSelectProduct}
        >
          <Icon name="search" size={16} color={colors.white} />
          <Text style={styles.selectProductButtonText}>
            {selectedProduct 
              ? `(${selectedProduct.code})`
              : 'Select Product'
            }
          </Text>
          <Icon name="chevron-down" size={14} color={colors.white} />
        </TouchableOpacity>
        
        {/* ✅ Clear Product Button - Only show when product is selected */}
        {/* {selectedProduct && (
          <TouchableOpacity
            style={styles.clearProductButton}
            onPress={handleClearProduct}
          >
            <Icon name="times" size={16} color={colors.white} />
          </TouchableOpacity> */}
        {/* )} */}
      </View>

      {/* ✅ Product Persistence Indicator */}
      {selectedProduct && (
        <View style={styles.persistenceIndicator}>
          <Icon name="info-circle" size={14} color={colors.primary} />
          <Text style={styles.persistenceText}>
           {selectedProduct.name} 
          </Text>
        </View>
      )}

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.uploadBox,
            (saving || analyzing) && styles.disabledButton,
          ]}
          onPress={handleImagePicker}
          disabled={saving || analyzing}
        >
          {analyzing ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <Icon name="camera" size={50} color={colors.primary} />
              <Text style={styles.uploadText}>
                Capture Image
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      {capturedImage && (
        <View style={styles.previewWrapper}>
          <Image
            source={{ uri: capturedImage }}
            style={styles.preview}
            resizeMode="contain"
          />
          {(saving || analyzing) && (
            <View style={styles.imageOverlay}>
              <ActivityIndicator size="large" color={colors.white} />
              <Text style={styles.overlayText}>
                {analyzing ? 'آپ کی درخواست پر عمل کیا جا رہا ہے' : 'Saving...'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Action Buttons Container - ONLY SAVE BUTTON */}
      <View style={styles.actionButtonsContainer}>
        <Animated.View style={[styles.actionButtonWrapper, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.saveButton,
              (!capturedImage || saving || analyzing || !selectedProduct) && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={!capturedImage || saving || analyzing || !selectedProduct}
          >
            {saving || analyzing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Icon name="save" size={22} color={colors.white} />
            )}
            <Text style={styles.buttonText}>
              {saving || analyzing ? 'Processing...' : 'Save Scan'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today Production</Text>
        {scans.length > 0 && (
          <Text style={styles.scanCount}>({scans.length} scans)</Text>
        )}
      </View>

      {/* Table with horizontal scrolling for columns */}
      <View style={styles.tableContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={true}
          style={styles.horizontalScroll}
        >
          <View>
            {/* Table Header */}
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.serialCell]}>Serial#</Text>
              <Text style={[styles.headerCell, styles.dateCell]}>DateTime</Text>
              <Text style={[styles.headerCell, styles.productCell]}>Item Code</Text>
              <Text style={[styles.headerCell, styles.weightCell]}>Weight</Text>
              <Text style={[styles.headerCell, styles.imageCell]}>Image</Text>
              <Text style={[styles.headerCell, styles.printCell]}>Print</Text>
            </View>

            {/* Table Body - All rows visible, no vertical scrolling */}
            {scans.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No scans yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Capture your first image to get started
                </Text>
              </View>
            ) : (
              scans.map(scan => (
                <View key={scan.sr1} style={styles.dataRow}>
                  <Text style={[styles.cell, styles.serialCell]}>
                    {scan.serial_number}
                  </Text>
                  <Text style={[styles.cell, styles.dateCell]}>
                    {scan.datetime ? scan.datetime.split('T')[0] : 'N/A'}
                  </Text>
                  <Text style={[styles.cell, styles.productCell]} numberOfLines={2}>
                    {scan.item_Code || 'Unknown'}
                  </Text>
                  <Text style={[styles.cell, styles.weightCell]}>
                    {scan.weight_value || 'N/A'}
                  </Text>
                  <View style={[styles.cell, styles.imageCell]}>
                    {scan.image_uri ? (
                      <Image
                        source={{
                          uri:
                            Platform.OS === 'android'
                              ? 'file://' + scan.image_uri
                              : scan.image_uri,
                        }}
                        style={styles.scanImage}
                      />
                    ) : (
                      <Text style={styles.noImageText}>No Image</Text>
                    )}
                  </View>
                  <View style={[styles.cell, styles.printCell]}>
                    <IconMa
                      name="print"
                      size={40}
                      color="#4b7bec"
                      onPress={() => Alert.alert('Print', `Print scan #${scan.serial_number}`)}
                    />
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: colors.background,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  selectProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  selectProductButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
    flex: 1,
  },
  clearProductButton: {
    backgroundColor: colors.danger || '#dc3545',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  persistenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  persistenceText: {
    marginLeft: 8,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    flex: 1,
  },
  uploadBox: {
    height: 100,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginBottom: 10,
  },
  uploadText: {
    marginTop: 2,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  previewWrapper: {
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  overlayText: {
    color: colors.white,
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  // Action Buttons Container
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  actionButtonWrapper: {
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
    minHeight: 50,
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
  },
  scanCount: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: colors.white,
    marginBottom: 20,
    minHeight: 200,
  },
  horizontalScroll: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
    paddingHorizontal: 5,
  },
  serialCell: { width: 80 },
  dateCell: { width: 130 },
  productCell: { width: 200 },
  weightCell: { width: 80 },
  imageCell: { width: 100 },
  printCell: { width: 100, textAlign: 'center' ,alignItems:'center',justifyContent:"center"},
  
  dataRow: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    alignItems: 'center',
    minHeight: 60,
  },
  cell: {
    textAlign: 'center',
    color: '#333',
    fontSize: 12,
    paddingHorizontal: 5,
  },
  scanImage: {
    width: 60,
    height: 45,
    borderRadius: 4,
    alignSelf: 'center',
  },
  noImageText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    minWidth: 400,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.danger,
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

// Wrap with error boundary
export default function ScanScreenWithErrorBoundary(props) {
  return (
    <ScanScreenErrorBoundary>
      <ScanScreen {...props} />
    </ScanScreenErrorBoundary>
  );
}