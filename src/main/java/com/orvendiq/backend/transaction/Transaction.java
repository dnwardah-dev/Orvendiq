package com.orvendiq.backend.transaction;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "TRANSACTIONS")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TRANSACTION_ID")
    private Long transactionId;

    @Column(name = "TRANSACTION_REF", nullable = false, unique = true, length = 50)
    private String transactionRef;

    @Column(name = "FROM_ACCOUNT_ID", nullable = false)
    private Long fromAccountId;

    @Column(name = "TO_ACCOUNT_ID", nullable = false)
    private Long toAccountId;

    @Column(name = "AMOUNT", nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "CURRENCY_CODE", nullable = false, length = 3)
    private String currencyCode = "IDR";

    @Column(name = "STATUS", nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "TRANSACTION_TYPE", nullable = false, length = 20)
    private String transactionType = "TRANSFER";

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "COMPLETED_AT")
    private LocalDateTime completedAt;

    protected Transaction() {
    }

    public Transaction(String transactionRef, Long fromAccountId,
                       Long toAccountId, BigDecimal amount,
                       String transactionType) {
        this.transactionRef = transactionRef;
        this.fromAccountId = fromAccountId;
        this.toAccountId = toAccountId;
        this.amount = amount;
        this.transactionType = transactionType;
        this.createdAt = LocalDateTime.now();
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public String getTransactionRef() {
        return transactionRef;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getStatus() {
        return status;
    }

    public Long getFromAccountId() {
        return fromAccountId;
    }

    public Long getToAccountId() {
        return toAccountId;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void markCompleted() {
        this.status = "COMPLETED";
        this.completedAt = LocalDateTime.now();
    }
}