package com.orvendiq.backend.fraud;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "FRAUD_ASSESSMENTS")
public class FraudAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ASSESSMENT_ID")
    private Long assessmentId;

    @Column(name = "TRANSACTION_ID", nullable = false, unique = true)
    private Long transactionId;

    @Column(name = "RISK_SCORE", nullable = false)
    private Integer riskScore;

    @Column(name = "RISK_LEVEL", nullable = false, length = 10)
    private String riskLevel;

    @Lob
    @Column(name = "INDICATORS", nullable = false)
    private String indicators;

    @Column(name = "ASSESSED_AT", nullable = false)
    private LocalDateTime assessedAt;

    protected FraudAssessment() {}

    public FraudAssessment(
            Long transactionId,
            Integer riskScore,
            String riskLevel,
            String indicators) {

        this.transactionId = transactionId;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.indicators = indicators;
        this.assessedAt = LocalDateTime.now();
    }

    public Long getAssessmentId() { return assessmentId; }
    public Long getTransactionId() { return transactionId; }
    public Integer getRiskScore() { return riskScore; }
    public String getRiskLevel() { return riskLevel; }
    public String getIndicators() { return indicators; }
    public LocalDateTime getAssessedAt() { return assessedAt; }
}