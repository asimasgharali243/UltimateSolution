import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { productDBManager } from '../utils/Product_DB';
import colors from '../styles/colors';
import { useProduct } from '../contexts/ProductContext'; // ADD THIS IMPORT
import { useFocusEffect } from '@react-navigation/native'; // ADD THIS IMPORT

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SearchScreen = ({ route, navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [databaseInfo, setDatabaseInfo] = useState(null);
  const [showDropdown, setShowDropdown] = useState(true); // AUTO SHOW DROPDOWN
  const [dropdownHeight] = useState(new Animated.Value(400)); // AUTO EXPAND
  
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // ✅ USE PRODUCT CONTEXT
  const { selectProduct } = useProduct();

  // ✅ AUTO FOCUS ON SCREEN ENTER
  useFocusEffect(
    useCallback(() => {
      // Auto focus on search input when screen comes into focus
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);

      // Load products automatically
      loadAllDigitalProducts();

      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  // Load database info on component mount
  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  // Use advancedProductSearch when search query changes
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim() === '') {
        // No search query - show all digital products
        if (products.length > 0) {
          setFilteredProducts(products);
        }
        setSearching(false);
      } else {
        // Has search query - use advancedProductSearch
        setSearching(true);
        setLoading(true);
        
        try {
          await productDBManager.initDB();
          const searchResults = await productDBManager.advancedProductSearch({
            searchTerm: searchQuery
          });
          setFilteredProducts(searchResults);
        } catch (error) {
          console.error('Error performing search:', error);
          Alert.alert('Error', 'Failed to search products');
        } finally {
          setLoading(false);
        }
      }
    };

    performSearch();
  }, [searchQuery]);

  const loadDatabaseInfo = async () => {
    try {
      await productDBManager.initDB();
      const info = await productDBManager.getDatabaseInfo();
      setDatabaseInfo(info);
    } catch (error) {
      console.error('Error loading database info:', error);
    }
  };

  const loadAllDigitalProducts = async () => {
    setLoading(true);
    try {
      await productDBManager.initDB();
      const digitalProducts = await productDBManager.getDigitalProducts();
      setProducts(digitalProducts);
      setFilteredProducts(digitalProducts);
      console.log(`📋 Loaded ${digitalProducts.length} digital products`);
    } catch (error) {
      console.error('Error loading digital products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFocus = async () => {
    setShowDropdown(true);
    if (products.length === 0) {
      await loadAllDigitalProducts();
    }
  };

  const handleSearchBlur = () => {
    // Don't close dropdown on blur for better UX
    // dropdown stays open until user selects a product or manually closes
  };

  const closeDropdown = () => {
    Animated.timing(dropdownHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setShowDropdown(false);
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setProducts([]);
    setFilteredProducts([]);
    setSearching(false);
    closeDropdown();
    Keyboard.dismiss();
  };

  const handleLoadDigitalProducts = async () => {
    setSearching(true);
    setLoading(true);
    setSearchQuery('');
    closeDropdown();

    try {
      await loadAllDigitalProducts();
    } catch (error) {
      console.error('Error loading digital products:', error);
      Alert.alert('Error', 'Failed to load digital products');
    }
  };

  const handleLoadAllProducts = async () => {
    setSearching(true);
    setLoading(true);
    setSearchQuery('');
    closeDropdown();
    
    await loadAllDigitalProducts();
  };

  // Helper function to get product field with fallback
  const getProductField = (product, fieldName) => {
    // Try uppercase first, then lowercase as fallback
    return product[`Item_${fieldName}`] || product[`item_${fieldName}`] || 'N/A';
  };

  const handleProductSelect = (product) => {
    const productName = getProductField(product, 'Name');
    const productCode = getProductField(product, 'Code');
    console.log('productName', productName, 'productCode', productCode);
    
    // Create product object with all necessary data
    const selectedProduct = {
      id: product.item_ID,
      name: productName,
      code: productCode,
      urduName: getProductField(product, 'NameUrdu'),
      fullData: product // Include full product data if needed
    };

    console.log('Selected product:', selectedProduct);

    // ✅ USE CONTEXT TO SET PRODUCT
    selectProduct(selectedProduct);

    // Navigate back to ScanScreen with the selected product
    navigation.goBack();
  };

  // Enhanced dropdown item with all information in one row
  const renderDropdownItem = useCallback(({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        index % 2 === 0 ? styles.dropdownItemEven : styles.dropdownItemOdd
      ]}
      onPress={() => handleProductSelect(item)}
    >
      <View style={styles.dropdownItemMain}>
        <View style={styles.dropdownCodeContainer}>
          <Text style={styles.dropdownCode} numberOfLines={1}>
            {getProductField(item, 'Code')}
          </Text>
        </View>
        <View style={styles.dropdownUrduContainer}>
          <Text style={styles.dropdownUrdu} numberOfLines={1}>
            {getProductField(item, 'NameUrdu')}
          </Text>
        </View>
      </View>
      <View style={styles.dropdownIdContainer}>
        <Text style={styles.dropdownId}>{getProductField(item, 'Name')}</Text>
      </View>
    </TouchableOpacity>
  ), []);

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon 
        name={searching ? "search-off" : "inventory-2"} 
        size={64} 
        color={colors.textLight} 
      />
      <Text style={styles.emptyTitle}>
        {searching ? 'No Products Found' : 'Product Search'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searching 
          ? `No results found for "${searchQuery}"`
          : 'Click search bar to browse all digital products'
        }
      </Text>
      {!searching && databaseInfo && (
        <View style={styles.databaseInfo}>
          <Text style={styles.infoText}>
            Database has {databaseInfo.totalProducts} total products
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Text style={styles.screenTitle}>پراڈکٹ تلاش کریں</Text>
      </View>

      {/* Search Input Section with Dropdown */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Icon name="search" size={24} color={colors.textLight} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Type to search digital products..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            returnKeyType="done"
            autoCorrect={false}
            autoCapitalize="none"
            autoFocus={true} // AUTO FOCUS
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={handleClearSearch}
              style={styles.clearButton}
            >
              <Icon name="clear" size={20} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Dropdown Container - AUTO SHOW */}
        {showDropdown && (
          <Animated.View 
            style={[
              styles.dropdownContainer,
              { height: dropdownHeight }
            ]}
            ref={dropdownRef}
          >
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>
                Products Count ({filteredProducts.length})
              </Text>
              <TouchableOpacity onPress={closeDropdown}>
                <Icon name="close" size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            
            {/* Dropdown Column Headers */}
            <View style={styles.dropdownColumnsHeader}>
              <View style={styles.dropdownHeaderCode}>
                <Text style={styles.dropdownHeaderText}>Code</Text>
              </View>
              <View style={styles.dropdownHeaderUrdu}>
                <Text style={styles.dropdownHeaderText}>Urdu Name</Text>
              </View>
            </View>
            
            {loading ? (
              <View style={styles.dropdownLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.dropdownLoadingText}>Loading products...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                renderItem={renderDropdownItem}
                keyExtractor={(item) => item.item_ID.toString()}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                style={styles.dropdownList}
                initialNumToRender={15}
              />
            )}
          </Animated.View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.digitalButton]}
            onPress={handleLoadDigitalProducts}
            disabled={loading}
          >
            <Icon name="smartphone" size={20} color={colors.white} />
            <Text style={styles.buttonText}>Digital Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.allButton]}
            onPress={handleLoadAllProducts}
            disabled={loading}
          >
            <Icon name="list" size={20} color={colors.white} />
            <Text style={styles.buttonText}>Refresh All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How to use:</Text>
        <Text style={styles.infoText}>• Type in search bar to find products</Text>
        <Text style={styles.infoText}>• Click on any product to select it</Text>
        <Text style={styles.infoText}>• Selected product will be returned to Digital Scale Scan</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  searchSection: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 12,
    color: colors.textDark,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  digitalButton: {
    backgroundColor: colors.secondary,
  },
  allButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownContainer: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -16,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textDark,
  },
  dropdownColumnsHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownHeaderCode: {
    flex: 1,
  },
  dropdownHeaderUrdu: {
    alignItems:"flex-end",
    flex: 2,
  },
  dropdownHeaderText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  dropdownLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  dropdownLoadingText: {
    fontSize: 14,
    color: colors.textLight,
  },
  dropdownList: {
    flex: 1,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownItemEven: {
    backgroundColor: colors.white,
  },
  dropdownItemOdd: {
    backgroundColor: colors.background,
  },
  dropdownItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dropdownCodeContainer: {
    flex: 1,
  },
  dropdownUrduContainer: {
    flex: 2,
    paddingHorizontal: 4,
  },
  dropdownCode: {
    fontSize: 12,
    fontWeight: '600',
    color: "green",
  },
  dropdownUrdu: {
    fontSize: 12,
    color: colors.textDark,
    textAlign: 'right',
  },
  dropdownIdContainer: {
    alignItems: 'flex-start',
  },
  dropdownId: {
    fontSize: 10,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  infoSection: {
    padding: 20,
    backgroundColor: colors.primaryLight + '15',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 4,
  },
});

export default SearchScreen;