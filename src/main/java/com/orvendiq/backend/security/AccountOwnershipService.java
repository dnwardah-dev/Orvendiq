package com.orvendiq.backend.security;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountOwnershipService {

    private final JdbcTemplate jdbcTemplate;

    public AccountOwnershipService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public boolean isOwner(String username, String accountNumber) {

        if (username == null || username.isBlank()
                || accountNumber == null || accountNumber.isBlank()) {
            return false;
        }

        String sql = """
            SELECT COUNT(*)
            FROM USER_ACCOUNTS ua
            JOIN USERS u ON u.USER_ID = ua.USER_ID
            JOIN ACCOUNTS a ON a.ACCOUNT_ID = ua.ACCOUNT_ID
            WHERE u.USERNAME = ?
              AND u.STATUS = 'ACTIVE'
              AND a.ACCOUNT_NUMBER = ?
            """;

        Long count = jdbcTemplate.queryForObject(
            sql,
            Long.class,
            username,
            accountNumber
        );

        return count != null && count > 0;
    }

    @Transactional(readOnly = true)
    public boolean hasTransferRole(String username) {

        if (username == null || username.isBlank()) {
            return false;
        }

        String sql = """
            SELECT COUNT(*)
            FROM USERS u
            JOIN USER_ROLES ur ON ur.USER_ID = u.USER_ID
            JOIN ROLES r ON r.ROLE_ID = ur.ROLE_ID
            WHERE u.USERNAME = ?
              AND u.STATUS = 'ACTIVE'
              AND r.ROLE_NAME = 'USER'
            """;

        Long count = jdbcTemplate.queryForObject(
            sql,
            Long.class,
            username
        );

        return count != null && count > 0;
    }

    public void requireOwnership(
            String username,
            String accountNumber) {

        if (!hasTransferRole(username)) {
            throw new AccessDeniedException(
                "User is not authorized to transfer funds"
            );
        }

        if (!isOwner(username, accountNumber)) {
            throw new AccessDeniedException(
                "You are not authorized to use this account"
            );
        }
    }
}