package com.orvendiq.backend.transaction;

import com.orvendiq.backend.account.Account;
import com.orvendiq.backend.account.AccountRepository;
import com.orvendiq.backend.funding.FundingService;
import com.orvendiq.backend.ledger.LedgerEntry;
import com.orvendiq.backend.ledger.LedgerRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class TransferIntegrationTest {

    @Autowired
    private FundingService fundingService;

    @Autowired
    private TransferService transferService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private LedgerRepository ledgerRepository;

    @Test
    void transferShouldUpdateBalancesAndCreateBalancedLedger() {

        Account sendok = accountRepository
                .findByAccountNumber("ORV10000001")
                .orElseThrow();

        Account garpu = accountRepository
                .findByAccountNumber("ORV10000002")
                .orElseThrow();

        BigDecimal sendokBefore =
                ledgerRepository.calculateBalance(sendok.getAccountId());

        BigDecimal garpuBefore =
                ledgerRepository.calculateBalance(garpu.getAccountId());

        // Create test funding within the test transaction.
        fundingService.fundAccount(
                "ORV10000001",
                new BigDecimal("1000000.00")
        );

        BigDecimal transferAmount = new BigDecimal("250000.00");

        Transaction transfer = transferService.transfer(
                "ORV10000001",
                "ORV10000002",
                transferAmount,
                "TEST-" + UUID.randomUUID()
        );

        assertEquals("COMPLETED", transfer.getStatus());

        List<LedgerEntry> entries = ledgerRepository
                .findByTransactionId(transfer.getTransactionId());

        assertEquals(2, entries.size());

        assertTrue(entries.stream().anyMatch(e ->
                e.getAccountId().equals(sendok.getAccountId())
                && e.getEntryType().equals("DEBIT")
                && e.getAmount().compareTo(transferAmount) == 0
        ));

        assertTrue(entries.stream().anyMatch(e ->
                e.getAccountId().equals(garpu.getAccountId())
                && e.getEntryType().equals("CREDIT")
                && e.getAmount().compareTo(transferAmount) == 0
        ));

        BigDecimal sendokAfter =
                ledgerRepository.calculateBalance(sendok.getAccountId());

        BigDecimal garpuAfter =
                ledgerRepository.calculateBalance(garpu.getAccountId());

        assertEquals(
                0,
                sendokAfter.subtract(sendokBefore)
                        .compareTo(new BigDecimal("750000.00"))
        );

        assertEquals(
                0,
                garpuAfter.subtract(garpuBefore)
                        .compareTo(transferAmount)
        );
    }
}