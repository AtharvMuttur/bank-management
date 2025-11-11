DELIMITER $$

-- TRIGGER: Checks balance before withdrawal to avoid negative balance
CREATE TRIGGER trg_update_balance
BEFORE INSERT ON Transaction
FOR EACH ROW
BEGIN
    DECLARE bal DECIMAL(15,2);

    SELECT balance INTO bal FROM Account WHERE acc_no = NEW.acc_no;

    IF NEW.type = 'Withdrawal' THEN
        IF NEW.amount > bal THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient funds!';
        END IF;
        SET bal = bal - NEW.amount;
    ELSEIF NEW.type = 'Deposit' THEN
        SET bal = bal + NEW.amount;
    END IF;

    UPDATE Account SET balance = bal WHERE acc_no = NEW.acc_no;
END$$

DELIMITER ;




DELIMITER //

CREATE PROCEDURE Get_Branch_Account_Summary(
    IN p_branch_id INT
)
BEGIN
    -- This single SELECT statement aggregates and returns the required data.
    SELECT 
        B.name AS Branch_Name,
        B.location AS Branch_Location,
        COUNT(A.acc_no) AS Total_Accounts,
        SUM(A.balance) AS Total_Balance_Value
    FROM 
        Branch B
    LEFT JOIN 
        Account A ON B.branch_id = A.branch_id
    WHERE 
        B.branch_id = p_branch_id
    GROUP BY 
        B.branch_id, B.name, B.location;
        
END //

DELIMITER ;


-- FUNCTION: Used to retrieve balance of all accounts together of a particular customer
DELIMITER $$

CREATE FUNCTION get_total_balance(p_cust_id INT)
RETURNS DECIMAL(15,2)
DETERMINISTIC
BEGIN
    DECLARE total_bal DECIMAL(15,2);

    SELECT IFNULL(SUM(balance), 0) INTO total_bal
    FROM Account
    WHERE cust_id = p_cust_id;

    RETURN total_bal;
END$$

DELIMITER ;9