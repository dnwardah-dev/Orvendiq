package com.orvendiq.backend.account;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {

    private final AccountRepository repository;

    public AccountService(AccountRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Account createAccount(String accountNumber, String ownerName) {

        if (repository.existsByAccountNumber(accountNumber)) {
            throw new IllegalArgumentException("Account number already exists");
        }

        Account account = new Account(accountNumber, ownerName);

        return repository.save(account);
    }
}