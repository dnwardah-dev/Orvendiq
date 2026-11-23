package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FraudAnalysisIntegrationTest {

    @Autowired
    private FraudAnalysisService analysisService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void shouldAnalyzeExistingRecipientFromOracle() {

        Long existingTransfers = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM TRANSACTIONS t
            JOIN ACCOUNTS sender
              ON sender.ACCOUNT_ID = t.FROM_ACCOUNT_ID
            JOIN ACCOUNTS receiver
              ON receiver.ACCOUNT_ID = t.TO_ACCOUNT_ID
            WHERE sender.ACCOUNT_NUMBER = ?
              AND receiver.ACCOUNT_NUMBER = ?
              AND t.TRANSACTION_TYPE = 'TRANSFER'
              AND t.STATUS = 'COMPLETED'
            """,
            Long.class,
            "ORV10000001",
            "ORV10000002"
        );

        assertNotNull(existingTransfers);
        assertTrue(existingTransfers > 0,
            "Expected Aira to have transferred to Ariq");

        FraudRiskResult result = analysisService.analyzeTransfer(
            43L,
            "ORV10000001",
            "ORV10000002",
            new BigDecimal("1000.00")
        );

        assertNotNull(result);
        assertTrue(result.score() >= 0);
        assertTrue(result.score() <= 100);

        assertFalse(
            result.indicators().contains("NEW_RECIPIENT"),
            "Ariq should be recognized as existing recipient"
        );

        assertTrue(
            java.util.Set.of("LOW", "MEDIUM", "HIGH")
                .contains(result.riskLevel())
        );

        System.out.println("FRAUD ANALYSIS SUCCESS");
        System.out.println("RISK SCORE: " + result.score());
        System.out.println("RISK LEVEL: " + result.riskLevel());
        System.out.println("INDICATORS: " + result.indicators());
    }

    @Test
    void shouldRejectInvalidTransactionAmount() {

        assertThrows(
            IllegalArgumentException.class,
            () -> analysisService.analyzeTransfer(
                43L,
                "ORV10000001",
                "ORV10000002",
                BigDecimal.ZERO
            )
        );
    }
}