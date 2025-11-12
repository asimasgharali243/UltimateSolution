import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import ENV from '../env';
const BASE_URL = 'http://192.168.0.110:5172/api/report'; // 🔹 your backend URL

const DueBillsScreen = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const fetchBills = async () => {
    try {
      setLoading(true);
      const consumerId = 1; // 🔹 Replace with actual consumer ID
      const today = moment().format('MM-DD-YYYY');

      const response = await fetch(
        `${ENV.BaseURL}/api/report/bill-preview/${consumerId}/${today}`,
      );
      if (!response.ok) throw new Error('Failed to fetch bills');

      const data = await response.json();
      Alert.alert('Success', 'Bills fetched successfully');
      console.log(data);
      setBills(data);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleView = bill => {
    navigation.navigate('BillDetailScreen', { bill });
  };

  const handlePaid = bill => {
    Alert.alert('Payment', `Marked bill for ${bill.BatchMonth} as paid.`);
    // You can add a PATCH/POST request here to update payment status in backend
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Due Bills</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginTop: 30 }}
        />
      ) : bills.length === 0 ? (
        <Text style={styles.noData}>No due bills found.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Table Header */}
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.headerCell, { width: 50 }]}>
                Sr
              </Text>
              <Text style={[styles.cell, styles.headerCell, { width: 120 }]}>
                Bill Month
              </Text>
              <Text style={[styles.cell, styles.headerCell, { width: 120 }]}>
                Bill Amount
              </Text>
              <Text style={[styles.cell, styles.headerCell, { width: 120 }]}>
                Due Date
              </Text>
              <Text style={[styles.cell, styles.headerCell, { width: 180 }]}>
                Action
              </Text>
            </View>

            {/* Table Rows */}
            {bills.map((bill, index) => (
              <View key={index} style={styles.row}>
                <Text style={[styles.cell, { width: 50 }]}>{index + 1}</Text>
                <Text style={[styles.cell, { width: 120 }]}>
                  {bill.batchMonth || '-'}
                </Text>
                <Text style={[styles.cell, { width: 120 }]}>
                  Rs. {bill.currentBill ?? 0}
                </Text>
                <Text style={[styles.cell, { width: 120 }]}>
                  {bill.dueDate
                    ? moment(bill.dueDate).format('DD-MM-YYYY')
                    : '-'}
                </Text>

                {/* Actions */}
                <View
                  style={[
                    styles.cell,
                    {
                      width: 180,
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleView(bill)}
                  >
                    <Text style={styles.btnText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.paidButton}
                    onPress={() => handlePaid(bill)}
                  >
                    <Text style={styles.btnText}>Paid</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default DueBillsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 40,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10,
    alignItems: 'center',
  },
  headerRow: {
    backgroundColor: '#007bff',
  },
  cell: {
    textAlign: 'center',
    color: '#333',
  },
  headerCell: {
    color: '#fff',
    fontWeight: '700',
  },
  viewButton: {
    backgroundColor: '#17a2b8',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  paidButton: {
    backgroundColor: '#28a745',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
