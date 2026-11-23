package com.orvendiq.backend.transaction;

import com.orvendiq.backend.security.AccountOwnershipService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class TransactionHistoryService {

    private final JdbcTemplate jdbc;
    private final AccountOwnershipService ownership;

    public TransactionHistoryService(
            JdbcTemplate jdbc,
            AccountOwnershipService ownership) {
        this.jdbc = jdbc;
        this.ownership = ownership;
    }

    @Transactional(readOnly = true)
    public TransactionHistoryPage findMyTransactions(
            String username, int page, int size) {

        if (username == null || username.isBlank()
                || !ownership.hasTransferRole(username)) {
            throw new AccessDeniedException(
                "Not authorized to access transaction history"
            );
        }

        if (page < 0 || size < 1 || size > 50) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "page must be >= 0 and size must be 1..50"
            );
        }

        List<Long> ids = jdbc.queryForList("""
            SELECT DISTINCT ua.ACCOUNT_ID
            FROM USER_ACCOUNTS ua
            JOIN USERS u ON u.USER_ID = ua.USER_ID
            WHERE u.USERNAME = ?
              AND u.STATUS = 'ACTIVE'
            """, Long.class, username);

        Set<Long> ownedAccountIds = new HashSet<>(ids);

        String scope = """
            FROM TRANSACTIONS t
            JOIN ACCOUNTS sender
              ON sender.ACCOUNT_ID = t.FROM_ACCOUNT_ID
            JOIN ACCOUNTS receiver
              ON receiver.ACCOUNT_ID = t.TO_ACCOUNT_ID
            WHERE EXISTS (
                SELECT 1
                FROM USER_ACCOUNTS ua
                JOIN USERS u ON u.USER_ID = ua.USER_ID
                WHERE u.USERNAME = ?
                  AND u.STATUS = 'ACTIVE'
                  AND ua.ACCOUNT_ID IN (
                      t.FROM_ACCOUNT_ID,
                      t.TO_ACCOUNT_ID
                  )
            )
            """;

        Long total = jdbc.queryForObject(
            "SELECT COUNT(*) " + scope,
            Long.class,
            username
        );

        long count = total == null ? 0 : total;
        long offset = (long) page * size;

        String sql = """
            SELECT
                t.TRANSACTION_ID,
                t.TRANSACTION_REF,
                t.FROM_ACCOUNT_ID,
                t.TO_ACCOUNT_ID,
                sender.ACCOUNT_NUMBER AS FROM_ACCOUNT_NUMBER,
                sender.OWNER_NAME AS FROM_ACCOUNT_NAME,
                receiver.ACCOUNT_NUMBER AS TO_ACCOUNT_NUMBER,
                receiver.OWNER_NAME AS TO_ACCOUNT_NAME,
                t.AMOUNT,
                t.CURRENCY_CODE,
                t.STATUS,
                t.TRANSACTION_TYPE,
                t.CREATED_AT,
                t.COMPLETED_AT
            """ + scope + """
            ORDER BY t.CREATED_AT DESC, t.TRANSACTION_ID DESC
            OFFSET ? ROWS FETCH NEXT ? ROWS ONLY
            """;

        List<TransactionHistoryResponse> items = jdbc.query(
            sql,
            (rs, rowNum) -> {
                long fromId = rs.getLong("FROM_ACCOUNT_ID");
                long toId = rs.getLong("TO_ACCOUNT_ID");

                boolean outgoing = ownedAccountIds.contains(fromId);
                boolean incoming = ownedAccountIds.contains(toId);

                String direction = outgoing && incoming
                    ? "INTERNAL"
                    : outgoing ? "OUTGOING" : "INCOMING";

                Timestamp completed = rs.getTimestamp("COMPLETED_AT");
                LocalDateTime completedAt = completed == null
                    ? null : completed.toLocalDateTime();

                return new TransactionHistoryResponse(
                    rs.getLong("TRANSACTION_ID"),
                    rs.getString("TRANSACTION_REF"),
                    rs.getString("FROM_ACCOUNT_NUMBER"),
                    rs.getString("FROM_ACCOUNT_NAME"),
                    rs.getString("TO_ACCOUNT_NUMBER"),
                    rs.getString("TO_ACCOUNT_NAME"),
                    rs.getBigDecimal("AMOUNT"),
                    rs.getString("CURRENCY_CODE"),
                    rs.getString("STATUS"),
                    rs.getString("TRANSACTION_TYPE"),
                    direction,
                    rs.getTimestamp("CREATED_AT").toLocalDateTime(),
                    completedAt
                );
            },
            username, offset, size
        );

        long totalPages = (count + size - 1) / size;

        return new TransactionHistoryPage(
            items, page, size, count, totalPages
        );
    }
}