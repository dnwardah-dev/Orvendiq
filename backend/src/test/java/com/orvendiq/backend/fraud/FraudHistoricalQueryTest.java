package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional(readOnly = true)
class FraudHistoricalQueryTest {

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    FraudAnalysisService analysisService;

    @Test
    void shouldMatchHistoricalDataForTransaction43() {

        Long transactionId = 43L;

        Map<String, Object> tx = jdbc.queryForMap("""
            SELECT
                sender.ACCOUNT_NUMBER AS SENDER,
                receiver.ACCOUNT_NUMBER AS RECIPIENT,
                t.AMOUNT
            FROM TRANSACTIONS t
            JOIN ACCOUNTS sender
              ON sender.ACCOUNT_ID = t.FROM_ACCOUNT_ID
            JOIN ACCOUNTS receiver
              ON receiver.ACCOUNT_ID = t.TO_ACCOUNT_ID
            WHERE t.TRANSACTION_ID = ?
              AND t.STATUS = 'COMPLETED'
              AND t.TRANSACTION_TYPE = 'TRANSFER'
            """, transactionId);

        String sender = (String) tx.get("SENDER");
        String recipient = (String) tx.get("RECIPIENT");
        BigDecimal amount = (BigDecimal) tx.get("AMOUNT");

        Long previousRecipients = jdbc.queryForObject("""
            SELECT COUNT(*)
            FROM TRANSACTIONS t
            JOIN ACCOUNTS s
              ON s.ACCOUNT_ID = t.FROM_ACCOUNT_ID
            JOIN ACCOUNTS r
              ON r.ACCOUNT_ID = t.TO_ACCOUNT_ID
            WHERE s.ACCOUNT_NUMBER = ?
              AND r.ACCOUNT_NUMBER = ?
              AND t.TRANSACTION_TYPE = 'TRANSFER'
              AND t.STATUS = 'COMPLETED'
              AND t.TRANSACTION_ID < ?
            """,
            Long.class,
            sender,
            recipient,
            transactionId
        );

        Long previousFrequency = jdbc.queryForObject("""
            SELECT COUNT(*)
            FROM TRANSACTIONS t
            JOIN ACCOUNTS s
              ON s.ACCOUNT_ID = t.FROM_ACCOUNT_ID
            JOIN TRANSACTIONS current_tx
              ON current_tx.TRANSACTION_ID = ?
            WHERE s.ACCOUNT_NUMBER = ?
              AND t.TRANSACTION_TYPE = 'TRANSFER'
              AND t.STATUS = 'COMPLETED'
              AND t.TRANSACTION_ID < ?
              AND t.CREATED_AT >=
                  current_tx.CREATED_AT - INTERVAL '1' HOUR
              AND t.CREATED_AT <= current_tx.CREATED_AT
            """,
            Long.class,
            transactionId,
            sender,
            transactionId
        );

        assertNotNull(previousRecipients);
        assertNotNull(previousFrequency);

        FraudRiskResult result = analysisService.analyzeTransfer(
            transactionId,
            sender,
            recipient,
            amount
        );

        boolean expectedNewRecipient = previousRecipients == 0;

        assertEquals(
            expectedNewRecipient,
            result.indicators().contains("NEW_RECIPIENT"),
            "New recipient indicator must match historical data"
        );

        String expectedFrequencyIndicator =
            previousFrequency >= 10
                ? "HIGH_TRANSACTION_FREQUENCY"
                : previousFrequency >= 5
                    ? "ELEVATED_TRANSACTION_FREQUENCY"
                    : null;

        if (expectedFrequencyIndicator == null) {
            assertFalse(
                result.indicators().contains("HIGH_TRANSACTION_FREQUENCY")
            );
            assertFalse(
                result.indicators().contains("ELEVATED_TRANSACTION_FREQUENCY")
            );
        } else {
            assertTrue(
                result.indicators().contains(expectedFrequencyIndicator)
            );
        }

        System.out.println(
            "HISTORICAL_QUERY_PASS"
            + " | TX=" + transactionId
            + " | PREVIOUS_RECIPIENT_TRANSFERS=" + previousRecipients
            + " | PREVIOUS_HOUR_TRANSFERS=" + previousFrequency
            + " | SCORE=" + result.score()
            + " | LEVEL=" + result.riskLevel()
            + " | INDICATORS=" + result.indicators()
        );
    }
}