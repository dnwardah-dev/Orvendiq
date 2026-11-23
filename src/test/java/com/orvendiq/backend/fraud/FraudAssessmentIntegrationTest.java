package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FraudAssessmentIntegrationTest {

    private static final Long TRANSACTION_ID = 22L;

    @Autowired
    private FraudAssessmentService assessmentService;

    @Autowired
    private FraudAssessmentRepository assessmentRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void shouldPersistAssessmentWithoutDuplicates() {

        Long transactionExists = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM TRANSACTIONS
            WHERE TRANSACTION_ID = ?
              AND STATUS = 'COMPLETED'
              AND TRANSACTION_TYPE = 'TRANSFER'
            """,
            Long.class,
            TRANSACTION_ID
        );

        assertEquals(1L, transactionExists);

        FraudAssessment first =
            assessmentService.assessTransaction(TRANSACTION_ID);

        assertNotNull(first.getAssessmentId());
        assertTrue(first.getRiskScore() >= 0);
        assertTrue(first.getRiskScore() <= 100);

        assertTrue(
            java.util.Set.of("LOW", "MEDIUM", "HIGH")
                .contains(first.getRiskLevel())
        );

        FraudAssessment second =
            assessmentService.assessTransaction(TRANSACTION_ID);

        assertEquals(
            first.getAssessmentId(),
            second.getAssessmentId()
        );

        Long assessmentCount = jdbcTemplate.queryForObject(
            """
            SELECT COUNT(*)
            FROM FRAUD_ASSESSMENTS
            WHERE TRANSACTION_ID = ?
            """,
            Long.class,
            TRANSACTION_ID
        );

        assertEquals(1L, assessmentCount);

        System.out.println("FRAUD ASSESSMENT SAVED");
        System.out.println("TRANSACTION ID: " + TRANSACTION_ID);
        System.out.println("RISK SCORE: " + first.getRiskScore());
        System.out.println("RISK LEVEL: " + first.getRiskLevel());
        System.out.println("INDICATORS: " + first.getIndicators());
        System.out.println("ASSESSMENT COUNT: " + assessmentCount);
    }
}