import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useRoute } from '@react-navigation/native';
import LedgerPDFGenerator from '../Components/LedgerDownload'; // ✅ Import your PDF component
import Icon from 'react-native-vector-icons/FontAwesome';
import ENV from '../env';

const AccountLedgerScreen = () => {
  const route = useRoute();
  const { consumerID } = route.params || {};
  const [accountNo] = useState(consumerID);
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState([]);

  const formatDate = date => moment(date).format('MM-DD-YYYY');

  // 🔹 Fetch ledger data
  const fetchLedger = async () => {
    if (!accountNo) {
      Alert.alert('Validation', 'Please enter Consumer ID.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${ENV.BaseURL}/api/report/account-ledger/${accountNo}/${formatDate(
          dateFrom,
        )}/${formatDate(dateTo)}`,
      );

      if (!response.ok) {
        const text = await response.text();
        console.log('Ledger Fetch Error:', text, response);
        throw new Error(text || 'Failed to fetch ledger');
      }

      const data = await response.json();
      setLedgerData(data);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📘 Account Ledger Report</Text>

      {/* Consumer Details */}
      {ledgerData.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.infoHeading}>Consumer Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Consumer Name:</Text>
            <Text style={styles.infoValue}>{ledgerData[0].consumerName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Property No:</Text>
            <Text style={styles.infoValue}>{ledgerData[0].propertyNo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Opening Balance:</Text>
            <Text style={styles.infoValue}>
              {parseFloat(ledgerData[0].openingBalance || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {/* Consumer ID */}
      {/* <View style={styles.inputGroup}>
        <Text style={styles.label}>Consumer ID</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#e9ecef' }]}
          value={accountNo ? String(accountNo) : ''}
          editable={false}
        />
      </View> */}

      {/* Date Range */}
      <View style={styles.dateRow}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowFromPicker(true)}
        >
          <Text>From: {formatDate(dateFrom)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowToPicker(true)}
        >
          <Text>To: {formatDate(dateTo)}</Text>
        </TouchableOpacity>
      </View>

      {showFromPicker && (
        <DateTimePicker
          value={dateFrom}
          mode="date"
          display="default"
          onChange={(e, selected) => {
            setShowFromPicker(false);
            if (selected) setDateFrom(selected);
          }}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={dateTo}
          mode="date"
          display="default"
          onChange={(e, selected) => {
            setShowToPicker(false);
            if (selected) setDateTo(selected);
          }}
        />
      )}

      <View style={styles.row}>
        <TouchableOpacity style={styles.fetchButton} onPress={fetchLedger}>
          <Icon name="refresh" size={18} color="#fff" style={styles.icon} />
          <Text style={styles.fetchButtonText}>Fetch</Text>
        </TouchableOpacity>

        <View style={styles.flexButtonWrapper}>
          <LedgerPDFGenerator
            ledgerData={ledgerData}
            dateFrom={dateFrom}
            dateTo={dateTo}
          />
        </View>
      </View>

      {/* Loader */}
      {loading && (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginVertical: 10 }}
        />
      )}

      {/* Ledger Table */}
      {ledgerData.length > 0 && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tableContainer}>
              <View style={[styles.tableRow, styles.headerRowBlue]}>
                <Text style={[styles.headerCell, { width: 40 }]}>Sr</Text>
                <Text style={[styles.headerCell, { width: 100 }]}>Date</Text>
                <Text style={[styles.headerCell, { width: 80 }]}>Voucher</Text>
                <Text style={[styles.headerCell, { width: 200 }]}>
                  Description
                </Text>
                <Text style={[styles.headerCell, { width: 90 }]}>Debit</Text>
                <Text style={[styles.headerCell, { width: 90 }]}>Credit</Text>
                <Text style={[styles.headerCell, { width: 100 }]}>Balance</Text>
              </View>

              <FlatList
                data={ledgerData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.tableRow}>
                    <Text
                      style={[styles.cell, { width: 40, textAlign: 'center' }]}
                    >
                      {index + 1}
                    </Text>
                    <Text
                      style={[styles.cell, { width: 100, textAlign: 'center' }]}
                    >
                      {moment(item.date).format('MM/DD/YYYY')}
                    </Text>
                    <Text
                      style={[styles.cell, { width: 80, textAlign: 'center' }]}
                    >
                      {item.voucher_No || '-'}
                    </Text>
                    <Text
                      style={[styles.cell, { width: 200, flexWrap: 'wrap' }]}
                    >
                      {item.descriptions || '-'}
                    </Text>
                    <Text
                      style={[styles.cell, { width: 90, textAlign: 'center' }]}
                    >
                      {parseFloat(item.debit || 0).toFixed(2)}
                    </Text>
                    <Text
                      style={[styles.cell, { width: 90, textAlign: 'center' }]}
                    >
                      {parseFloat(item.credit || 0).toFixed(2)}
                    </Text>
                    <Text
                      style={[styles.cell, { width: 100, textAlign: 'center' }]}
                    >
                      {item.openingBalance
                        ? (
                            parseFloat(item.openingBalance) +
                            (parseFloat(item.credit || 0) -
                              parseFloat(item.debit || 0))
                          ).toFixed(2)
                        : '0.00'}
                    </Text>
                  </View>
                )}
              />
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
};

export default AccountLedgerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: { marginBottom: 10 },
  label: { fontSize: 14, marginBottom: 4, color: '#555' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    color: '#333',
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateButton: {
    flex: 0.48,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    flexWrap: 'wrap', // ✅ Prevent overflow on small screens
    gap: 8, // ✅ spacing between buttons (React Native 0.71+)
  },

  fetchButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // ✅ makes both buttons share available width
    minWidth: 120, // ✅ ensures button stays readable
    flexShrink: 1, // ✅ allows shrinking on small screens
  },

  fetchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  icon: {
    marginRight: 6,
  },

  flexButtonWrapper: {
    flex: 1, // ✅ ensures Download button auto resizes like Fetch
    flexShrink: 1,
    minWidth: 120,
  },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  infoLabel: { fontSize: 14, color: '#555', fontWeight: '600' },
  infoValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  tableContainer: {
    marginTop: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 700,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },
  headerRowBlue: {
    backgroundColor: '#007bff',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 6,
    paddingVertical: 6,
    textAlign: 'center',
  },
  cell: {
    fontSize: 13,
    color: '#333',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
});
