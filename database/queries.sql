create database hot_meal_db;
USE hot_meal_db;

CREATE TABLE Order_Delivery (
order_delivery_id INT PRIMARY KEY,
full_name varchar(255),
last_name varchar(255),
order_id INT NOT NULL
);

CREATE TABLE Users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  role VARCHAR(20) CHECK (role IN ('Customer', 'Vendor', 'Admin')),
  is_verified TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  order_delivery_id INT NOT NULL,
  FOREIGN KEY (order_delivery_id) REFERENCES Order_Delivery (order_delivery_id)
);

CREATE TABLE Admins (
  admin_id INT PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  permissions JSON,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users (user_id)
);

CREATE TABLE Vendor_Categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE Vendors (
  vendor_id INT PRIMARY KEY,
  store_name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  description TEXT,
  application_status VARCHAR(20) DEFAULT 'Pending'
    CHECK (application_status IN ('Pending', 'Approved', 'Rejected')),
  is_open TINYINT DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  user_id INT NOT NULL,
  category_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users (user_id),
  FOREIGN KEY (category_id) REFERENCES Vendor_Categories (category_id)
);

CREATE TABLE Menu_Items (
  item_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(18, 2) NOT NULL,
  image_url VARCHAR(500),
  is_available TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  vendor_id INT NOT NULL,
  FOREIGN KEY (vendor_id) REFERENCES Vendors (vendor_id)
);

CREATE TABLE Customers (
  customer_id INT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  default_latitude DECIMAL(9, 6),
  default_longitude DECIMAL(9, 6),
  default_address VARCHAR(500),
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users (user_id)
);

CREATE TABLE Orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  status VARCHAR(20) DEFAULT 'Pending'
   CHECK (status IN ('Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')),
  total_amount DECIMAL(18, 2) NOT NULL,
  payment_method VARCHAR(20) DEFAULT 'COD',
  delivery_address TEXT NOT NULL,
  delivery_lat DECIMAL(9, 6),
  delivery_long DECIMAL(9, 6),
  placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivered_at DATETIME,
  customer_id INT NOT NULL,
  vendor_id INT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES Customers (customer_id),
  FOREIGN KEY (vendor_id) REFERENCES Vendors (vendor_id)
);

CREATE TABLE Order_Items (
  order_item_id INT PRIMARY KEY AUTO_INCREMENT,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(18, 2) NOT NULL,
  special_instructions TEXT,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES Orders (order_id),
  FOREIGN KEY (item_id) REFERENCES Menu_Items (item_id)
);

CREATE TABLE Reviews (
  review_id INT PRIMARY KEY AUTO_INCREMENT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  customer_id INT NOT NULL,
  order_id INT UNIQUE NOT NULL,
  vendor_id INT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES Customers (customer_id),
  FOREIGN KEY (order_id) REFERENCES Orders (order_id),
  FOREIGN KEY (vendor_id) REFERENCES Vendors (vendor_id)
);

ALTER TABLE Order_Delivery
ADD FOREIGN KEY (order_id) REFERENCES Orders (order_id);

-- SHOW TABLES;