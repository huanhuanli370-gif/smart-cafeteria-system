// backend/db/resetDB.js
const { connectDB, DB_NAME } = require('./db');

async function resetDatabase() {
  const conn = await connectDB(true);
  console.log('⚠️ Dropping and recreating database...');

  await conn.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\``);
  await conn.query(`CREATE DATABASE \`${DB_NAME}\``);
  await conn.query(`USE \`${DB_NAME}\``);

  await conn.execute(`
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(32) NULL,
      role ENUM('student','faculty','staff','admin') DEFAULT 'student',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // menus 
  await conn.execute(`
    CREATE TABLE menus (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      image VARCHAR(255) DEFAULT '',
      category VARCHAR(100) DEFAULT 'General',
      stock INT DEFAULT 100,
      is_available BOOLEAN DEFAULT TRUE
    )
  `);

  // orders 
  await conn.execute(`
    CREATE TABLE orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      items TEXT,
      status VARCHAR(50) DEFAULT 'preparing',
      customer_id INT NULL,
      customer_name VARCHAR(255) DEFAULT 'Guest',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_viewed BOOLEAN DEFAULT FALSE,
      original_price DECIMAL(10, 2) NOT NULL,
      discount_amount DECIMAL(10, 2) DEFAULT 0.00, 
      final_price DECIMAL(10, 2) NOT NULL, 
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  console.log('✅ Database reset successfully');
  return conn;
}

module.exports = { resetDatabase };
