package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class FraudRiskEngineTest {

    private final FraudRiskEngine engine = new FraudRiskEngine();

    @Test
    void normalTransferShouldBeLowRisk() {
        FraudRiskResult result = engine.analyze(
            new BigDecimal("1000"), 0, false
        );

        assertEquals(0, result.score());
        assertEquals("LOW", result.riskLevel());
        assertTrue(result.indicators().isEmpty());
    }

    @Test
    void newRecipientShouldAddFifteenPoints() {
        FraudRiskResult result = engine.analyze(
            new BigDecimal("1000"), 0, true
        );

        assertEquals(15, result.score());
        assertEquals("LOW", result.riskLevel());
        assertTrue(result.indicators().contains("NEW_RECIPIENT"));
    }

    @Test
    void elevatedAmountShouldAddTwentyFivePoints() {
        FraudRiskResult result = engine.analyze(
            new BigDecimal("6000000"), 0, false
        );

        assertEquals(25, result.score());
        assertEquals("LOW", result.riskLevel());
    }

    @Test
    void amountAndNewRecipientShouldBeMediumRisk() {
        FraudRiskResult result = engine.analyze(
            new BigDecimal("6000000"), 0, true
        );

        assertEquals(40, result.score());
        assertEquals("MEDIUM", result.riskLevel());
    }

    @Test
    void highAmountAndFrequencyShouldBeHighRisk() {
        FraudRiskResult result = engine.analyze(
            new BigDecimal("10000000"), 10, false
        );

        assertEquals(85, result.score());
        assertEquals("HIGH", result.riskLevel());
    }

    @Test
    void maximumRiskShouldBeCappedAtOneHundred() {
        FraudRiskResult result = engine.analyze(
            new BigDecimal("10000000"), 10, true
        );

        assertEquals(100, result.score());
        assertEquals("HIGH", result.riskLevel());
        assertEquals(3, result.indicators().size());
    }
}