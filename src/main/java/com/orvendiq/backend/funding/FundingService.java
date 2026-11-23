package com.orvendiq.backend.funding;

import com.orvendiq.backend.account.Account;
import com.orvendiq.backend.account.AccountRepository;
import com.orvendiq.backend.transaction.Transaction;
import com.orvendiq.backend.transaction.TransactionRepository;
import com.orvendiq.backend.ledger.LedgerEntry;
import com.orvendiq.backend.ledger.LedgerRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class FundingService {

    private static final String TREASURY = "ORV-SYSTEM-001";

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerRepository ledgerRepository;

    public FundingService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            LedgerRepository ledgerRepository) {

        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.ledgerRepository = ledgerRepository;
    }

    @Transactional
    public Transaction fundAccount(
            String targetAccountNumber,
            BigDecimal amount) {

        if (amount == null ||
                amount.signum() <= 0 ||
                amount.scale() > 2 ||
                amount.precision() > 19) {
            throw new IllegalArgumentException("Invalid funding amount");
        }

        Account treasury = accountRepository
                .findByAccountNumber(TREASURY)
                .orElseThrow(() ->
                    new IllegalStateException("Treasury not found"));

        Account target = accountRepository
                .findByAccountNumber(targetAccountNumber)
                .orElseThrow(() ->
                    new IllegalArgumentException("Target account not found"));

        if (treasury.getAccountId().equals(target.getAccountId())) {
            throw new IllegalArgumentException("Cannot fund treasury");
        }

        // Lock accounts in ascending ID order.
        Long firstId = Math.min(
                treasury.getAccountId(), target.getAccountId());

        Long secondId = Math.max(
                treasury.getAccountId(), target.getAccountId());

        Account first = accountRepository.findByIdForUpdate(firstId)
                .orElseThrow();

        Account second = accountRepository.findByIdForUpdate(secondId)
                .orElseThrow();

        if (!"ACTIVE".equals(first.getStatus()) ||
                !"ACTIVE".equals(second.getStatus())) {
            throw new IllegalStateException("Account is not active");
        }

        String reference = "FUND-" + UUID.randomUUID();

        Transaction transaction = new Transaction(
                reference,
                treasury.getAccountId(),
                target.getAccountId(),
                amount,
                "INITIAL_FUNDING"
        );

        transaction.markCompleted();

        Transaction saved = transactionRepository.save(transaction);

        LedgerEntry debit = new LedgerEntry(
                saved.getTransactionId(),
                treasury.getAccountId(),
                "DEBIT",
                amount
        );

        LedgerEntry credit = new LedgerEntry(
                saved.getTransactionId(),
                target.getAccountId(),
                "CREDIT",
                amount
        );

        ledgerRepository.saveAll(List.of(debit, credit));

        return saved;
    }
}