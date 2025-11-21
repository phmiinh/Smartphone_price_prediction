-- PhoneHub VN - MySQL schema
-- Run: mysql -u root -p < mysql-schema.sql

CREATE DATABASE IF NOT EXISTS phonehub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE phonehub;

CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  country VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id CHAR(8) PRIMARY KEY,
  brand_id INT NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  stock INT DEFAULT 0,
  category ENUM('flagship','premium','midrange','budget','gaming') DEFAULT 'midrange',
  chipset VARCHAR(100),
  launch_year SMALLINT,
  rating DECIMAL(3,2) DEFAULT 4.5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id)
);

CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id CHAR(8) NOT NULL,
  url VARCHAR(255) NOT NULL,
  sort_order INT DEFAULT 0,
  CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id CHAR(8) NOT NULL,
  label VARCHAR(50) NOT NULL,
  price BIGINT NOT NULL,
  stock INT DEFAULT 0,
  CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_product_variant (product_id, label)
);

CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(120),
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(80),
  district VARCHAR(80),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(24) PRIMARY KEY,
  customer_id INT NOT NULL,
  subtotal BIGINT NOT NULL,
  shipping_fee BIGINT DEFAULT 0,
  discount BIGINT DEFAULT 0,
  total BIGINT NOT NULL,
  payment_method ENUM('cod','momo','vnpay','bank_transfer') DEFAULT 'cod',
  status ENUM('pending','processing','paid','shipped','delivered','cancelled') DEFAULT 'processing',
  eta DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(24) NOT NULL,
  product_id CHAR(8) NOT NULL,
  quantity INT NOT NULL,
  price BIGINT NOT NULL,
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(24) NOT NULL,
  provider ENUM('momo','vnpay','bank_transfer','cod') NOT NULL,
  amount BIGINT NOT NULL,
  status ENUM('pending','success','failed') DEFAULT 'pending',
  transaction_ref VARCHAR(64),
  paid_at TIMESTAMP NULL,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS price_predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id CHAR(8) NULL,
  ram_gb INT NOT NULL,
  rom_option VARCHAR(20) NOT NULL,
  chip VARCHAR(120) NOT NULL,
  brand VARCHAR(40) NOT NULL,
  front_camera_mp DECIMAL(6,2),
  back_camera_mp DECIMAL(6,2),
  battery_mah INT,
  screen_size_in DECIMAL(4,2),
  predicted_price_usd DECIMAL(10,2),
  predicted_price_vnd BIGINT,
  prediction_payload JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_predictions_product (product_id),
  INDEX idx_predictions_brand (brand)
);

-- Seed master brands (optional)
INSERT IGNORE INTO brands (name, country) VALUES
('Apple', 'USA'),
('Samsung', 'Korea'),
('Xiaomi', 'China'),
('OPPO', 'China'),
('Vivo', 'China'),
('Realme', 'China'),
('Google', 'USA'),
('OnePlus', 'China'),
('Nothing', 'UK');

