package com.orvendiq.backend.transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionHistoryResponse(
    Long transactionId,
    String reference,
    String fromAccount,
    String fromAccountName,
    String toAccount,
    String toAccountName,
    BigDecimal amount,
    String currency,
    String status,
    String transactionType,
    String direction,
    LocalDateTime createdAt,
    LocalDateTime completedAt
) {}