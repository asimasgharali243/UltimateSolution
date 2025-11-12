import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import moment from 'moment';
import { useRoute } from '@react-navigation/native';

const BillDetailScreen = () => {
  const route = useRoute();
  const { bill } = route.params; // 👈 receive bill object
  console.log(bill);
  if (!bill) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No bill details available.</Text>
      </View>
    );
  }

  const formatDate = date => (date ? moment(date).format('DD-MM-YYYY') : '-');

  const renderRow = (label, value) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? '-'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Bill Details</Text>

      <View style={styles.card}>
        {renderRow('Property No', bill.propertyNo)}
        {renderRow('Consumer Name', bill.consumerName)}
        {renderRow('Contact Person', bill.contactPerson)}
        {renderRow('Bill Month', bill.batchMonth)}
        {renderRow('Bill Year', bill.batchYear)}
        {renderRow('Start Date', formatDate(bill.startDate))}
        {renderRow('Due Date', formatDate(bill.dueDate))}
        {renderRow('Current Reading Peak', bill.currentReadingPeak)}
        {renderRow('Unit Consumed Peak', bill.unitConsumedPeak)}
        {renderRow('Unit Rate Peak', bill.unitRatePeak)}
        {renderRow('Subsidy', bill.subsidy)}
        {renderRow('Extra Charges', bill.extraCharges)}
        {renderRow('Fine', bill.fine)}
        {renderRow('Water Charges', bill.waterCharges)}
        {renderRow('Extra', bill.extra)}
        {renderRow('Current Bill (Rs)', bill.currentBill)}
        {renderRow('Previous Balance', bill.prevBalance)}
        {renderRow('Previous Reading', bill.prevReading)}
      </View>
    </ScrollView>
  );
};

export default BillDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007bff',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 0.8,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  label: {
    fontWeight: '700',
    color: '#333',
    width: '50%',
  },
  value: {
    color: '#555',
    textAlign: 'right',
    width: '45%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
