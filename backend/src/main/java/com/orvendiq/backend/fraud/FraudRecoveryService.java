package com.orvendiq.backend.fraud;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FraudRecoveryService {

    private final JdbcTemplate jdbcTemplate;

    public FraudRecoveryService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Read-only scan of completed transfers without fraud assessments.
     * Does not create assessments or modify the ledger.
     */
    @Transactional(readOnly = true)
    public List<Long> findMissingAssessments(int limit) {

        if (limit < 1 || limit > 100) {
            throw new IllegalArgumentException(
                "Limit must be between 1 and 100"
            );
        }

        String sql = """
            SELECT t.TRANSACTION_ID
            FROM TRANSACTIONS t
            WHERE t.STATUS = 'COMPLETED'
              AND t.TRANSACTION_TYPE = 'TRANSFER'
              AND NOT EXISTS (
                  SELECT 1
                  FROM FRAUD_ASSESSMENTS fa
                  WHERE fa.TRANSACTION_ID = t.TRANSACTION_ID
              )
            ORDER BY t.TRANSACTION_ID ASC
            FETCH FIRST ? ROWS ONLY
            """;

        return jdbcTemplate.queryForList(
            sql,
            Long.class,
            limit
        );
    }
}