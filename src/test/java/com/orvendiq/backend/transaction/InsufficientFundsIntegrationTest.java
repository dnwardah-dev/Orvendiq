package com.orvendiq.backend.transaction;

import com.orvendiq.backend.account.Account;
import com.orvendiq.backend.account.AccountRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class InsufficientFundsIntegrationTest {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransferService transferService;

    @Test
    void transferMustRejectInsufficientFunds() {

        String suffix = UUID.randomUUID()
                .toString().replace("-", "").substring(0, 12);

        Account sender = accountRepository.saveAndFlush(
                new Account("S" + suffix, "Test Sender")
        );

        Account receiver = accountRepository.saveAndFlush(
                new Account("R" + suffix, "Test Receiver")
        );

        String reference = "TEST-INSUFFICIENT-" + suffix;

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> transferService.transfer(
                        sender.getAccountNumber(),
                        receiver.getAccountNumber(),
                        new BigDecimal("500000.00"),
                        reference
                )
        );

        assertEquals("Insufficient funds", exception.getMessage());
    }
}