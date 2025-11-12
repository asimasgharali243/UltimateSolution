// userDatabase.js
import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = "UserDB.db";
const database_version = "1.0";
const database_displayname = "User Database";
const database_size = 200000;

// ✅ Open DB connection
export const getUserDBConnection = async () => {
  return SQLite.openDatabase(
    database_name,
    database_version,
    database_displayname,
    database_size
  );
};

// ✅ Create user table
export const createUserTable = async (db) => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER,
      username TEXT,
      login_time TEXT
    );
  `;
  await db.executeSql(query);
};

// ✅ Insert user data after login/register
export const insertUser = async (db, user_id, username, message) => {
  const insertQuery = `
    INSERT INTO users (user_id, username ,login_time)
    VALUES (?, ?, datetime('now'));
  `;
  await db.executeSql(insertQuery, [user_id, username]);
};

// ✅ Get last logged-in user
export const getUser = async (db) => {
  const results = await db.executeSql(`SELECT * FROM users ORDER BY user_id DESC LIMIT 1`);
  const rows = results[0].rows;
  return rows.length > 0 ? rows.item(0) : null;
};

// ✅ Clear users (optional logout)
export const clearUsers = async (db) => {
  await db.executeSql(`DELETE FROM users`);
};
