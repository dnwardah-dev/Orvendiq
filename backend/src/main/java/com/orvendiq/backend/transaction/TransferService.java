package com.orvendiq.backend.transaction;

import com.orvendiq.backend.account.Account;
import com.orvendiq.backend.account.AccountRepository;
import com.orvendiq.backend.ledger.LedgerEntry;
import com.orvendiq.backend.ledger.LedgerRepository;
import com.orvendiq.backend.fraud.TransferCompletedEvent;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransferService {

    private static final String TREASURY = "ORV-SYSTEM-001";

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerRepository ledgerRepository;
    private final ApplicationEventPublisher eventPublisher;

    public TransferService(
            AccountRepository accountRepository,
            TransactionRepository transactionRepository,
            LedgerRepository ledgerRepository,
            ApplicationEventPublisher eventPublisher) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.ledgerRepository = ledgerRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Transaction transfer(
            String fromNumber,
            String toNumber,
            BigDecimal amount,
            String reference) {

        if (fromNumber == null || toNumber == null ||
                fromNumber.equals(toNumber)) {
            throw new IllegalArgumentException("Invalid accounts");
        }

        if (reference == null || reference.isBlank()
                || reference.length() > 50) {
            throw new IllegalArgumentException("Invalid reference");
        }

        if (amount == null || amount.signum() <= 0
                || amount.scale() > 2
                || amount.precision() > 19) {
            throw new IllegalArgumentException("Invalid amount");
        }

        if (TREASURY.equals(fromNumber) || TREASURY.equals(toNumber)) {
            throw new IllegalArgumentException(
                "Treasury cannot be used for public transfers");
        }

        Account sender = accountRepository
                .findByAccountNumber(fromNumber)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Sender not found"));

        Account receiver = accountRepository
                .findByAccountNumber(toNumber)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Receiver not found"));

        Long firstId = Math.min(
                sender.getAccountId(), receiver.getAccountId());
        Long secondId = Math.max(
                sender.getAccountId(), receiver.getAccountId());

        Account first = accountRepository
                .findByIdForUpdate(firstId).orElseThrow();

        Account second = accountRepository
                .findByIdForUpdate(secondId).orElseThrow();

        if (!"ACTIVE".equals(first.getStatus()) ||
                !"ACTIVE".equals(second.getStatus())) {
            throw new IllegalStateException("Account is not active");
        }

        // Check after account locks to serialize competing transfers.
        if (transactionRepository.existsByTransactionRef(reference)) {
            throw new IllegalArgumentException(
                "Transaction reference already exists");
        }

        BigDecimal balance = ledgerRepository
                .calculateBalance(sender.getAccountId());

        if (balance.compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient funds");
        }

        Transaction transaction = new Transaction(
                reference,
                sender.getAccountId(),
                receiver.getAccountId(),
                amount,
                "TRANSFER"
        );

        transaction.markCompleted();

        Transaction saved =
                transactionRepository.saveAndFlush(transaction);

        ledgerRepository.saveAllAndFlush(List.of(
                new LedgerEntry(
                        saved.getTransactionId(),
                        sender.getAccountId(),
                        "DEBIT",
                        amount),
                new LedgerEntry(
                        saved.getTransactionId(),
                        receiver.getAccountId(),
                        "CREDIT",
                        amount)
        ));

        eventPublisher.publishEvent(
                new TransferCompletedEvent(saved.getTransactionId())
        );

        return saved;
    }
}