import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { useRoute } from '@react-navigation/native';
import ENV from '../env';
const BASE_URL = 'http://192.168.0.110:5172/api/report'; // 🔹 Replace with your API base URL

const DashboardScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { username, consumerID } = route.params || {};
  const [dueCount, setDueCount] = useState(0);
  const [ledgerCount, setLedgerCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch due bill count
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const consumerId = consumerID; // Replace with dynamic ID if needed
      console.log('Consumer ID:', consumerId, username);
      const today = moment().format('MM-DD-YYYY');

      // Fetch due bills
      const dueResponse = await fetch(
        `${ENV.BaseURL}/api/report/bill-preview/${consumerId}/${today}`,
      );
      if (!dueResponse.ok) {
        console.log(
          'Due Bills Response Status:',
          dueResponse.status,
          dueResponse,
        );
        throw new Error('Failed to fetch due bills');
      }

      const dueData = await dueResponse.json();
      setDueCount(dueData?.length || 0);

      // Fetch account ledger (replace endpoint with your actual API)
      const ledgerResponse = await fetch(
        `${ENV.BaseURL}/api/report/account-ledger/${consumerId}`,
      );
      if (ledgerResponse.ok) {
        const ledgerData = await ledgerResponse.json();
        setLedgerCount(ledgerData?.length || 0);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>{username}</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#007bff"
          style={{ marginTop: 50 }}
        />
      ) : (
        <>
          {/* 💰 Due Bills Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DueBillsScreen')}
          >
            <Text style={styles.cardTitle}>Due Bills</Text>
            <Text style={styles.cardValue}>{dueCount}</Text>
            <Text style={styles.cardSubtitle}>Tap to view details</Text>
          </TouchableOpacity>

          {/* 📘 Account Ledger Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AccountLedger', { consumerID })}
          >
            <Text style={styles.cardTitle}>Account Ledger</Text>
            <Text style={styles.cardValue}>{ledgerCount}</Text>
            <Text style={styles.cardSubtitle}>Tap to view ledger</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

export default DashboardScreen;

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
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007bff',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
  },
});
