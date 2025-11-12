import SQLite from 'react-native-sqlite-storage';
import parseScanDate from '../utils/ParseDate';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

const database_name = "ScanDB.db";
const database_version = "1.0";
const database_displayname = "Scan Database";
const database_size = 200000;

// ----------------- DB CONNECTION -----------------
export const getDBConnection = async () => {
  return SQLite.openDatabase(
    database_name,
    database_version,
    database_displayname,
    database_size
  );
};

// ----------------- CREATE TABLE -----------------
export const createTable = async (db) => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS scans (
      sr1 INTEGER PRIMARY KEY AUTOINCREMENT,
      serial_number INTEGER NOT NULL,
      item_ID INTEGER NOT NULL,
      item_Code TEXT NOT NULL,
      datetime DATETIME NOT NULL,
      product_name TEXT NOT NULL,
      type TEXT NOT NULL,
      weight_value TEXT,
      quantity INTEGER DEFAULT 1,
      image_uri TEXT,
      input_token TEXT,
      output_token TEXT,
      total_token TEXT,
      sync_status INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS serial_counter (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      next_serial INTEGER DEFAULT 1,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  try {
    for (const query of queries) {
      await db.executeSql(query);
    }
    await initializeSerialCounter(db);
    console.log('✅ Database tables created/verified successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

// ----------------- INITIALIZE SERIAL COUNTER -----------------
const initializeSerialCounter = async (db) => {
  try {
    const results = await db.executeSql(
      'SELECT next_serial FROM serial_counter WHERE id = 1'
    );
    if (results[0].rows.length === 0) {
      await db.executeSql(
        'INSERT INTO serial_counter (id, next_serial) VALUES (1, 1)'
      );
      console.log('✅ Initialized serial counter with: 1');
    }
  } catch (error) {
    console.error('❌ Error initializing serial counter:', error);
    throw error;
  }
};

// ----------------- GET NEXT SERIAL NUMBER -----------------
const getNextSerialNumber = async (db) => {
  try {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT next_serial FROM serial_counter WHERE id = 1',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              const nextSerial = results.rows.item(0).next_serial;
              tx.executeSql(
                'UPDATE serial_counter SET next_serial = ?, last_updated = CURRENT_TIMESTAMP WHERE id = 1',
                [nextSerial + 1],
                () => {
                  console.log('✅ Assigned serial number:', nextSerial);
                  resolve(nextSerial);
                },
                (tx, error) => {
                  console.error('❌ Error updating serial counter:', error);
                  reject(error);
                }
              );
            } else {
              // Auto-repair missing counter row
              tx.executeSql(
                'INSERT OR REPLACE INTO serial_counter (id, next_serial) VALUES (1, 1)',
                [],
                () => {
                  console.log('🆕 Created missing serial counter row.');
                  resolve(1);
                }
              );
            }
          },
          (tx, error) => {
            console.error('❌ Error reading serial counter:', error);
            reject(error);
          }
        );
      },
      (error) => {
        console.error('❌ Transaction error in getNextSerialNumber:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('❌ Error getting next serial number:', error);
    throw error;
  }
};

// ----------------- RESET SERIAL COUNTER -----------------
export const resetSerialCounter = async (db) => {
  let transactionSuccess = false;
  
  try {
    await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        // Reset the counter to 1
        tx.executeSql(
          'UPDATE serial_counter SET next_serial = 1, last_updated = CURRENT_TIMESTAMP WHERE id = 1',
          [],
          (tx, results) => {
            console.log('✅ Serial counter reset to 1');
            transactionSuccess = true;
            resolve(results);
          },
          (tx, error) => {
            console.error('❌ Error resetting serial counter:', error);
            reject(error);
          }
        );
      }, 
      (error) => {
        console.error('❌ Transaction error in resetSerialCounter:', error);
        reject(error);
      },
      () => {
        console.log('✅ Reset transaction completed successfully');
      });
    });

    return { 
      success: true, 
      nextAvailableSerial: 1,
      message: 'Serial counter reset successfully! Next record will start from 1.'
    };
  } catch (error) {
    console.error('❌ Error resetting serial counter:', error);
    
    // If transaction failed, try a simple update as fallback
    try {
      await db.executeSql(
        'UPDATE serial_counter SET next_serial = 1, last_updated = CURRENT_TIMESTAMP WHERE id = 1'
      );
      console.log('✅ Fallback reset successful');
      return { 
        success: true, 
        nextAvailableSerial: 1,
        message: 'Serial counter reset successfully! Next record will start from 1.'
      };
    } catch (fallbackError) {
      console.error('❌ Fallback reset also failed:', fallbackError);
      throw new Error('Failed to reset serial counter after multiple attempts.');
    }
  }
};

// ----------------- GET CURRENT SERIAL COUNTER STATE -----------------
export const getSerialCounterState = async (db) => {
  try {
    const results = await db.executeSql(
      'SELECT next_serial FROM serial_counter WHERE id = 1'
    );
    const nextSerial = results[0].rows.length
      ? results[0].rows.item(0).next_serial
      : 1;

    const maxSerialResult = await db.executeSql(
      'SELECT COALESCE(MAX(serial_number), 0) as max_serial FROM scans'
    );
    const maxSerial = maxSerialResult[0].rows.item(0).max_serial;

    return {
      nextSerial,
      maxSerial,
      isInSync: true // Always true since duplicates are allowed
    };
  } catch (error) {
    console.error('❌ Error getting serial counter state:', error);
    return { nextSerial: 1, maxSerial: 0, isInSync: true };
  }
};

// ----------------- INSERT SCAN -----------------
export const insertScan = async (
  db,
  datetime,
  product_name,      // ← parameter 3
  item_ID,           // ← parameter 4  
  item_Code,         // ← parameter 5
  type,              // ← parameter 6
  weight_value,      // ← parameter 7
  quantity = 0,      // ← parameter 8  ← THIS IS QUANTITY!
  image_uri = null,  // ← parameter 9
  input_token = null, // ← parameter 10
  output_token = null, // ← parameter 11
  total_token = null   // ← parameter 12
) => {
  const nextSerial = await getNextSerialNumber(db);
  const insertQuery = `
    INSERT INTO scans (
      serial_number,
      datetime,
      product_name,
      item_ID,
      item_Code,
      type,
      weight_value,
      quantity,
      image_uri,
      input_token,
      output_token,
      total_token,
      sync_status
    ) VALUES (?, ?, ?, ?, ?, ?,?,?, ?, ?, ?, ?, 0)
  `;

  try {
    const result = await db.executeSql(insertQuery, [
      nextSerial,
      datetime,
      product_name,
      item_ID,
      item_Code,
      type,
      weight_value,
      quantity,
      image_uri,
      input_token,
      output_token,
      total_token
    ]);

    console.log('✅ Inserted record:', nextSerial);
    return {
      success: true,
      sr1: result[0].insertId,
      serial_number: nextSerial
    };
  } catch (error) {
    console.error('❌ Error inserting scan:', error);
    throw error;
  }
};

// ----------------- BATCH INSERT SCANS -----------------
export const batchInsertScans = async (db, scans) => {
  if (!Array.isArray(scans) || scans.length === 0) {
    throw new Error('Invalid scans array');
  }

  const results = [];
  for (const scan of scans) {
    try {
      const result = await insertScan(
        db,
        scan.datetime,
        scan.item_ID,
        scan.item_Code,
        scan.product_name,
        scan.type,
        scan.weight_value,
        scan.quantity,
        scan.image_uri,
        scan.input_token,
        scan.output_token,
        scan.total_token
      );
      results.push(result);
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }

  return {
    success: true,
    total: scans.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
};

// ----------------- GET ALL SCANS -----------------
export const getAllScans = async (db, limit = 0, offset = 0) => {
  try {
    let query = `
      SELECT * FROM scans 
      ORDER BY datetime DESC, serial_number DESC
    `;
    const params = [];
    if (limit > 0) {
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const results = await db.executeSql(query, params);
    const scans = [];
    results.forEach(result => {
      for (let i = 0; i < result.rows.length; i++) {
        scans.push(result.rows.item(i));
      }
    });
    return scans;
  } catch (error) {
    console.error('❌ Error getting all scans:', error);
    throw error;
  }
};

// ----------------- Other CRUD Functions -----------------
export const getScanBySr1 = async (db, sr1) => {
  try {
    const results = await db.executeSql('SELECT * FROM scans WHERE sr1 = ?', [sr1]);
    return results[0].rows.length ? results[0].rows.item(0) : null;
  } catch (error) {
    console.error('❌ Error getting scan by sr1:', error);
    throw error;
  }
};

export const getAllScansByType = async (db, type, limit = 0, offset = 0) => {
  try {
    let query = `SELECT * FROM scans WHERE type = ? ORDER BY datetime DESC, serial_number DESC`;
    const params = [type];
    if (limit > 0) {
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }
    const results = await db.executeSql(query, params);
    const scans = [];
    results.forEach(result => {
      for (let i = 0; i < result.rows.length; i++) scans.push(result.rows.item(i));
    });
    return scans;
  } catch (error) {
    console.error('❌ Error getting scans by type:', error);
    throw error;
  }
};

export const getScansByDate = async (db, dateStr = null, limit = 0, offset = 0) => {
  try {
    const dateISO = parseScanDate(dateStr);
    const start = dateISO.split('T')[0] + 'T00:00:00.000Z';
    const end = dateISO.split('T')[0] + 'T23:59:59.999Z';
    let query = `SELECT * FROM scans WHERE datetime BETWEEN ? AND ? ORDER BY datetime DESC, serial_number DESC`;
    const params = [start, end];
    if (limit > 0) {
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }
    const results = await db.executeSql(query, params);
    const scans = [];
    results.forEach(result => {
      for (let i = 0; i < result.rows.length; i++) scans.push(result.rows.item(i));
    });
    return scans;
  } catch (error) {
    console.error('❌ Error getting scans by date:', error);
    throw error;
  }
};

export const getUnsyncedScans = async (db, limit = 0) => {
  try {
    let query = `SELECT * FROM scans WHERE sync_status = 0 ORDER BY sr1 ASC`;
    const params = [];
    if (limit > 0) {
      query += ' LIMIT ?';
      params.push(limit);
    }
    const results = await db.executeSql(query, params);
    const scans = [];
    results.forEach(result => {
      for (let i = 0; i < result.rows.length; i++) scans.push(result.rows.item(i));
    });
    return scans;
  } catch (error) {
    console.error('❌ Error getting unsynced scans:', error);
    throw error;
  }
};

export const updateScanSyncStatus = async (db, sr1, syncStatus) => {
  try {
    await db.executeSql(
      'UPDATE scans SET sync_status = ?, updated_at = CURRENT_TIMESTAMP WHERE sr1 = ?',
      [syncStatus, sr1]
    );
    console.log('✅ Updated sync status:', sr1);
    return { success: true };
  } catch (error) {
    console.error('❌ Error updating sync status:', error);
    throw error;
  }
};

export const batchUpdateSyncStatus = async (db, sr1Array, syncStatus) => {
  try {
    const placeholders = sr1Array.map(() => '?').join(',');
    const query = `
      UPDATE scans 
      SET sync_status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE sr1 IN (${placeholders})
    `;
    const params = [syncStatus, ...sr1Array];
    await db.executeSql(query, params);
    console.log('✅ Batch updated sync status for', sr1Array.length, 'records');
    return { success: true };
  } catch (error) {
    console.error('❌ Error batch updating sync status:', error);
    throw error;
  }
};

export const deleteScanBySr1 = async (db, sr1) => {
  try {
    await db.executeSql('DELETE FROM scans WHERE sr1 = ?', [sr1]);
    console.log('✅ Deleted scan sr1:', sr1);
    return { success: true };
  } catch (error) {
    console.error('❌ Error deleting scan:', error);
    throw error;
  }
};

export const getScansCount = async (db) => {
  try {
    const total = await db.executeSql('SELECT COUNT(*) as count FROM scans');
    const unsynced = await db.executeSql('SELECT COUNT(*) as count FROM scans WHERE sync_status = 0');
    return {
      total: total[0].rows.item(0).count,
      unsynced: unsynced[0].rows.item(0).count
    };
  } catch (error) {
    console.error('❌ Error getting scans count:', error);
    throw error;
  }
};

export const clearScans = async (db) => {
  try {
    await db.executeSql('DELETE FROM scans');
    await db.executeSql('UPDATE serial_counter SET next_serial = 1 WHERE id = 1');
    console.log('🧹 Cleared scans and reset counter');
    return { success: true };
  } catch (error) {
    console.error('❌ Error clearing scans:', error);
    throw error;
  }
};

export const closeDatabase = async (db) => {
  try {
    if (db) {
      await db.close();
      console.log('✅ Database closed successfully');
    }
  } catch (error) {
    console.error('❌ Error closing database:', error);
    throw error;
  }
};