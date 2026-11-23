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
class DuplicateTransferIntegrationTest {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private FundingService fundingService;

    @Autowired
    private TransferService transferService;

    @Autowired
    private LedgerRepository ledgerRepository;

    @Test
    void duplicateReferenceMustNotCreateAnotherTransfer() {

        String suffix = UUID.randomUUID()
                .toString().replace("-", "").substring(0, 12);

        Account sender = accountRepository.saveAndFlush(
                new Account("S" + suffix, "Test Sender")
        );

        Account receiver = accountRepository.saveAndFlush(
                new Account("R" + suffix, "Test Receiver")
        );

        fundingService.fundAccount(
                sender.getAccountNumber(),
                new BigDecimal("1000000.00")
        );

        String reference = "TEST-DUP-" + suffix;
        BigDecimal amount = new BigDecimal("250000.00");

        Transaction first = transferService.transfer(
                sender.getAccountNumber(),
                receiver.getAccountNumber(),
                amount,
                reference
        );

        BigDecimal senderAfterFirst =
                ledgerRepository.calculateBalance(sender.getAccountId());

        BigDecimal receiverAfterFirst =
                ledgerRepository.calculateBalance(receiver.getAccountId());

        assertThrows(IllegalArgumentException.class, () ->
                transferService.transfer(
                        sender.getAccountNumber(),
                        receiver.getAccountNumber(),
                        amount,
                        reference
                )
        );

        List<LedgerEntry> entries =
                ledgerRepository.findByTransactionId(
                        first.getTransactionId()
                );

        assertEquals(2, entries.size());

        assertEquals(
                0,
                senderAfterFirst.compareTo(
                        ledgerRepository.calculateBalance(
                                sender.getAccountId()
                        )
                )
        );

        assertEquals(
                0,
                receiverAfterFirst.compareTo(
                        ledgerRepository.calculateBalance(
                                receiver.getAccountId()
                        )
                )
        );
    }
}