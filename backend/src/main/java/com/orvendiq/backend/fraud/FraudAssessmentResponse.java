package com.orvendiq.backend.fraud;

import java.time.LocalDateTime;

public record FraudAssessmentResponse(
    Long transactionId,
    Integer riskScore,
    String riskLevel,
    String indicators,
    LocalDateTime assessedAt
) {
    public static FraudAssessmentResponse from(
            FraudAssessment assessment) {
        return new FraudAssessmentResponse(
            assessment.getTransactionId(),
            assessment.getRiskScore(),
            assessment.getRiskLevel(),
            assessment.getIndicators(),
            assessment.getAssessedAt()
        );
    }
}