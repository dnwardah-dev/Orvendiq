package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FraudRecoveryVerificationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void recoveredTransfersMustHaveExactlyOneAssessment() {

        for (Long id : new Long[]{41L, 42L}) {

            Long count = jdbc.queryForObject(
                """
                SELECT COUNT(*)
                FROM FRAUD_ASSESSMENTS
                WHERE TRANSACTION_ID = ?
                """,
                Long.class,
                id
            );

            assertEquals(
                1L,
                count,
                "Transaction " + id
                    + " must have exactly one assessment"
            );

            System.out.println(
                "AUTO_RECOVERY_VERIFIED | TX="
                + id + " | ASSESSMENTS=" + count
            );
        }
    }
}