package com.orvendiq.backend.ledger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class LedgerReleaseAuditTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void completedTransfersMustHaveBalancedLedger() {

        List<Map<String, Object>> invalid = jdbc.queryForList("""
            SELECT
                t.TRANSACTION_ID,
                t.AMOUNT,
                COUNT(le.TRANSACTION_ID) AS ENTRY_COUNT,
                SUM(
                    CASE WHEN le.ENTRY_TYPE = 'DEBIT'
                         THEN 1 ELSE 0 END
                ) AS DEBIT_COUNT,
                SUM(
                    CASE WHEN le.ENTRY_TYPE = 'CREDIT'
                         THEN 1 ELSE 0 END
                ) AS CREDIT_COUNT,
                SUM(
                    CASE WHEN le.ENTRY_TYPE = 'DEBIT'
                         THEN le.AMOUNT ELSE 0 END
                ) AS TOTAL_DEBIT,
                SUM(
                    CASE WHEN le.ENTRY_TYPE = 'CREDIT'
                         THEN le.AMOUNT ELSE 0 END
                ) AS TOTAL_CREDIT
            FROM TRANSACTIONS t
            LEFT JOIN LEDGER_ENTRIES le
              ON le.TRANSACTION_ID = t.TRANSACTION_ID
            WHERE t.TRANSACTION_TYPE = 'TRANSFER'
              AND t.STATUS = 'COMPLETED'
            GROUP BY t.TRANSACTION_ID, t.AMOUNT
            HAVING COUNT(le.TRANSACTION_ID) <> 2
                OR SUM(
                    CASE WHEN le.ENTRY_TYPE = 'DEBIT'
                         THEN 1 ELSE 0 END
                ) <> 1
                OR SUM(
                    CASE WHEN le.ENTRY_TYPE = 'CREDIT'
                         THEN 1 ELSE 0 END
                ) <> 1
                OR SUM(
                    CASE WHEN le.ENTRY_TYPE = 'DEBIT'
                         THEN le.AMOUNT ELSE 0 END
                ) <> t.AMOUNT
                OR SUM(
                    CASE WHEN le.ENTRY_TYPE = 'CREDIT'
                         THEN le.AMOUNT ELSE 0 END
                ) <> t.AMOUNT
            """);

        invalid.forEach(row ->
            System.out.println("INVALID_LEDGER: " + row)
        );

        assertTrue(
            invalid.isEmpty(),
            "Completed transfers must have balanced ledger entries"
        );

        System.out.println("LEDGER_RELEASE_AUDIT_PASS");
    }
}