package com.orvendiq.backend.account;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ACCOUNTS")
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ACCOUNT_ID")
    private Long accountId;

    @Column(name = "ACCOUNT_NUMBER", nullable = false, unique = true)
    private String accountNumber;

    @Column(name = "OWNER_NAME", nullable = false)
    private String ownerName;

    @Column(name = "CURRENCY_CODE", nullable = false)
    private String currencyCode = "IDR";

    @Column(name = "STATUS", nullable = false)
    private String status = "ACTIVE";

    @Column(name = "CREATED_AT", nullable = false)
    private LocalDateTime createdAt;

    protected Account() {
    }

    public Account(String accountNumber, String ownerName) {
        this.accountNumber = accountNumber;
        this.ownerName = ownerName;
        this.createdAt = LocalDateTime.now();
    }

    public Long getAccountId() {
        return accountId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}