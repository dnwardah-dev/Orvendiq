package com.orvendiq.backend.transaction;

import com.orvendiq.backend.account.Account;
import com.orvendiq.backend.account.AccountRepository;
import com.orvendiq.backend.funding.FundingService;
import com.orvendiq.backend.ledger.LedgerRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ConcurrencyIntegrationTest {

    @Autowired AccountRepository accounts;
    @Autowired FundingService funding;
    @Autowired TransferService transfers;
    @Autowired LedgerRepository ledger;
    @Autowired JdbcTemplate jdbc;
    @Autowired TransactionTemplate transactionTemplate;

    @Test
    void concurrentTransfersMustPreventDoubleSpending() throws Exception {

        String suffix = UUID.randomUUID()
                .toString().replace("-", "").substring(0, 12);

        Account sender = accounts.saveAndFlush(
                new Account("S" + suffix, "Concurrency Sender"));

        Account receiverA = null;
        Account receiverB = null;

        ExecutorService pool = Executors.newFixedThreadPool(2);

        try {
            receiverA = accounts.saveAndFlush(
                    new Account("A" + suffix, "Receiver A"));

            receiverB = accounts.saveAndFlush(
                    new Account("B" + suffix, "Receiver B"));

            funding.fundAccount(
                    sender.getAccountNumber(),
                    new BigDecimal("1000000.00")
            );

            BigDecimal amount = new BigDecimal("800000.00");

            String senderNumber = sender.getAccountNumber();
            String receiverANumber = receiverA.getAccountNumber();
            String receiverBNumber = receiverB.getAccountNumber();

            CountDownLatch start = new CountDownLatch(1);

            Callable<Boolean> taskA = () -> {
                start.await();
                return attemptTransfer(
                        senderNumber, receiverANumber, amount,
                        "CONC-A-" + suffix);
            };

            Callable<Boolean> taskB = () -> {
                start.await();
                return attemptTransfer(
                        senderNumber, receiverBNumber, amount,
                        "CONC-B-" + suffix);
            };

            Future<Boolean> resultA = pool.submit(taskA);
            Future<Boolean> resultB = pool.submit(taskB);

            start.countDown();

            boolean successA = resultA.get(30, TimeUnit.SECONDS);
            boolean successB = resultB.get(30, TimeUnit.SECONDS);

            assertEquals(1,
                    (successA ? 1 : 0) + (successB ? 1 : 0),
                    "Exactly one transfer must succeed");

            BigDecimal senderBalance =
                    ledger.calculateBalance(sender.getAccountId());

            assertEquals(0, senderBalance.compareTo(
                    new BigDecimal("200000.00")));

            BigDecimal balanceA =
                    ledger.calculateBalance(receiverA.getAccountId());

            BigDecimal balanceB =
                    ledger.calculateBalance(receiverB.getAccountId());

            assertEquals(0, balanceA.add(balanceB)
                    .compareTo(amount));

        } finally {
            pool.shutdown();
            pool.awaitTermination(60, TimeUnit.SECONDS);

            final Long senderId = sender.getAccountId();
            final Long aId = receiverA == null
                    ? null : receiverA.getAccountId();
            final Long bId = receiverB == null
                    ? null : receiverB.getAccountId();

            if (pool.isTerminated()) {
                transactionTemplate.executeWithoutResult(status -> {
                    Long[] ids = {senderId, aId, bId};

                    for (Long id : ids) {
                        if (id == null) continue;

                        jdbc.update("""
                            DELETE FROM ledger_entries
                            WHERE transaction_id IN (
                                SELECT transaction_id FROM transactions
                                WHERE from_account_id = ?
                                   OR to_account_id = ?
                            )
                            """, id, id);
                    }

                    for (Long id : ids) {
                        if (id == null) continue;

                        jdbc.update("""
                            DELETE FROM transactions
                            WHERE from_account_id = ?
                               OR to_account_id = ?
                            """, id, id);
                    }

                    for (Long id : ids) {
                        if (id != null) {
                            jdbc.update(
                                "DELETE FROM accounts WHERE account_id = ?",
                                id);
                        }
                    }
                });
            }
        }
    }

    private boolean attemptTransfer(
            String from, String to,
            BigDecimal amount, String reference) {

        try {
            transfers.transfer(from, to, amount, reference);
            return true;
        } catch (IllegalStateException ex) {
            if ("Insufficient funds".equals(ex.getMessage())) {
                return false;
            }
            throw ex;
        }
    }
}