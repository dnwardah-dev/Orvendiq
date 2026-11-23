package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FraudAnalysisV1DiagnosticTest {

    @Autowired
    private FraudAnalysisService analysisService;

    @Test
    void analyzeExistingTransferWithoutWritingAssessment() {

        FraudRiskResult result = analysisService.analyzeTransfer(
            43L,
            "ORV10000001",
            "ORV10000002",
            new BigDecimal("2000.00")
        );

        assertNotNull(result);
        assertNotNull(result.riskLevel());
        assertNotNull(result.indicators());
        assertTrue(result.score() >= 0);
        assertTrue(result.score() <= 100);

        System.out.println(
            "FRAUD_V1_TEST"
            + " | TRANSACTION_ID=43"
            + " | SCORE=" + result.score()
            + " | LEVEL=" + result.riskLevel()
            + " | INDICATORS=" + result.indicators()
        );
    }
}