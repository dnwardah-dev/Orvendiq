package com.orvendiq.backend.fraud;

/**
 * Published when a completed transfer has been saved
 * inside the transfer transaction.
 *
 * Listeners must wait for successful database commit.
 */
public record TransferCompletedEvent(
    Long transactionId
) {
    public TransferCompletedEvent {
        if (transactionId == null || transactionId <= 0) {
            throw new IllegalArgumentException(
                "Valid transaction ID is required"
            );
        }
    }
}