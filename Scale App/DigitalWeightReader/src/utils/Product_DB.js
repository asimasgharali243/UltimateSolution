import SQLite from 'react-native-sqlite-storage';

// Enable promise-based API
SQLite.enablePromise(true);

const DATABASE_NAME = 'Products.db';
const DATABASE_VERSION = '1.0';
const DATABASE_DISPLAY_NAME = 'Products Database';
const DATABASE_SIZE = 200000; // 200KB

// Table schema
const PRODUCTS_TABLE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS products (
    item_ID INTEGER PRIMARY KEY,
    item_Type TEXT,
    Item_Code TEXT,
    Item_Name TEXT,
    Item_NameUrdu TEXT,
    subCategory_Id INTEGER,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

// Create index for better performance
const CREATE_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_products_item_id ON products(item_ID);
  CREATE INDEX IF NOT EXISTS idx_products_item_type ON products(item_Type);
  CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subCategory_Id);
  CREATE INDEX IF NOT EXISTS idx_products_name ON products(Item_Name);
  CREATE INDEX IF NOT EXISTS idx_products_name_urdu ON products(Item_NameUrdu);
  CREATE INDEX IF NOT EXISTS idx_products_code ON products(Item_Code);
`;

class ProductDBManager {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  // Singleton pattern to prevent multiple instances
  static getInstance() {
    if (!this.instance) {
      this.instance = new ProductDBManager();
    }
    return this.instance;
  }

  // Initialize database
  async initDB() {
    if (this.isInitialized && this.db) {
      return this.db;
    }

    try {
      this.db = await SQLite.openDatabase({
        name: DATABASE_NAME,
        location: 'default',
      });

      await this.createTables();
      await this.createIndexes();
      this.isInitialized = true;
      
      console.log('✅ Products database initialized successfully');
      return this.db;
    } catch (error) {
      console.error('❌ Failed to initialize products database:', error);
      throw error;
    }
  }

  // Create tables
  async createTables() {
    try {
      await this.db.executeSql(PRODUCTS_TABLE_SCHEMA);
      console.log('✅ Products table created/verified');
    } catch (error) {
      console.error('❌ Error creating products table:', error);
      throw error;
    }
  }

  // Create indexes
  async createIndexes() {
    try {
      await this.db.executeSql(CREATE_INDEXES);
      console.log('✅ Database indexes created/verified');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      // Don't throw error for index creation failure
    }
  }

  // ========== PRODUCT CRUD OPERATIONS ==========

  // FIXED: Insert or update products in batch without transaction issues
  // In your saveProducts method, fix the column names to match your table schema
async saveProducts(products) {
  if (!this.db || !Array.isArray(products)) {
    throw new Error('Database not initialized or invalid products data');
  }

  try {
    const query = `
      INSERT OR REPLACE INTO products 
      (item_ID, item_Type, Item_Code, Item_Name, Item_NameUrdu, subCategory_Id, last_updated) 
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `;

    let successCount = 0;
    let errorCount = 0;

    // Process products sequentially without transaction to avoid the error
    for (const product of products) {
      try {
        console.log('📥 Saving product:', product);
        await this.db.executeSql(query, [
          product.item_ID,
          product.item_Type,
          product.Item_Code || product.item_Code, // Handle both cases
          product.Item_Name || product.item_Name, // Handle both cases
          product.Item_NameUrdu || product.item_NameUrdu, // Handle both cases
          product.subCategory_Id
        ]);
        successCount++;
      } catch (error) {
        console.warn('⚠️ Failed to save product:', product.item_ID, error);
        errorCount++;
        // Continue with other products even if one fails
      }

      // Small delay to prevent overwhelming the database
      if (products.length > 10) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    console.log(`✅ Successfully saved ${successCount} products, ${errorCount} failed`);
    return { 
      success: true, 
      saved: successCount, 
      failed: errorCount,
      total: products.length 
    };
  } catch (error) {
    console.error('❌ Error saving products:', error);
    throw error;
  }
}

  // ALTERNATIVE: Batch save with manual transaction (more complex but faster)
  async saveProductsBatch(products) {
    if (!this.db || !Array.isArray(products)) {
      throw new Error('Database not initialized or invalid products data');
    }

    return new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        const query = `
          INSERT OR REPLACE INTO products 
          (item_ID, item_Type, Item_Code, Item_Name, Item_NameUrdu, subCategory_Id, last_updated) 
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `;

        let successCount = 0;
        
        // Execute all inserts in the same transaction
        products.forEach((product, index) => {
          tx.executeSql(
            query,
            [
              product.item_ID,
              product.item_Type,
              product.Item_Code,
              product.Item_Name,
              product.Item_NameUrdu,
              product.subCategory_Id
            ],
            () => {
              successCount++;
            },
            (tx, error) => {
              console.warn(`⚠️ Failed to save product ${product.item_ID}:`, error);
              // Don't reject here - continue with other products
              return false; // Return false to continue transaction
            }
          );
        });
      }, 
      (error) => {
        // Transaction error
        console.error('❌ Transaction error:', error);
        reject(error);
      },
      () => {
        // Transaction success
        console.log(`✅ Transaction completed, saved ${products.length} products`);
        resolve({ 
          success: true, 
          saved: products.length, 
          total: products.length 
        });
      });
    });
  }

  // OPTIMIZED: Save products in chunks with progress callback
  async saveProductsWithProgress(products, onProgress = null) {
    if (!this.db || !Array.isArray(products)) {
      throw new Error('Database not initialized or invalid products data');
    }

    const CHUNK_SIZE = 50;
    let totalSaved = 0;
    let totalFailed = 0;

    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
      const chunk = products.slice(i, i + CHUNK_SIZE);
      
      try {
        const result = await this.saveProducts(chunk);
        totalSaved += result.saved;
        totalFailed += result.failed;

        // Report progress
        if (onProgress && typeof onProgress === 'function') {
          onProgress({
            processed: Math.min(i + CHUNK_SIZE, products.length),
            total: products.length,
            saved: totalSaved,
            failed: totalFailed
          });
        }

        // Small delay between chunks
        if (i + CHUNK_SIZE < products.length) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      } catch (error) {
        console.error(`❌ Error saving chunk starting at ${i}:`, error);
        totalFailed += chunk.length;
      }
    }

    return {
      success: true,
      saved: totalSaved,
      failed: totalFailed,
      total: products.length
    };
  }

  // ========== PRODUCT RETRIEVAL METHODS ==========

  // Get digital products with pagination
async getDigitalProducts(limit = 0, offset = 0) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      let query = `SELECT item_ID, item_Type, Item_Code, Item_Name, Item_NameUrdu, subCategory_Id 
                   FROM products 
                   WHERE item_Type = 'Product' AND subCategory_Id = 1 
                   ORDER BY Item_Name ASC`;
      const params = [];

      if (limit > 0) {
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
      }

      const results = await this.db.executeSql(query, params);
      const products = [];

      results.forEach(result => {
        for (let i = 0; i < result.rows.length; i++) {
          products.push(result.rows.item(i));
        }
      });
      
      console.log(`✅ Fetched ${products.length} digital products`);
      return products;
    } catch (error) {
      console.error('❌ Error fetching digital products:', error);
      throw error;
    }
  }

  // Get products by category (for dropdown)
  async getProductsByCategory(subcategoryId = 1) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const results = await this.db.executeSql(
        `SELECT item_ID, item_Type, Item_Code, Item_Name, Item_NameUrdu, subCategory_Id 
         FROM products 
         WHERE item_Type = 'Product' AND subCategory_Id = ?
         ORDER BY Item_Name ASC`,
        [subcategoryId]
      );

      const products = [];
      results.forEach(result => {
        for (let i = 0; i < result.rows.length; i++) {
          products.push(result.rows.item(i));
        }
      });

      console.log(`✅ Fetched ${products.length} products for category ${subcategoryId}`);
      return products;
    } catch (error) {
      console.error('❌ Error fetching products by category:', error);
      throw error;
    }
  }

  // Get all unique subcategories
  async getSubcategories() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const results = await this.db.executeSql(
        `SELECT DISTINCT subCategory_Id 
         FROM products 
         WHERE item_Type = 'Product' 
         ORDER BY subCategory_Id ASC`
      );

      const subcategories = [];
      results.forEach(result => {
        for (let i = 0; i < result.rows.length; i++) {
          subcategories.push(result.rows.item(i).subCategory_Id);
        }
      });

      return subcategories;
    } catch (error) {
      console.error('❌ Error fetching subcategories:', error);
      throw error;
    }
  }

  // Search products by name with category filter
  async searchProductsByCategory(searchTerm, subcategoryId = 1, limit = 50) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const results = await this.db.executeSql(
        `SELECT * FROM products 
         WHERE (Item_Name LIKE ? OR Item_NameUrdu LIKE ? OR Item_Code LIKE ? OR item_ID = ?) 
           AND item_Type = 'Product' 
           AND subCategory_Id = ?
         ORDER BY Item_Name ASC 
         LIMIT ?`,
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, searchTerm, subcategoryId, limit]
      );

      const products = [];
      results.forEach(result => {
        for (let i = 0; i < result.rows.length; i++) {
          products.push(result.rows.item(i));
        }
      });

      return products;
    } catch (error) {
      console.error('❌ Error searching products by category:', error);
      throw error;
    }
  }

  // Advanced search with multiple filters
async advancedProductSearch(filters = {}) {
    // Validate database connection
    if (!this.db) {
      throw new Error('Database not initialized. Please initialize the database first.');
    }

    // Validate filters parameter
    if (filters && typeof filters !== 'object') {
      throw new TypeError('Filters must be an object');
    }

    try {
      // Initialize query and parameters - only digital products (subCategory_Id = 1)
      let query = `
        SELECT 
          item_ID, 
          item_Type, 
          Item_Code, 
          Item_Name, 
          Item_NameUrdu, 
          subCategory_Id 
        FROM products 
        WHERE item_Type = 'Product' AND subCategory_Id = 1
      `;
      const params = [];

      // Single input box filter: search in code, name, and Urdu name
      if (filters.searchTerm && String(filters.searchTerm).trim().length > 0) {
        const searchTerm = String(filters.searchTerm).trim();
        
        // Validate search term length
        if (searchTerm.length > 100) {
          throw new Error('Search term too long. Maximum 100 characters allowed.');
        }

        // Search in Item_Code, Item_Name, and Item_NameUrdu only
        query += ' AND (Item_Code LIKE ? OR Item_Name LIKE ? OR Item_NameUrdu LIKE ?)';
        const searchPattern = `%${searchTerm}%`;
        
        params.push(
          searchPattern,  // Item_Code
          searchPattern,  // Item_Name
          searchPattern   // Item_NameUrdu
        );
      }
      // If searchTerm is empty, return all digital products

      // Apply ordering
      query += ' ORDER BY Item_Name ASC';

      // Apply limit with validation (only if provided)
      if (filters.limit) {
        const limit = parseInt(filters.limit);
        if (isNaN(limit) || limit < 1) {
          throw new Error('Limit must be a positive number');
        }
        
        if (limit > 1000) {
          console.warn('⚠️ Large limit detected. Consider using pagination for better performance.');
        }
        
        query += ' LIMIT ?';
        params.push(limit);
      }

      // Execute query
      const results = await this.db.executeSql(query, params);

      // Process results efficiently
      if (!results || !Array.isArray(results)) {
        console.warn('⚠️ No results returned from query');
        return [];
      }

      const products = [];
      
      // Efficiently extract rows from all result sets
      for (const result of results) {
        if (result && result.rows) {
          const rowCount = result.rows.length;
          for (let i = 0; i < rowCount; i++) {
            products.push(result.rows.item(i));
          }
        }
      }

      console.log(`✅ Advanced search completed: Found ${products.length} products`);
      return products;

    } catch (error) {
      console.error('❌ Advanced product search failed:', error.message);
      throw error;
    }
  }
  // Get product by ID
  async getProductById(itemId) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const results = await this.db.executeSql(
        'SELECT * FROM products WHERE item_ID = ?',
        [itemId]
      );

      if (results[0].rows.length > 0) {
        return results[0].rows.item(0);
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching product by ID:', error);
      throw error;
    }
  }

  // Get product by Item Code
  async getProductByCode(itemCode) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const results = await this.db.executeSql(
        'SELECT * FROM products WHERE Item_Code = ?',
        [itemCode]
      );

      if (results[0].rows.length > 0) {
        return results[0].rows.item(0);
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching product by code:', error);
      throw error;
    }
  }

  // Search products by name, code, or ID (general search)
  async searchProducts(searchTerm, limit = 50) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const results = await this.db.executeSql(
        `SELECT * FROM products 
         WHERE Item_Name LIKE ? OR Item_NameUrdu LIKE ? OR Item_Code LIKE ? OR item_ID = ?
         ORDER BY Item_Name ASC 
         LIMIT ?`,
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, searchTerm, limit]
      );

      const products = [];
      results.forEach(result => {
        for (let i = 0; i < result.rows.length; i++) {
          products.push(result.rows.item(i));
        }
      });

      return products;
    } catch (error) {
      console.error('❌ Error searching products:', error);
      throw error;
    }
  }

  // Search products specifically by Item Code
  async searchProductsByCode(itemCode, limit = 50) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const results = await this.db.executeSql(
        `SELECT * FROM products 
         WHERE Item_Code LIKE ?
         ORDER BY Item_Name ASC 
         LIMIT ?`,
        [`%${itemCode}%`, limit]
      );

      const products = [];
      results.forEach(result => {
        for (let i = 0; i < result.rows.length; i++) {
          products.push(result.rows.item(i));
        }
      });

      return products;
    } catch (error) {
      console.error('❌ Error searching products by code:', error);
      throw error;
    }
  }

  // ========== UTILITY METHODS ==========

  // Get products count
  async getProductsCount(filters = {}) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      let query = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
      const params = [];

      if (filters.subcategoryId) {
        query += ' AND subCategory_Id = ?';
        params.push(filters.subcategoryId);
      }

      if (filters.itemType) {
        query += ' AND item_Type = ?';
        params.push(filters.itemType);
      }

      if (filters.itemCode) {
        query += ' AND Item_Code = ?';
        params.push(filters.itemCode);
      }

      const results = await this.db.executeSql(query, params);
      return results[0].rows.item(0).count;
    } catch (error) {
      console.error('❌ Error getting products count:', error);
      throw error;
    }
  }

  // Check if database has data
  async hasData() {
    if (!this.db) {
      return false;
    }

    try {
      const count = await this.getProductsCount();
      return count > 0;
    } catch (error) {
      console.error('❌ Error checking database data:', error);
      return false;
    }
  }

  // Get database info
  async getDatabaseInfo() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const totalProducts = await this.getProductsCount();
      const subcategories = await this.getSubcategories();
      
      return {
        totalProducts,
        subcategories: subcategories.length,
        subcategoryList: subcategories,
        isInitialized: this.isInitialized
      };
    } catch (error) {
      console.error('❌ Error getting database info:', error);
      throw error;
    }
  }

  // Get all products (for export/backup)
  async getAllProducts() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const results = await this.db.executeSql(
        'SELECT * FROM products ORDER BY Item_Name ASC'
      );

      const products = [];
      results.forEach(result => {
        for (let i = 0; i < result.rows.length; i++) {
          products.push(result.rows.item(i));
        }
      });

      return products;
    } catch (error) {
      console.error('❌ Error getting all products:', error);
      throw error;
    }
  }

  // Clear all products
  async clearProducts() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      await this.db.executeSql('DELETE FROM products');
      console.log('✅ All products cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing products:', error);
      throw error;
    }
  }

  // Close database
  async closeDB() {
    if (this.db) {
      try {
        await this.db.close();
        this.db = null;
        this.isInitialized = false;
        console.log('✅ Products database closed');
      } catch (error) {
        console.error('❌ Error closing products database:', error);
        throw error;
      }
    }
  }

  // ========== BULK OPERATIONS ==========

  // Import products from API response
  async importFromAPI(apiProducts) {
    if (!this.db || !Array.isArray(apiProducts)) {
      throw new Error('Database not initialized or invalid products data');
    }

    try {
      // Transform API data to match our schema
      const products = apiProducts.map(product => ({
        item_ID: product.item_ID || product.id,
        item_Type: product.item_Type || 'Product',
        Item_Code: product.Item_Code || product.item_code || product.code || '',
        Item_Name: product.Item_Name || product.item_name,
        Item_NameUrdu: product.Item_NameUrdu || product.item_name_urdu,
        subCategory_Id: product.subCategory_Id || product.subcategory_id || 1
      }));

      return await this.saveProducts(products);
    } catch (error) {
      console.error('❌ Error importing products from API:', error);
      throw error;
    }
  }

  // Export products for backup
  async exportProducts() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      const products = await this.getAllProducts();
      return {
        timestamp: new Date().toISOString(),
        total: products.length,
        products: products
      };
    } catch (error) {
      console.error('❌ Error exporting products:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const productDBManager = ProductDBManager.getInstance();
export default ProductDBManager;