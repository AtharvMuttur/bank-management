-- Setup MySQL users for authentication
-- This script creates the 'root' and 'customer' users with proper privileges

-- Create 'customer' user with limited privileges
CREATE USER IF NOT EXISTS 'customer'@'localhost' IDENTIFIED BY 'Bank@123';

-- Grant specific privileges to 'customer' user (read-only access to BankManagement)
-- GRANT SELECT ON BankManagement.* TO 'customer'@'localhost';
-- GRANT INSERT, UPDATE, DELETE 
-- ON bankmanagement.account, bankmanagement.customer
-- TO 'user_name'@'host';

-- Example: Grant write access to 'web_user' on the 'Orders' table in 'WebAppDB'
-- GRANT INSERT, UPDATE, DELETE 
-- ON WebAppDB.Orders 
-- TO 'web_user'@'localhost';

-- Create 'root' user with full privileges (if not exists)
CREATE USER IF NOT EXISTS 'root'@'localhost' IDENTIFIED BY 'Atharv@2012';

-- Grant all privileges to 'root' user
GRANT ALL PRIVILEGES ON BankManagement.* TO 'root'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Test: Show grants for both users
SHOW GRANTS FOR 'root'@'localhost';
SHOW GRANTS FOR 'customer'@'localhost';
