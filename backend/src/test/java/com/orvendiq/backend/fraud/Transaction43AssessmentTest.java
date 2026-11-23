package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class Transaction43AssessmentTest {

    @Autowired
    private FraudAssessmentService assessmentService;

    @Test
    void assessTransaction43() {
        FraudAssessment result =
            assessmentService.assessTransaction(43L);

        assertNotNull(result);
        assertEquals(43L, result.getTransactionId());

        System.out.println(
            "ASSESSMENT_CREATED"
            + " | TRANSACTION_ID=" + result.getTransactionId()
            + " | SCORE=" + result.getRiskScore()
            + " | LEVEL=" + result.getRiskLevel()
        );
    }
}