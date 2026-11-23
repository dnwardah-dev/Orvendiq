package com.orvendiq.backend.transaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByTransactionRef(String transactionRef);

    boolean existsByTransactionRef(String transactionRef);

    List<Transaction> findByFromAccountIdOrToAccountId(
        Long fromAccountId,
        Long toAccountId
    );

    Page<Transaction> findByFromAccountIdOrToAccountId(
        Long fromAccountId,
        Long toAccountId,
        Pageable pageable
    );
}