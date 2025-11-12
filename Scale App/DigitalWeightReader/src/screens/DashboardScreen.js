import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import colors from '../styles/colors';
import { getUserDBConnection, clearUsers, getUser } from '../utils/User_DB';
import { getDBConnection, createTable, resetSerialCounter } from '../utils/DB_Scan';
import { productDBManager } from '../utils/Product_DB';
import RNFS from 'react-native-fs';
import ENV from '../env';
import parseScanDate from '../utils/ParseDate';
import { useRoute } from '@react-navigation/native';

const DashboardScreen = ({ navigation }) => {
  const [todayScanCount, setTodayScanCount] = useState(0);
  const [yesterdayScanCount, setYesterdayScanCount] = useState(0);
  const [totalScanCount, setTotalScanCount] = useState(0);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDownloadingProducts, setIsDownloadingProducts] = useState(false);
  const [resettingSerial, setResettingSerial] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0, success: 0, failed: 0 });
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [unsyncedRecords, setUnsyncedRecords] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  
  const route = useRoute();
  const { userName, userId } = route.params || {};

  const isMounted = useRef(true);
  const dbRef = useRef(null);
  const autoSyncIntervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const lastSyncTimeRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      stopAutoSync();
    };
  }, []);

  // ---------------- AUTO SYNC FUNCTIONS ----------------
  const startAutoSync = useCallback(() => {
    console.log('🔄 Starting auto-sync service (15 minute intervals)');
    
    // Clear any existing interval
    if (autoSyncIntervalRef.current) {
      clearInterval(autoSyncIntervalRef.current);
    }

    // Start new interval - 15 minutes = 900000 milliseconds
    autoSyncIntervalRef.current = setInterval(async () => {
      if (!isMounted.current) return;
      
      // Don't auto-sync if manual sync is in progress or app is in background
      if (isSyncing || appStateRef.current !== 'active') {
        console.log('⏸️ Auto-sync skipped: Manual sync in progress or app in background');
        return;
      }

      // Check if we have pending records to sync
      try {
        const unsynced = await getUnsyncedRecords();
        if (unsynced.length > 0) {
          console.log(`🔄 Auto-sync triggered: ${unsynced.length} records pending`);
          await performAutoSync(unsynced);
        } else {
          console.log('✅ Auto-sync: No pending records');
        }
      } catch (error) {
        console.error('❌ Auto-sync preparation error:', error);
      }
    }, 900000); // 15 minutes

    // Initial sync check after 30 seconds (optional)
    setTimeout(async () => {
      if (isMounted.current) {
        try {
          const unsynced = await getUnsyncedRecords();
          if (unsynced.length > 0) {
            console.log(`🔄 Initial auto-sync check: ${unsynced.length} records pending`);
            await performAutoSync(unsynced);
          }
        } catch (error) {
          console.error('❌ Initial auto-sync error:', error);
        }
      }
    }, 30000);
  }, [isSyncing]);

  const stopAutoSync = useCallback(() => {
    if (autoSyncIntervalRef.current) {
      clearInterval(autoSyncIntervalRef.current);
      autoSyncIntervalRef.current = null;
      console.log('🛑 Auto-sync service stopped');
    }
  }, []);

const performAutoSync = async (unsynced) => {
  if (!dbRef.current || isSyncing || isAutoSyncing) {
    return;
  }

  setIsAutoSyncing(true);
  console.log(`🔄 Auto-sync started for ${unsynced.length} records`);

  let successCount = 0;
  let failCount = 0;

  for (const [index, scan] of unsynced.entries()) {
    if (!isMounted.current) break;

    try {
      let imageBase64 = null;
      if (scan.image_uri) {
        try {
          imageBase64 = await RNFS.readFile(scan.image_uri, 'base64');
        } catch (err) {
          console.log('scaleProcessDT', scan);
          console.warn(`⚠️ Auto-sync: Failed to read image sr1=${scan.sr1}:`, err);
        }
      }

      // Parse and validate date
      let scaleProcessDT;
      try {
        scaleProcessDT = parseScanDate(scan.datetime);
        if (!scaleProcessDT || isNaN(new Date(scaleProcessDT).getTime())) {
          throw new Error('Invalid date format');
        }
      } catch (dateError) {
        console.warn(`⚠️ Invalid date for sr1=${scan.sr1}:`, scan.datetime);
        console.log('scaleProcessDT', scan);
        scaleProcessDT = new Date().toISOString();
      }

      // Convert to server's exact expected format
         const payload = {
        Id: 0, // Server will auto-generate this
        ItemID: scan.item_ID, // Not in mobile DB
        ItemCode: scan.item_Code, // Not in mobile DB
        ItemName: scan.product_name || 'Unknown Product',
        ItemNameUrdu: null, // Not in mobile DB
        scaleWeight: scan.weight_value ? parseFloat(scan.weight_value) : 0,
        Qty: typeof scan.quantity === 'string' ? 1 : (scan.quantity || 1),
        scaleImage: imageBase64 || null,
        scaleProcessDT: scaleProcessDT,
        SyncDT: new Date().toISOString(),
        SyncUserID: userId ? parseInt(userId) : null,
        BatchID: null, // Not in mobile DB
        BatchNo: null, // Not in mobile DB
        IsActive: true,
        InputToken: scan.input_token ? parseInt(scan.input_token) : 0,
        OutToken: scan.output_token ? parseInt(scan.output_token) : 0,
        total_token: scan.total_token ? parseInt(scan.total_token) : 0,
        scaleType: scan.type || 'Digital'
      };


      // Log the payload for debugging
      console.log(`📤 Auto-sync payload for sr1=${scan.sr1}:`, {
        sr1: scan.sr1,
        ItemName: payload.ItemName,
        scaleWeight: payload.scaleWeight,
        Qty: payload.Qty,
        scaleType: payload.scaleType,
        scaleProcessDT: payload.scaleProcessDT
      });

      const response = await fetch(`${ENV.BaseURL}/api/Scales`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        timeout: 30000,
      });

      // Get response body for better error messages
      let responseBody;
      try {
        responseBody = await response.text();
      } catch (e) {
        responseBody = 'Could not read response body';
      }

      if (!response.ok) {
        console.error(`❌ Auto-sync failed for sr1=${scan.sr1}:`, {
          status: response.status,
          statusText: response.statusText,
          body: responseBody
        });
        
        // For 400 errors, log the exact issue
        if (response.status === 400) {
          console.log(`🔧 Server returned 400 for sr1=${scan.sr1}. Response:`, responseBody);
        }
        
        failCount++;
        continue;
      }

      // Only mark as synced if server accepted the request (200-299 status)
      await dbRef.current.executeSql(
        `UPDATE scans SET sync_status = 1 WHERE sr1 = ?`,
        [scan.sr1]
      );
      
      successCount++;
      console.log(`✅ Auto-sync successful for sr1=${scan.sr1}`);
      
    } catch (err) {
      console.error(`❌ Auto-sync error for sr1=${scan.sr1}:`, err.message);
      failCount++;
    }
  }

  if (isMounted.current) {
    setIsAutoSyncing(false);
    lastSyncTimeRef.current = new Date();
    
    // Update counts after auto-sync
    await updateScanCounts();
    
    console.log(`✅ Auto-sync completed: ${successCount} successful, ${failCount} failed`);
    
    // Show notification based on results
    if (failCount > 0) {
      showToast(
        `Auto-sync: ${successCount} success, ${failCount} failed`,
        ALERT_TYPE.WARNING,
        'Auto Sync',
        false
      );
    } else if (successCount > 0) {
      showToast(
        `Auto-sync: ${successCount} records synced successfully!`,
        ALERT_TYPE.SUCCESS,
        'Auto Sync',
        false
      );
    }
  }
};


  // App state handler for auto-sync optimization
  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      console.log(`📱 App state changed: ${appStateRef.current} -> ${nextAppState}`);
      
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // App came to foreground - resume auto-sync if needed
        if (!autoSyncIntervalRef.current) {
          startAutoSync();
        }
        // Refresh counts when app becomes active
        updateScanCounts();
      } else if (nextAppState.match(/inactive|background/)) {
        // App going to background - stop auto-sync to save resources
        stopAutoSync();
      }
      
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [startAutoSync, stopAutoSync]);

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

  const showToast = useCallback((message, type = ALERT_TYPE.INFO, title = null, autoClose = true) => {
    const alertTitle = title || getDefaultTitle(type);
    
    Toast.show({
      type: type,
      title: alertTitle,
      textBody: message,
      autoClose: autoClose ? 2000 : false,
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

  // ---------------- RESET SERIAL COUNTER FUNCTION ----------------
  const handleResetSerialCounter = useCallback(async () => {
    if (isSyncing || isDownloadingProducts || isAutoSyncing) {
      showDialog('Operation in Progress', 'Please wait for current operation to complete before resetting serial counter.', ALERT_TYPE.WARNING);
      return;
    }

    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: 'Reset Serial Counter',
      textBody: 'This will reset the serial counter to 1. The NEXT record you save will have serial number 1. Continue?',
      button: 'Reset Counter',
      closeOnOverlayTap: true,
      autoClose: false,
      onPressButton: async () => {
        setResettingSerial(true);
        try {
          const dbConnection = await getDBConnection();
          const result = await resetSerialCounter(dbConnection);
          
          showToast(
            result.message || 'Serial counter reset successfully!',
            ALERT_TYPE.SUCCESS,
            'Reset Complete',
          );
          
          // Refresh counts after reset
          await updateScanCounts();
        } catch (error) {
          console.error('Error resetting serial counter:', error);
          showDialog(
            'Reset Error',
            error.message || 'Failed to reset serial counter.',
            ALERT_TYPE.DANGER,
          );
        } finally {
          setResettingSerial(false);
        }
      },
    });
  }, [isSyncing, isDownloadingProducts, isAutoSyncing, showDialog, showToast]);

  // ---------------- OPTIMIZED PRODUCT DOWNLOAD ----------------
  const handleDownloadProducts = useCallback(async () => {
    if (isDownloadingProducts) {
      showToast('Download already in progress', ALERT_TYPE.WARNING, 'Download');
      return;
    }

    if (isSyncing || isAutoSyncing) {
      showDialog('Sync in Progress', 'Please wait for sync to complete before downloading products.', ALERT_TYPE.WARNING);
      return;
    }

    setIsDownloadingProducts(true);
    setDownloadProgress({ current: 0, total: 0 });

    try {
      await productDBManager.initDB();
      showToast('Downloading products...', ALERT_TYPE.INFO, 'Download');

      const response = await fetch(`${ENV.BaseURL}/api/Scales/products`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const products = await response.json();
      console.log("download", products);
      
      if (!Array.isArray(products)) {
        throw new Error('Invalid response format: expected array of products');
      }

      if (products.length === 0) {
        showToast('No products available to download', ALERT_TYPE.INFO, 'Download');
        return;
      }

      setDownloadProgress({ current: 0, total: products.length });

      const saveResult = await productDBManager.saveProductsWithProgress(
        products,
        (progress) => {
          if (isMounted.current) {
            setDownloadProgress({ 
              current: progress.processed, 
              total: progress.total 
            });
          }
        }
      );

      const finalCount = await productDBManager.getProductsCount();
      
      if (isMounted.current) {
        setProductsCount(finalCount);
        
        if (saveResult.failed > 0) {
          showToast(
            `${finalCount} products downloaded (${saveResult.failed} failed)`, 
            ALERT_TYPE.WARNING, 
            'Download Complete'
          );
        } else {
          showToast(
            `${finalCount} products downloaded successfully!`, 
            ALERT_TYPE.SUCCESS, 
            'Download Complete'
          );
        }
      }

    } catch (error) {
      console.error('❌ Error downloading products:', error);
      
      if (isMounted.current) {
        const errorMessage = error.message.includes('network') 
          ? 'Network error. Please check your connection.'
          : `Download failed: ${error.message}`;
        
        showDialog('Download Error', errorMessage, ALERT_TYPE.DANGER);
      }
    } finally {
      if (isMounted.current) {
        setIsDownloadingProducts(false);
        setDownloadProgress({ current: 0, total: 0 });
      }
    }
  }, [isDownloadingProducts, isSyncing, isAutoSyncing, showDialog, showToast]);

  // ---------------- LOAD PRODUCTS COUNT ON MOUNT ----------------
  const loadProductsCount = useCallback(async () => {
    try {
      await productDBManager.initDB();
      const count = await productDBManager.getProductsCount();
      if (isMounted.current) {
        setProductsCount(count);
      }
    } catch (error) {
      console.warn('⚠️ Could not load products count:', error);
    }
  }, []);

  // ---------------- OPTIMIZED UPDATE SCAN COUNTS ----------------
  const updateScanCounts = useCallback(async () => {
    if (!dbRef.current || !isMounted.current) return;
    
    try {
      const results = await dbRef.current.executeSql(`SELECT * FROM scans`);
      let today = 0, yesterday = 0, total = 0, pending = 0;

      const now = new Date();
      const todayDate = now.toISOString().slice(0, 10);
      const yesterdayDate = new Date(now);
      yesterdayDate.setDate(now.getDate() - 1);
      const yesterdayISO = yesterdayDate.toISOString().slice(0, 10);

      results.forEach(result => {
        total += result.rows.length;
        
        for (let i = 0; i < result.rows.length; i++) {
          const row = result.rows.item(i);
          
          try {
            const storedISO = parseScanDate(row.datetime).slice(0, 10);
            if (storedISO === todayDate) today++;
            if (storedISO === yesterdayISO) yesterday++;
            if (row.sync_status === 0) pending++;
          } catch (error) {
            console.warn('⚠️ Error parsing date for row:', row.sr1, error);
          }
        }
      });

      if (isMounted.current) {
        setTodayScanCount(today);
        setYesterdayScanCount(yesterday);
        setTotalScanCount(total);
        setPendingSyncCount(pending);
      }
    } catch (err) {
      console.error('❌ Error updating scan counts:', err);
      showDialog('Database Error', 'Failed to update scan counts', ALERT_TYPE.DANGER);
    }
  }, [showDialog]);

  // ---------------- AUTO REFRESH WHEN SCREEN FOCUSES ----------------
  useFocusEffect(
    useCallback(() => {
      if (dbRef.current && !isLoading) {
        updateScanCounts();
        loadProductsCount();
      }
    }, [isLoading, updateScanCounts, loadProductsCount])
  );

  // ---------------- OPTIMIZED INIT DB ----------------
  useEffect(() => {
    const initDB = async () => {
      try {
        setIsLoading(true);
        const dbConnection = await getDBConnection();
        
        if (!isMounted.current) {
          return;
        }
        
        dbRef.current = dbConnection;
        await createTable(dbConnection);
        console.log('✅ Database initialized');
        await updateScanCounts();
        await loadProductsCount();
        
        // Start auto-sync after DB initialization
        startAutoSync();
      } catch (err) {
        console.error('❌ DB init error:', err);
        showDialog('Database Error', 'Failed to initialize database', ALERT_TYPE.DANGER);
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    initDB();

    return () => {
      stopAutoSync();
    };
  }, [updateScanCounts, showDialog, loadProductsCount, startAutoSync, stopAutoSync]);

  // ---------------- GET UNSYNCED RECORDS ----------------
  const getUnsyncedRecords = useCallback(async () => {
    if (!dbRef.current) return [];
    
    try {
      const results = await dbRef.current.executeSql(
        `SELECT * FROM scans WHERE sync_status = 0 ORDER BY sr1 ASC`
      );
      
      const unsynced = [];
      results.forEach(result => {
        for (let i = 0; i < result.rows.length; i++) {
          unsynced.push(result.rows.item(i));
        }
      });
      
      return unsynced;
    } catch (err) {
      console.error('❌ Error getting unsynced records:', err);
      showDialog('Sync Error', 'Failed to get unsynced records', ALERT_TYPE.DANGER);
      return [];
    }
  }, [showDialog]);

  // ---------------- OPTIMIZED SYNC WITH PROGRESS TRACKING ----------------
  const handleSync = useCallback(async () => {
    if (!dbRef.current) {
      showDialog('Database Error', 'DB not initialized.', ALERT_TYPE.DANGER);
      return;
    }

    if (isSyncing || isAutoSyncing) {
      showDialog('Sync in Progress', 'Please wait for current sync to complete.', ALERT_TYPE.WARNING);
      return;
    }

    try {
      const unsynced = await getUnsyncedRecords();

      if (unsynced.length === 0) {
        showToast('No new records to sync.', ALERT_TYPE.INFO, 'Sync');
        return;
      }

      setUnsyncedRecords(unsynced);
      setShowSyncModal(true);

    } catch (err) {
      console.error('❌ Sync preparation error:', err);
      showDialog('Sync Error', 'Failed to prepare sync data.', ALERT_TYPE.DANGER);
    }
  }, [isSyncing, isAutoSyncing, getUnsyncedRecords, showDialog, showToast]);

  // Handle sync confirmation from custom modal
  const handleSyncConfirm = useCallback(() => {
    setShowSyncModal(false);
    setIsSyncing(true);
    setSyncProgress({ current: 0, total: 0, success: 0, failed: 0 });
    processSyncWithProgress(unsyncedRecords);
  }, [unsyncedRecords]);

  // Handle sync cancellation from custom modal
  const handleSyncCancel = useCallback(() => {
    setShowSyncModal(false);
    setUnsyncedRecords([]);
  }, []);

const processSyncWithProgress = async (unsynced) => {
  let successCount = 0;
  let failCount = 0;

  setSyncProgress({ 
    current: 0, 
    total: unsynced.length, 
    success: 0, 
    failed: 0 
  });

  for (const [index, scan] of unsynced.entries()) {
    try {
      let imageBase64 = null;
      if (scan.image_uri) {
        try {
          imageBase64 = await RNFS.readFile(scan.image_uri, 'base64');
        } catch (err) {
          console.log('Image', scan);
          console.warn(`⚠️ Failed to read image sr1=${scan.sr1}:`, err);
        }
      }

      // Parse and validate date
      let scaleProcessDT;
      try {
        scaleProcessDT = parseScanDate(scan.datetime);
        if (!scaleProcessDT || isNaN(new Date(scaleProcessDT).getTime())) {
          throw new Error('Invalid date format');
        }
      } catch (dateError) {
        console.log('scaledate', scan);
        console.warn(`⚠️ Invalid date for sr1=${scan.sr1}:`, scan.datetime);
        scaleProcessDT = new Date().toISOString();
      }
console.log('complete record', scan);
      // Convert to server's exact expected format
      const payload = {
        Id: 0, // Server will auto-generate this
        ItemID: scan.item_ID, // Not in mobile DB
        ItemCode: scan.item_Code, // Not in mobile DB
        ItemName: scan.product_name || 'Unknown Product',
        ItemNameUrdu: null, // Not in mobile DB
        scaleWeight: scan.weight_value ? parseFloat(scan.weight_value) : 0,
        Qty: typeof scan.quantity === 'string' ? 1 : (scan.quantity || 1),
        scaleImage: imageBase64 || null,
        scaleProcessDT: scaleProcessDT,
        SyncDT: new Date().toISOString(),
        SyncUserID: userId ? parseInt(userId) : null,
        BatchID: null, // Not in mobile DB
        BatchNo: null, // Not in mobile DB
        IsActive: true,
        InputToken: scan.input_token ? parseInt(scan.input_token) : 0,
        OutToken: scan.output_token ? parseInt(scan.output_token) : 0,
        total_token: scan.total_token ? parseInt(scan.total_token) : 0,
        scaleType: scan.type || 'Digital'
      };

      // Log the payload for debugging
      console.log(`📤 Manual sync payload for sr1=${scan.sr1}:`, {
        sr1: scan.sr1,
        ItemName: payload.ItemName,
        scaleWeight: payload.scaleWeight,
        Qty: payload.Qty
      });

      const response = await fetch(`${ENV.BaseURL}/api/Scales`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        timeout: 30000,
      });

      // Get response body for better error messages
      let responseBody;
      try {
        responseBody = await response.text();
      } catch (e) {
        responseBody = 'Could not read response body';
      }

      if (!response.ok) {
        console.error(`❌ Manual sync failed for sr1=${scan.sr1}:`, {
          status: response.status,
          statusText: response.statusText,
          body: responseBody
        });
        
        if (response.status === 400) {
          console.log(`🔧 Server returned 400 for sr1=${scan.sr1}. Response:`, responseBody);
        }
        
        failCount++;
      } else {
        await dbRef.current.executeSql(
          `UPDATE scans SET sync_status = 1 WHERE sr1 = ?`,
          [scan.sr1]
        );
        successCount++;
        console.log(`✅ Manual sync successful for sr1=${scan.sr1}`);
      }
      
    } catch (err) {
      console.error(`❌ Manual sync error for sr1=${scan.sr1}:`, err);
      failCount++;
    }

    setSyncProgress({ 
      current: index + 1, 
      total: unsynced.length, 
      success: successCount, 
      failed: failCount 
    });
  }

  if (isMounted.current) {
    if (failCount === 0) {
      showToast(`${successCount} records synced successfully!`, ALERT_TYPE.SUCCESS, 'Sync Complete');
    } else {
      showDialog('Sync Completed with Errors', `Success: ${successCount}, Failed: ${failCount}`, ALERT_TYPE.WARNING);
    }
    
    await updateScanCounts();
    setIsSyncing(false);
    setTimeout(() => {
      if (isMounted.current) {
        setSyncProgress({ current: 0, total: 0, success: 0, failed: 0 });
      }
    }, 2000);
  }
};
  // ---------------- OPTIMIZED NAVIGATION WITH SYNC BLOCKING ----------------
  const handleDigitalScan = useCallback(() => {
    if (isSyncing || isDownloadingProducts || resettingSerial || isAutoSyncing) {
      showDialog('Operation in Progress', 'Please wait for current operation to complete before scanning.', ALERT_TYPE.WARNING);
      return;
    }
    navigation.navigate('DigitalScaleScan', { 
      autoLaunchCamera: true,
      onScanComplete: updateScanCounts
    });
  }, [navigation, isSyncing, isDownloadingProducts, resettingSerial, isAutoSyncing, updateScanCounts, showDialog]);

  const handleNonScaleScan = useCallback(() => {
    if (isSyncing || isDownloadingProducts || resettingSerial || isAutoSyncing) {
      showDialog('Operation in Progress', 'Please wait for current operation to complete before scanning.', ALERT_TYPE.WARNING);
      return;
    }
    navigation.navigate('NonDigitalScan', { 
      autoLaunchCamera: true,
      onScanComplete: updateScanCounts
    });
  }, [navigation, isSyncing, isDownloadingProducts, resettingSerial, isAutoSyncing, updateScanCounts, showDialog]);

  const toggleButton = useCallback(() => {
    if (isSyncing || isDownloadingProducts || resettingSerial || isAutoSyncing) {
      showDialog('Operation in Progress', 'Please wait for current operation to complete.', ALERT_TYPE.WARNING);
      return;
    }
    setVisible(prev => !prev);
  }, [isSyncing, isDownloadingProducts, resettingSerial, isAutoSyncing, showDialog]);

  // Check if any operation is in progress
  const isOperationInProgress = isSyncing || isLoggingOut || isDownloadingProducts || resettingSerial || isAutoSyncing;

  // ---------------- RENDER LOADING STATE ----------------
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{userName}</Text>
          {isAutoSyncing && (
            <View style={styles.autoSyncIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.autoSyncText}>Auto-syncing...</Text>
            </View>
          )}
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsRow}>
          <View style={styles.card}>
            <Icon name="calendar-today" size={30} color={colors.primary} />
            <Text style={styles.cardTitle}>Today Scan</Text>
            <Text style={styles.cardCount}>{todayScanCount}</Text>
          </View>

          <View style={styles.card}>
            <Icon
              name="calendar-minus"
              size={30}
              color={colors.orange || '#ff9800'}
            />
            <Text style={styles.cardTitle}>Yesterday Scan</Text>
            <Text style={styles.cardCount}>{yesterdayScanCount}</Text>
          </View>

          <View style={styles.card}>
            <Icon name="chart-bar" size={30} color={colors.green || '#4caf50'} />
            <Text style={styles.cardTitle}>Total Scan</Text>
            <Text style={styles.cardCount}>{totalScanCount}</Text>
          </View>

          <View style={styles.card}>
            <Icon name="sync-alert" size={30} color={colors.danger || '#dc3545'} />
            <Text style={styles.cardTitle}>Pending Sync</Text>
            <Text style={styles.cardCount}>{pendingSyncCount}</Text>
          </View>
        </View>

        {/* Auto Sync Status */}
        {isAutoSyncing && (
          <View style={styles.autoSyncStatus}>
            <Icon name="sync" size={16} color={colors.primary} />
            <Text style={styles.autoSyncStatusText}>
              Auto-sync in progress...
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Download Products Button */}
          <TouchableOpacity
            style={[
              styles.scanButton, 
              { backgroundColor: colors.green || '#4caf50' },
              (isOperationInProgress) && styles.disabledButton
            ]}
            onPress={handleDownloadProducts}
            disabled={isOperationInProgress}
          >
            {isDownloadingProducts ? (
              <View style={styles.downloadProgressContainer}>
                <ActivityIndicator size="small" color={colors.white} style={styles.iconMargin} />
                <Text style={styles.downloadProgressText}>
                  {downloadProgress.total > 0 
                    ? `${downloadProgress.current}/${downloadProgress.total}` 
                    : 'Downloading...'
                  }
                </Text>
              </View>
            ) : (
              <>
                <Icon name="download" size={22} color={colors.white} style={styles.iconMargin} />
                <Text style={styles.scanButtonText}>Download Products</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Reset Serial Counter Button */}
          <TouchableOpacity
            style={[
              styles.scanButton, 
              { backgroundColor: colors.purple || '#6f42c1' },
              (isOperationInProgress) && styles.disabledButton
            ]}
            onPress={handleResetSerialCounter}
            disabled={isOperationInProgress}
          >
            {resettingSerial ? (
              <ActivityIndicator size="small" color={colors.white} style={styles.iconMargin} />
            ) : (
              <Icon name="refresh" size={22} color={colors.white} style={styles.iconMargin} />
            )}
            <Text style={styles.scanButtonText}>
              {resettingSerial ? 'Resetting...' : 'Reset Serial Counter'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.scanButton,
              isOperationInProgress && styles.disabledButton
            ]} 
            onPress={handleDigitalScan}
            disabled={isOperationInProgress}
          >
            <Icon name="scale" size={22} color={colors.white} style={styles.iconMargin} />
            <Text style={styles.scanButtonText}>Add Production (Scale)</Text>
          </TouchableOpacity>

          {visible && (
            <TouchableOpacity
              style={[
                styles.scanButton, 
                { backgroundColor: colors.secondary || '#2196f3' },
                isOperationInProgress && styles.disabledButton
              ]}
              onPress={handleNonScaleScan}
              disabled={isOperationInProgress}
            >
              <Icon name="camera" size={22} color={colors.white} style={styles.iconMargin} />
              <Text style={styles.scanButtonText}>Add Production (Non Scale)</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.scanButton, 
              { backgroundColor: colors.orange || '#ff9800' },
              (isOperationInProgress || pendingSyncCount === 0) && styles.disabledButton
            ]}
            onPress={handleSync}
            disabled={isOperationInProgress || pendingSyncCount === 0}
          >
            {isSyncing ? (
              <View style={styles.syncProgressContainer}>
                <ActivityIndicator size="small" color={colors.white} style={styles.iconMargin} />
                <Text style={styles.syncProgressText}>
                  {syncProgress.total > 0 
                    ? `${syncProgress.current}/${syncProgress.total}` 
                    : 'Preparing...'
                  }
                </Text>
              </View>
            ) : (
              <>
                <Icon name="sync" size={22} color={colors.white} style={styles.iconMargin} />
                <Text style={styles.scanButtonText}>
                  {pendingSyncCount === 0 ? 'All Synced' : 'Sync Data'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Download Status Indicator */}
        {isDownloadingProducts && (
          <View style={styles.downloadStatusContainer}>
            <Text style={styles.downloadStatusText}>
              Downloading Products: {downloadProgress.current} of {downloadProgress.total}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${downloadProgress.total > 0 
                      ? (downloadProgress.current / downloadProgress.total) * 100 
                      : 0
                    }%`,
                    backgroundColor: colors.green 
                  }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Sync Status Indicator */}
        {isSyncing && (
          <View style={styles.syncStatusContainer}>
            <Text style={styles.syncStatusText}>
              Syncing: {syncProgress.current} of {syncProgress.total} records
            </Text>
            <Text style={styles.syncStatusSubText}>
              ✓ Success: {syncProgress.success} • ✗ Failed: {syncProgress.failed}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${syncProgress.total > 0 
                      ? (syncProgress.current / syncProgress.total) * 100 
                      : 0
                    }%` 
                  }
                ]} 
              />
            </View>
          </View>
        )}

        <Text style={styles.footer}>Smart Weighing • Version 1.0.0 • Auto-sync: Every 15 min</Text>
      </ScrollView>

      {/* Custom Sync Confirmation Modal */}
      <Modal
        visible={showSyncModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSyncCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Icon name="sync-alert" size={28} color={colors.orange} />
              <Text style={styles.modalTitle}>Start Sync?</Text>
            </View>
            
            <Text style={styles.modalText}>
              Found {unsyncedRecords.length} unsynced records.{'\n'}Do you want to start syncing?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={handleSyncCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.syncButton]} 
                onPress={handleSyncConfirm}
              >
                <Icon name="sync" size={18} color={colors.white} style={styles.buttonIcon} />
                <Text style={styles.syncButtonText}>Sync</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Hidden Toggle Button */}
      <TouchableOpacity 
        style={[
          styles.toggleButton,
          isOperationInProgress && styles.disabledToggleButton
        ]} 
        onPress={toggleButton}
        disabled={isOperationInProgress}
      >
        <Text style={styles.buttonText}>{visible ? "" : ""}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background || '#f7f8fa' 
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textDark || '#1a1a1a',
    fontWeight: '600',
  },
  scroll: { 
    padding: 20, 
    paddingBottom: 60 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30 
  },
  title: { 
    fontSize: 26, 
    fontWeight: '700', 
    color: colors.textDark || '#1a1a1a' 
  },
  autoSyncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  autoSyncText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  logoutButton: {
    padding: 8,
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    flexWrap: 'wrap',
    marginBottom: 20 
  },
  card: { 
    width: '48%',
    backgroundColor: colors.white || '#fff', 
    borderRadius: 14, 
    paddingVertical: 20, 
    paddingHorizontal: 10, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10,
    shadowColor: colors.shadow || '#000', 
    shadowOpacity: 0.1, 
    shadowOffset: { width: 0, height: 3 }, 
    shadowRadius: 5, 
    elevation: 4 
  },
  cardTitle: { 
    marginTop: 10, 
    fontSize: 14, 
    color: colors.textDark || '#333', 
    fontWeight: '600', 
    textAlign: 'center' 
  },
  cardCount: { 
    marginTop: 4, 
    fontSize: 22, 
    fontWeight: '700', 
    color: colors.primary || '#007aff' 
  },
  autoSyncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  autoSyncStatusText: {
    fontSize: 14,
    color: colors.green,
    fontWeight: '600',
    marginLeft: 8,
  },
  productsCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 4,
  },
  productsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginLeft: 12,
  },
  productsCount: {
    fontSize: 14,
    color: colors.textLight || '#666',
    fontWeight: '500',
  },
  buttonsContainer: { 
    marginBottom: 20 
  },
  scanButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: colors.primary || '#007aff', 
    borderRadius: 14, 
    paddingVertical: 15, 
    marginBottom: 15, 
    shadowColor: colors.primary || '#007aff', 
    shadowOpacity: 0.3, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowRadius: 6, 
    elevation: 5 
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.6
  },
  iconMargin: { 
    marginRight: 10 
  },
  scanButtonText: { 
    color: colors.white || '#fff', 
    fontSize: 17, 
    fontWeight: '600', 
    letterSpacing: 0.3 
  },
  downloadProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadProgressText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  syncProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncProgressText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  downloadStatusContainer: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  downloadStatusText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 8,
    fontWeight: '600',
  },
  syncStatusContainer: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  syncStatusText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 4,
    fontWeight: '600',
  },
  syncStatusSubText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textLight || '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  footer: { 
    textAlign: 'center', 
    color: colors.footer || '#777', 
    fontSize: 13 
  },
  toggleButton: {
    position: "absolute",
    bottom: 10,
    left: 10,
    width: 10,
    height: 10,
    borderRadius: 20,
    backgroundColor: "#007bff",
    opacity: 0.1,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  disabledToggleButton: {
    opacity: 0.05,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
    marginLeft: 12,
  },
  modalText: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 44,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  syncButton: {
    backgroundColor: colors.orange || '#ff9800',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
});

export default DashboardScreen;