-- Import your database schema and stored procedures
-- This file will be executed when the server starts

CREATE DATABASE IF NOT EXISTS BankManagement;
USE BankManagement;

CREATE TABLE Customer (
    cust_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    street VARCHAR(150),
    city VARCHAR(50) DEFAULT 'Unknown',
    pincode VARCHAR(10),
    DOB DATE
);

CREATE TABLE Branch (
    branch_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150)
);

CREATE TABLE Account (
    acc_no INT PRIMARY KEY,
    type VARCHAR(50) NOT NULL 
        CHECK (type IN ('Savings', 'Current', 'Fixed Deposit', 'Recurring Deposit')), 
    balance DECIMAL(15,2) DEFAULT 0.00,
    cust_id INT NOT NULL,
    branch_id INT NOT NULL,
    
    CHECK (balance >= 0.00), 
    
    FOREIGN KEY (cust_id) REFERENCES Customer(cust_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
        ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE TABLE Employee (
    emp_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL
        CHECK (position IN ('Manager', 'Teller', 'Loan Officer', 'Clerk')),
    salary DECIMAL(10,2),
    branch_id INT NOT NULL,
    
    CHECK (salary >= 25000.00),
    
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
        ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE TABLE Locker (
    locker_id INT PRIMARY KEY,
    size VARCHAR(20) NOT NULL
        CHECK (size IN ('Small', 'Medium', 'Large', 'Extra Large')), 
    rent DECIMAL(10,2) NOT NULL,
    cust_id INT NOT NULL,
    
    CHECK (rent > 0.00), 
    
    FOREIGN KEY (cust_id) REFERENCES Customer(cust_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Loan (
    loan_id INT PRIMARY KEY,
    type VARCHAR(50) NOT NULL
        CHECK (type IN ('Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan')),
    amount DECIMAL(15,2) NOT NULL,
    cust_id INT NOT NULL,
    
    CHECK (amount > 1000.00), 
    
    FOREIGN KEY (cust_id) REFERENCES Customer(cust_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Service (
    service_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50)
);

CREATE TABLE Transaction (
    acc_no INT,
    trans_id INT,
    
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, 
    
    amount DECIMAL(15,2) NOT NULL,
    type VARCHAR(20) NOT NULL
        CHECK (type IN ('Deposit', 'Withdrawal', 'Transfer')), 
    mode VARCHAR(20) NOT NULL
        CHECK (mode IN ('ATM', 'Online', 'Branch')), 
    
    CHECK (amount > 0.00), 
    
    PRIMARY KEY (acc_no, trans_id),
    FOREIGN KEY (acc_no) REFERENCES Account(acc_no)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Avails (
    cust_id INT,
    service_id INT,
    PRIMARY KEY (cust_id, service_id),
    FOREIGN KEY (cust_id) REFERENCES Customer(cust_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (service_id) REFERENCES Service(service_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Cust_Phone (
    cust_id INT,
    phone_no VARCHAR(15) UNIQUE,
    PRIMARY KEY (cust_id, phone_no),
    FOREIGN KEY (cust_id) REFERENCES Customer(cust_id)
        ON DELETE CASCADE ON UPDATE CASCADE
);
