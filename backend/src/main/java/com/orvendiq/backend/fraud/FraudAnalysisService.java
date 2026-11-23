package com.orvendiq.backend.fraud;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class FraudAnalysisService {

    private final JdbcTemplate jdbcTemplate;
    private final FraudRiskEngine fraudRiskEngine;

    public FraudAnalysisService(
            JdbcTemplate jdbcTemplate,
            FraudRiskEngine fraudRiskEngine) {

        this.jdbcTemplate = jdbcTemplate;
        this.fraudRiskEngine = fraudRiskEngine;
    }

    @Transactional(readOnly = true)
    public FraudRiskResult analyzeTransfer(
            Long transactionId,
            String fromAccount,
            String toAccount,
            BigDecimal amount) {

        if (transactionId == null || transactionId <= 0) {
            throw new IllegalArgumentException(
                "Invalid transaction ID"
            );
        }

        if (fromAccount == null || fromAccount.isBlank()
                || toAccount == null || toAccount.isBlank()
                || fromAccount.equals(toAccount)) {
            throw new IllegalArgumentException(
                "Invalid account numbers"
            );
        }

        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException(
                "Invalid transaction amount"
            );
        }

        String frequencySql = """
            SELECT COUNT(*)
            FROM TRANSACTIONS t
            JOIN ACCOUNTS a
              ON a.ACCOUNT_ID = t.FROM_ACCOUNT_ID
            JOIN TRANSACTIONS current_tx
              ON current_tx.TRANSACTION_ID = ?
            WHERE a.ACCOUNT_NUMBER = ?
              AND t.TRANSACTION_TYPE = 'TRANSFER'
              AND t.STATUS = 'COMPLETED'
              AND t.TRANSACTION_ID < ?
              AND t.CREATED_AT >=
                  current_tx.CREATED_AT - INTERVAL '1' HOUR
              AND t.CREATED_AT <= current_tx.CREATED_AT
            """;

        Integer recentCount = jdbcTemplate.queryForObject(
            frequencySql,
            Integer.class,
            transactionId,
            fromAccount,
            transactionId
        );

        String recipientSql = """
            SELECT COUNT(*)
            FROM TRANSACTIONS t
            JOIN ACCOUNTS sender
              ON sender.ACCOUNT_ID = t.FROM_ACCOUNT_ID
            JOIN ACCOUNTS receiver
              ON receiver.ACCOUNT_ID = t.TO_ACCOUNT_ID
            WHERE sender.ACCOUNT_NUMBER = ?
              AND receiver.ACCOUNT_NUMBER = ?
              AND t.TRANSACTION_TYPE = 'TRANSFER'
              AND t.STATUS = 'COMPLETED'
              AND t.TRANSACTION_ID < ?
            """;

        Integer previousTransfers = jdbcTemplate.queryForObject(
            recipientSql,
            Integer.class,
            fromAccount,
            toAccount,
            transactionId
        );

        boolean newRecipient =
                previousTransfers == null
                || previousTransfers == 0;

        return fraudRiskEngine.analyze(
            amount,
            recentCount == null ? 0 : recentCount,
            newRecipient
        );
    }
}