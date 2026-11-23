package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class Transaction43DiagnosticTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private com.orvendiq.backend.security.AccountOwnershipService ownershipService;

    @Test
    void inspectAiraOwnership() {
        String username = "aira.faiza";
        String account = "ORV10000001";

        boolean role = ownershipService.hasTransferRole(username);
        boolean owner = ownershipService.isOwner(username, account);

        System.out.println(
            "OWNERSHIP_DIAGNOSTIC"
            + " | TRANSFER_ROLE=" + role
            + " | IS_OWNER=" + owner
        );

        org.junit.jupiter.api.Assertions.assertTrue(
            role,
            "Aira must have transfer role"
        );

        org.junit.jupiter.api.Assertions.assertTrue(
            owner,
            "Aira must own the source account"
        );
    }

    @Test
    void inspectTransaction43() {

        String sql = """
            SELECT
                t.TRANSACTION_ID,
                sender.ACCOUNT_NUMBER AS SENDER,
                receiver.ACCOUNT_NUMBER AS RECIPIENT,
                t.STATUS
            FROM TRANSACTIONS t
            JOIN ACCOUNTS sender
                ON sender.ACCOUNT_ID = t.FROM_ACCOUNT_ID
            JOIN ACCOUNTS receiver
                ON receiver.ACCOUNT_ID = t.TO_ACCOUNT_ID
            WHERE t.TRANSACTION_ID = ?
            """;

        jdbcTemplate.query(
            sql,
            rs -> {
                System.out.println(
                    "TRANSACTION_ID=" + rs.getLong("TRANSACTION_ID")
                    + " | SENDER=" + rs.getString("SENDER")
                    + " | RECIPIENT=" + rs.getString("RECIPIENT")
                    + " | STATUS=" + rs.getString("STATUS")
                );
            },
            43L
        );
    }
}