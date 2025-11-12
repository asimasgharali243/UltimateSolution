import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  Keyboard,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import colors from '../styles/colors';
import { productDBManager } from '../utils/Product_DB';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SearchableDropdown = ({
  onSelect,
  placeholder = "Select a product...",
  searchPlaceholder = "Search products by name, ID, or Urdu...",
  value,
  style,
  disabled = false,
  subcategoryId = 1,
  showSubcategoryInfo = true,
  error = null,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [databaseInfo, setDatabaseInfo] = useState(null);
  const searchInputRef = useRef(null);

  // Load products when component mounts or subcategory changes
  useEffect(() => {
    loadProducts();
  }, [subcategoryId]);

  // Filter products based on search text
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(item =>
        item.Item_Name?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.Item_NameUrdu?.includes(searchText) ||
        item.item_ID?.toString().includes(searchText)
      );
      setFilteredProducts(filtered);
    }
  }, [searchText, products]);

  const loadProducts = async () => {
    if (disabled) return;
    
    setLoading(true);
    try {
      await productDBManager.initDB();
      
      // Get database info first
      const info = await productDBManager.getDatabaseInfo();
      setDatabaseInfo(info);
      
      // Load products for the selected subcategory
      const productsData = await productDBManager.getProductsByCategory(subcategoryId);
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const handleSelect = useCallback((item) => {
    onSelect(item);
    setSearchText('');
    setIsVisible(false);
    Keyboard.dismiss();
  }, [onSelect]);

  const handleToggleDropdown = async () => {
    if (disabled) return;
    
    if (!isVisible && initialLoad) {
      await loadProducts();
    }
    
    setIsVisible(!isVisible);
    if (!isVisible) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchText('');
    }
  };

  const getDisplayValue = () => {
    if (value) {
      return `${value.Item_Name} (ID: ${value.item_ID})`;
    }
    return '';
  };

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        value?.item_ID === item.item_ID && styles.selectedItem
      ]}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.Item_Name}
        </Text>
        <View style={styles.itemDetails}>
          <Text style={styles.itemId}>ID: {item.item_ID}</Text>
          {item.subCategory_Id && (
            <Text style={styles.itemCategory}>Category: {item.subCategory_Id}</Text>
          )}
        </View>
        {item.Item_NameUrdu && (
          <Text style={styles.itemUrdu} numberOfLines={1}>
            {item.Item_NameUrdu}
          </Text>
        )}
      </View>
      {value?.item_ID === item.item_ID && (
        <Icon name="check" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  ), [value, handleSelect]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon 
        name={searchText ? "search-off" : "inventory"} 
        size={48} 
        color={colors.textLight} 
      />
      <Text style={styles.emptyText}>
        {searchText ? 'No products found' : 'No products available'}
      </Text>
      <Text style={styles.emptySubtext}>
        {searchText 
          ? `No results for "${searchText}" in category ${subcategoryId}`
          : `No products found in category ${subcategoryId}`
        }
      </Text>
      {!searchText && databaseInfo && (
        <Text style={styles.emptyHint}>
          Total products in database: {databaseInfo.totalProducts}
        </Text>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View>
        <Text style={styles.headerTitle}>
          Products {filteredProducts.length > 0 && `(${filteredProducts.length})`}
        </Text>
        {showSubcategoryInfo && (
          <Text style={styles.headerSubtitle}>
            Category {subcategoryId} • {databaseInfo?.totalProducts || 0} total products
          </Text>
        )}
      </View>
      {loading && <ActivityIndicator size="small" color={colors.primary} />}
    </View>
  );

  const renderFooter = () => {
    if (filteredProducts.length === 0 || !searchText) return null;
    
    return (
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          Showing {filteredProducts.length} of {products.length} products
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Selected Value Display */}
      <TouchableOpacity
        style={[
          styles.selectedContainer,
          disabled && styles.disabled,
          isVisible && styles.focused,
          error && styles.error
        ]}
        onPress={handleToggleDropdown}
        disabled={disabled}
      >
        <View style={styles.selectedContent}>
          <Text style={[
            styles.selectedText,
            !value && styles.placeholderText
          ]} numberOfLines={1}>
            {getDisplayValue() || placeholder}
          </Text>
          {value && (
            <Text style={styles.selectedSubtext}>
              {value.Item_NameUrdu || `Category: ${value.subCategory_Id}`}
            </Text>
          )}
        </View>
        <Icon
          name={isVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color={error ? colors.danger : colors.textLight}
        />
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {/* Dropdown Modal */}
      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            {/* Search Header */}
            <View style={styles.searchHeader}>
              <Text style={styles.dropdownTitle}>Select Product</Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={colors.textDark} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color={colors.textLight} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.textLight}
                value={searchText}
                onChangeText={setSearchText}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <TouchableOpacity 
                  onPress={() => setSearchText('')}
                  style={styles.clearButton}
                >
                  <Icon name="clear" size={20} color={colors.textLight} />
                </TouchableOpacity>
              )}
            </View>

            {/* Products List */}
            <View style={styles.listContainer}>
              {renderHeader()}
              {loading && initialLoad ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading products...</Text>
                  {databaseInfo && (
                    <Text style={styles.loadingSubtext}>
                      {databaseInfo.totalProducts} products in database
                    </Text>
                  )}
                </View>
              ) : (
                <FlatList
                  data={filteredProducts}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.item_ID.toString()}
                  ListEmptyComponent={renderEmpty}
                  ListFooterComponent={renderFooter}
                  showsVerticalScrollIndicator={true}
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={25}
                  maxToRenderPerBatch={50}
                  windowSize={10}
                  removeClippedSubviews={true}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  selectedContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.white,
    minHeight: 56,
  },
  selectedContent: {
    flex: 1,
  },
  selectedText: {
    fontSize: 16,
    color: colors.textDark,
    fontWeight: '500',
  },
  selectedSubtext: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  placeholderText: {
    color: colors.textLight,
  },
  disabled: {
    backgroundColor: colors.background,
    opacity: 0.6,
  },
  focused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  error: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dropdownContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textDark,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
    color: colors.textDark,
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  selectedItem: {
    backgroundColor: colors.primaryLight + '20',
  },
  itemContent: {
    flex: 1,
    marginRight: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemId: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  itemCategory: {
    fontSize: 12,
    color: colors.textLight,
  },
  itemUrdu: {
    fontSize: 12,
    color: colors.textLight,
    fontFamily: Platform.OS === 'android' ? 'NotoNastaliqUrdu' : 'System',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  emptyHint: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 12,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textLight,
    fontWeight: '500',
  },
  loadingSubtext: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  footerContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.background,
  },
  footerText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SearchableDropdown;