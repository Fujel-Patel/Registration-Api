CREATE DATABASE task3db;

USE task3db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(100),
  email VARCHAR(100),
  password TEXT,
  phone VARCHAR(20)
);
