package com.orvendiq.backend.ledger;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface LedgerRepository
        extends JpaRepository<LedgerEntry, Long> {

    List<LedgerEntry> findByTransactionId(Long transactionId);

    List<LedgerEntry> findByAccountId(Long accountId);

    @Query("""
        SELECT COALESCE(
            SUM(
                CASE
                    WHEN l.entryType = 'CREDIT' THEN l.amount
                    ELSE -l.amount
                END
            ), 0
        )
        FROM LedgerEntry l
        WHERE l.accountId = :accountId
        """)
    BigDecimal calculateBalance(
        @Param("accountId") Long accountId
    );
}