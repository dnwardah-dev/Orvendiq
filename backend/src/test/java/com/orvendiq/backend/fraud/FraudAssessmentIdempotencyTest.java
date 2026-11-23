package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FraudAssessmentIdempotencyTest {

    @Autowired
    private FraudAssessmentService assessmentService;

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void repeatedAssessmentShouldNotCreateDuplicates() {

        Long transactionId = 43L;

        Long before = countAssessments(transactionId);

        assertEquals(
            1L,
            before,
            "Transaction #43 must already have one assessment"
        );

        FraudAssessment first =
            assessmentService.assessTransaction(transactionId);

        FraudAssessment second =
            assessmentService.assessTransaction(transactionId);

        assertNotNull(first);
        assertNotNull(second);

        assertEquals(
            first.getAssessmentId(),
            second.getAssessmentId(),
            "Repeated requests must return the same assessment"
        );

        Long after = countAssessments(transactionId);

        assertEquals(
            before,
            after,
            "Assessment count must not increase"
        );

        System.out.println(
            "FRAUD_IDEMPOTENCY_PASS"
            + " | TRANSACTION_ID=" + transactionId
            + " | BEFORE=" + before
            + " | AFTER=" + after
            + " | ASSESSMENT_ID=" + first.getAssessmentId()
        );
    }

    private Long countAssessments(Long transactionId) {
        return jdbc.queryForObject(
            """
            SELECT COUNT(*)
            FROM FRAUD_ASSESSMENTS
            WHERE TRANSACTION_ID = ?
            """,
            Long.class,
            transactionId
        );
    }
}