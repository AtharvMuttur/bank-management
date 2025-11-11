-- Stored Procedure to get Branch Account Summary
-- This procedure aggregates account data for a specific branch

DELIMITER //

CREATE PROCEDURE IF NOT EXISTS Get_Branch_Account_Summary(
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
