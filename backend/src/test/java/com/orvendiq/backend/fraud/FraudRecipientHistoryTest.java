package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional(readOnly = true)
class FraudRecipientHistoryTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private FraudAnalysisService analysisService;

    @Test
    void firstAndRepeatedRecipientMustBeDifferent() {

        List<Map<String, Object>> transfers = jdbc.queryForList("""
            SELECT
                t.TRANSACTION_ID AS TX_ID,
                t.AMOUNT AS AMOUNT,
                sender.ACCOUNT_NUMBER AS SENDER,
                receiver.ACCOUNT_NUMBER AS RECIPIENT
            FROM TRANSACTIONS t
            JOIN ACCOUNTS sender
              ON sender.ACCOUNT_ID = t.FROM_ACCOUNT_ID
            JOIN ACCOUNTS receiver
              ON receiver.ACCOUNT_ID = t.TO_ACCOUNT_ID
            WHERE sender.ACCOUNT_NUMBER = ?
              AND receiver.ACCOUNT_NUMBER = ?
              AND t.TRANSACTION_TYPE = 'TRANSFER'
              AND t.STATUS = 'COMPLETED'
            ORDER BY t.TRANSACTION_ID ASC
            """,
            "ORV10000001",
            "ORV10000002"
        );

        assertTrue(
            transfers.size() >= 2,
            "At least two completed demo transfers are required"
        );

        Map<String, Object> first = transfers.get(0);
        Map<String, Object> second = transfers.get(1);

        FraudRiskResult firstResult = analysisService.analyzeTransfer(
            ((Number) first.get("TX_ID")).longValue(),
            (String) first.get("SENDER"),
            (String) first.get("RECIPIENT"),
            (BigDecimal) first.get("AMOUNT")
        );

        FraudRiskResult secondResult = analysisService.analyzeTransfer(
            ((Number) second.get("TX_ID")).longValue(),
            (String) second.get("SENDER"),
            (String) second.get("RECIPIENT"),
            (BigDecimal) second.get("AMOUNT")
        );

        assertTrue(
            firstResult.indicators().contains("NEW_RECIPIENT"),
            "First transfer must flag NEW_RECIPIENT"
        );

        assertFalse(
            secondResult.indicators().contains("NEW_RECIPIENT"),
            "Repeated transfer must not flag NEW_RECIPIENT"
        );

        System.out.println(
            "RECIPIENT_HISTORY_PASS"
            + " | FIRST_TX=" + first.get("TX_ID")
            + " | FIRST_INDICATORS=" + firstResult.indicators()
            + " | SECOND_TX=" + second.get("TX_ID")
            + " | SECOND_INDICATORS=" + secondResult.indicators()
        );
    }
}