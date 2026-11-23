package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class FraudRiskBoundaryTest {

    private final FraudRiskEngine engine = new FraudRiskEngine();

    private FraudRiskResult analyze(
            String amount,
            int frequency,
            boolean newRecipient) {

        return engine.analyze(
            new BigDecimal(amount),
            frequency,
            newRecipient
        );
    }

    @Test
    void amountBelowFiveMillionHasNoAmountIndicator() {
        FraudRiskResult result = analyze("4999999.99", 0, false);
        assertEquals(0, result.score());
        assertTrue(result.indicators().isEmpty());
    }

    @Test
    void exactlyFiveMillionAddsTwentyFive() {
        FraudRiskResult result = analyze("5000000", 0, false);
        assertEquals(25, result.score());
        assertEquals("LOW", result.riskLevel());
    }

    @Test
    void exactlyTenMillionAddsFortyFive() {
        FraudRiskResult result = analyze("10000000", 0, false);
        assertEquals(45, result.score());
        assertEquals("MEDIUM", result.riskLevel());
        assertTrue(result.indicators().contains(
            "HIGH_TRANSACTION_AMOUNT"
        ));
    }

    @Test
    void fourPreviousTransfersDoNotTriggerFrequency() {
        FraudRiskResult result = analyze("1000", 4, false);
        assertEquals(0, result.score());
    }

    @Test
    void fivePreviousTransfersTriggerElevatedFrequency() {
        FraudRiskResult result = analyze("1000", 5, false);
        assertEquals(20, result.score());
        assertTrue(result.indicators().contains(
            "ELEVATED_TRANSACTION_FREQUENCY"
        ));
    }

    @Test
    void ninePreviousTransfersRemainElevated() {
        FraudRiskResult result = analyze("1000", 9, false);
        assertEquals(20, result.score());
    }

    @Test
    void tenPreviousTransfersTriggerHighFrequency() {
        FraudRiskResult result = analyze("1000", 10, false);
        assertEquals(40, result.score());
        assertEquals("MEDIUM", result.riskLevel());
        assertTrue(result.indicators().contains(
            "HIGH_TRANSACTION_FREQUENCY"
        ));
    }

    @Test
    void combinedIndicatorsProduceHighRisk() {
        FraudRiskResult result = analyze("10000000", 5, true);
        assertEquals(80, result.score());
        assertEquals("HIGH", result.riskLevel());
        assertEquals(3, result.indicators().size());
    }
}