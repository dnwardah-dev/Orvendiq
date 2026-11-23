package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FraudRecoveryPreflightTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void inspectRecoveryCandidates() {

        List<Map<String, Object>> rows = jdbc.queryForList("""
            SELECT
                t.TRANSACTION_ID,
                t.TRANSACTION_TYPE,
                t.STATUS,
                t.AMOUNT,
                sender.ACCOUNT_NUMBER AS SENDER,
                receiver.ACCOUNT_NUMBER AS RECIPIENT,
                (
                    SELECT COUNT(*)
                    FROM FRAUD_ASSESSMENTS fa
                    WHERE fa.TRANSACTION_ID = t.TRANSACTION_ID
                ) AS ASSESSMENT_COUNT
            FROM TRANSACTIONS t
            JOIN ACCOUNTS sender
              ON sender.ACCOUNT_ID = t.FROM_ACCOUNT_ID
            JOIN ACCOUNTS receiver
              ON receiver.ACCOUNT_ID = t.TO_ACCOUNT_ID
            WHERE t.TRANSACTION_ID IN (41, 42)
            ORDER BY t.TRANSACTION_ID
            """);

        assertEquals(2, rows.size());

        for (Map<String, Object> row : rows) {
            assertEquals("TRANSFER", row.get("TRANSACTION_TYPE"));
            assertEquals("COMPLETED", row.get("STATUS"));

            assertEquals(
                0L,
                ((Number) row.get("ASSESSMENT_COUNT")).longValue()
            );

            System.out.println("RECOVERY_CANDIDATE | " + row);
        }

        System.out.println("RECOVERY_PREFLIGHT_PASS");
    }
}