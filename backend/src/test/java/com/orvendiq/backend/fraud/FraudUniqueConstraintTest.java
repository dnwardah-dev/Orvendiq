package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FraudUniqueConstraintTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void transactionIdMustBeUniqueInOracle() {

        List<String> constraints = jdbc.queryForList("""
            SELECT ac.CONSTRAINT_NAME
            FROM USER_CONSTRAINTS ac
            JOIN USER_CONS_COLUMNS acc
              ON acc.CONSTRAINT_NAME = ac.CONSTRAINT_NAME
             AND acc.TABLE_NAME = ac.TABLE_NAME
            WHERE ac.TABLE_NAME = 'FRAUD_ASSESSMENTS'
              AND ac.CONSTRAINT_TYPE IN ('U', 'P')
              AND ac.STATUS = 'ENABLED'
              AND acc.COLUMN_NAME = 'TRANSACTION_ID'
              AND 1 = (
                  SELECT COUNT(*)
                  FROM USER_CONS_COLUMNS cols
                  WHERE cols.CONSTRAINT_NAME = ac.CONSTRAINT_NAME
                    AND cols.TABLE_NAME = ac.TABLE_NAME
              )
            """, String.class);

        assertFalse(
            constraints.isEmpty(),
            "Oracle must enforce uniqueness on TRANSACTION_ID"
        );

        System.out.println(
            "FRAUD_UNIQUE_CONSTRAINT_PASS"
            + " | CONSTRAINTS=" + constraints
        );
    }
}