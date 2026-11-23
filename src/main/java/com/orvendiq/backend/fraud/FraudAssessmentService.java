package com.orvendiq.backend.fraud;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
public class FraudAssessmentService {

    private final JdbcTemplate jdbcTemplate;
    private final FraudAnalysisService analysisService;
    private final FraudAssessmentRepository assessmentRepository;

    public FraudAssessmentService(
            JdbcTemplate jdbcTemplate,
            FraudAnalysisService analysisService,
            FraudAssessmentRepository assessmentRepository) {

        this.jdbcTemplate = jdbcTemplate;
        this.analysisService = analysisService;
        this.assessmentRepository = assessmentRepository;
    }

    @Transactional
    public FraudAssessment assessTransaction(Long transactionId) {

        if (transactionId == null || transactionId <= 0) {
            throw new IllegalArgumentException(
                "Invalid transaction ID"
            );
        }

        // One assessment per transaction.
        // The database UNIQUE constraint is the final safeguard.
        if (assessmentRepository.existsByTransactionId(transactionId)) {
            return assessmentRepository
                .findByTransactionId(transactionId)
                .orElseThrow();
        }

        String sql = """
            SELECT
                sender.ACCOUNT_NUMBER AS FROM_ACCOUNT,
                receiver.ACCOUNT_NUMBER AS TO_ACCOUNT,
                t.AMOUNT,
                t.STATUS,
                t.TRANSACTION_TYPE
            FROM TRANSACTIONS t
            JOIN ACCOUNTS sender
              ON sender.ACCOUNT_ID = t.FROM_ACCOUNT_ID
            JOIN ACCOUNTS receiver
              ON receiver.ACCOUNT_ID = t.TO_ACCOUNT_ID
            WHERE t.TRANSACTION_ID = ?
            """;

        TransactionData data = jdbcTemplate.query(
            sql,
            rs -> {
                if (!rs.next()) {
                    return null;
                }

                return new TransactionData(
                    rs.getString("FROM_ACCOUNT"),
                    rs.getString("TO_ACCOUNT"),
                    rs.getBigDecimal("AMOUNT"),
                    rs.getString("STATUS"),
                    rs.getString("TRANSACTION_TYPE")
                );
            },
            transactionId
        );

        if (data == null) {
            throw new IllegalArgumentException(
                "Transaction not found"
            );
        }

        if (!"COMPLETED".equals(data.status())
                || !"TRANSFER".equals(data.transactionType())) {
            throw new IllegalArgumentException(
                "Only completed transfers can be assessed"
            );
        }

        FraudRiskResult result = analysisService.analyzeTransfer(
            transactionId,
            data.fromAccount(),
            data.toAccount(),
            data.amount()
        );

        // Risk indicators originate from fixed engine constants.
        String indicatorsJson = result.indicators()
            .stream()
            .map(indicator -> "\"" + indicator + "\"")
            .collect(Collectors.joining(",", "[", "]"));

        FraudAssessment assessment = new FraudAssessment(
            transactionId,
            result.score(),
            result.riskLevel(),
            indicatorsJson
        );

        return assessmentRepository.saveAndFlush(assessment);
    }

    private record TransactionData(
        String fromAccount,
        String toAccount,
        BigDecimal amount,
        String status,
        String transactionType
    ) {}
}