package com.orvendiq.backend.transaction;

import java.math.BigDecimal;

public record TransferResponse(
    Long transactionId,
    String reference,
    BigDecimal amount,
    String status
) {
    public static TransferResponse from(Transaction tx) {
        return new TransferResponse(
            tx.getTransactionId(),
            tx.getTransactionRef(),
            tx.getAmount(),
            tx.getStatus()
        );
    }
}