package com.orvendiq.backend.funding;

import com.orvendiq.backend.account.Account;
import com.orvendiq.backend.account.AccountRepository;
import com.orvendiq.backend.ledger.LedgerEntry;
import com.orvendiq.backend.ledger.LedgerRepository;
import com.orvendiq.backend.transaction.Transaction;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class FundingIntegrationTest {

    @Autowired
    private FundingService fundingService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private LedgerRepository ledgerRepository;

    @Test
    void fundingShouldCreateBalancedLedger() {

        Account target = accountRepository
                .findByAccountNumber("ORV10000001")
                .orElseThrow();

        Account treasury = accountRepository
                .findByAccountNumber("ORV-SYSTEM-001")
                .orElseThrow();

        BigDecimal amount = new BigDecimal("1000000.00");

        BigDecimal balanceBefore =
                ledgerRepository.calculateBalance(target.getAccountId());

        Transaction transaction = fundingService.fundAccount(
                "ORV10000001", amount
        );

        assertEquals("COMPLETED", transaction.getStatus());

        List<LedgerEntry> entries = ledgerRepository
                .findByTransactionId(transaction.getTransactionId());

        assertEquals(2, entries.size());

        BigDecimal debit = entries.stream()
                .filter(e -> e.getEntryType().equals("DEBIT"))
                .map(LedgerEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal credit = entries.stream()
                .filter(e -> e.getEntryType().equals("CREDIT"))
                .map(LedgerEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertEquals(0, debit.compareTo(credit));
        assertEquals(0, amount.compareTo(credit));

        assertTrue(entries.stream().anyMatch(e ->
                e.getAccountId().equals(treasury.getAccountId())
                && e.getEntryType().equals("DEBIT")));

        assertTrue(entries.stream().anyMatch(e ->
                e.getAccountId().equals(target.getAccountId())
                && e.getEntryType().equals("CREDIT")));

        BigDecimal balanceAfter =
                ledgerRepository.calculateBalance(target.getAccountId());

        assertEquals(
                0,
                balanceAfter.subtract(balanceBefore).compareTo(amount)
        );
    }
}