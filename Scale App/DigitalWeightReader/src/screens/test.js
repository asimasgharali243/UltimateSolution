import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { productDBManager } from '../utils/Product_DB';

const DropdownComponent = () => {
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch digital products on component mount
  useEffect(() => {
    fetchDigitalProducts();
  }, []);

  const fetchDigitalProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize database if needed
      await productDBManager.initDB();
      
      // Fetch digital products (subCategory_Id = 1 and item_Type = 'Product')
      const products = await productDBManager.getDigitalProducts();
      console.log('products', products);
      
      // Transform products to dropdown format
      const dropdownData = products.map(product => ({
        label: `${product.Item_Name} (ID: ${product.item_ID})`, // Combine name and ID
        value: product.Item_Name,
        originalData: product
      }));
      
      setData(dropdownData);
      console.log(`✅ Loaded ${dropdownData.length} digital products`);
    } catch (err) {
      console.error('❌ Error fetching digital products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Text style={[styles.label, isFocus && { color: 'blue' }]}>
          Select Digital Product
        </Text>
      );
    }
    return null;
  };

  // Show loading indicator
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading digital products...</Text>
      </View>
    );
  }

  // Show error message
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={fetchDigitalProducts}>
          Tap to retry
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderLabel()}
      <Dropdown
        style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        iconStyle={styles.iconStyle}
        data={data}
        search
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? 'Select digital product' : '...'}
        searchPlaceholder="Search products..."
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={item => {
          setValue(item.value);
          setIsFocus(false);
          console.log('Selected product:', item);
        }}
      />
      
      {/* Display selected product details */}
      {value && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>Selected Product:</Text>
          <Text style={styles.selectedText}>
            ID: {value}
          </Text>
          <Text style={styles.selectedText}>
            Name: {data.find(item => item.value === value)?.originalData?.Item_Name}
          </Text>
          {data.find(item => item.value === value)?.originalData?.Item_NameUrdu && (
            <Text style={styles.selectedUrduText}>
              Urdu: {data.find(item => item.value === value).originalData.Item_NameUrdu}
            </Text>
          )}
        </View>
      )}
      
      {/* Display summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          Total digital products: {data.length}
        </Text>
      </View>
    </View>
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 16,
    flex: 1,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: 'red',
  },
  retryText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  selectedContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedText: {
    fontSize: 14,
    color: '#333',
  },
  selectedUrduText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'System',
    marginTop: 2,
  },
  summaryContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8f4fd',
    borderRadius: 5,
  },
  summaryText: {
    fontSize: 14,
    color: '#0066cc',
    textAlign: 'center',
  },
});