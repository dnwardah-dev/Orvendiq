package com.orvendiq.backend.fraud;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class FraudRiskEngine {

    public FraudRiskResult analyze(
            BigDecimal amount,
            int recentTransactionCount,
            boolean newRecipient) {

        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException(
                "Transaction amount must be positive"
            );
        }

        if (recentTransactionCount < 0) {
            throw new IllegalArgumentException(
                "Transaction count cannot be negative"
            );
        }

        int score = 0;
        List<String> indicators = new ArrayList<>();

        // Rule 1: High transaction amount
        if (amount.compareTo(
                new BigDecimal("10000000")) >= 0) {
            score += 45;
            indicators.add("HIGH_TRANSACTION_AMOUNT");
        } else if (amount.compareTo(
                new BigDecimal("5000000")) >= 0) {
            score += 25;
            indicators.add("ELEVATED_TRANSACTION_AMOUNT");
        }

        // Rule 2: High transaction frequency
        if (recentTransactionCount >= 10) {
            score += 40;
            indicators.add("HIGH_TRANSACTION_FREQUENCY");
        } else if (recentTransactionCount >= 5) {
            score += 20;
            indicators.add("ELEVATED_TRANSACTION_FREQUENCY");
        }

        // Rule 3: First-time recipient
        if (newRecipient) {
            score += 15;
            indicators.add("NEW_RECIPIENT");
        }

        score = Math.min(score, 100);

        String riskLevel;

        if (score >= 70) {
            riskLevel = "HIGH";
        } else if (score >= 30) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        return new FraudRiskResult(
            score,
            riskLevel,
            List.copyOf(indicators)
        );
    }
}