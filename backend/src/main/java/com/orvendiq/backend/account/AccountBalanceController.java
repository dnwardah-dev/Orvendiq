package com.orvendiq.backend.account;

import com.orvendiq.backend.ledger.LedgerRepository;
import com.orvendiq.backend.security.AccountOwnershipService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountBalanceController {

    private final AccountRepository accountRepository;
    private final LedgerRepository ledgerRepository;
    private final AccountOwnershipService ownershipService;

    public AccountBalanceController(
            AccountRepository accountRepository,
            LedgerRepository ledgerRepository,
            AccountOwnershipService ownershipService) {

        this.accountRepository = accountRepository;
        this.ledgerRepository = ledgerRepository;
        this.ownershipService = ownershipService;
    }

    public record BalanceResponse(
        String accountNumber,
        String ownerName,
        String currency,
        BigDecimal balance
    ) {}

    @GetMapping("/{accountNumber}/balance")
    @Transactional(readOnly = true)
    public BalanceResponse getBalance(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String accountNumber) {

        if (jwt == null || jwt.getSubject() == null) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authentication required"
            );
        }

        // Check ownership before disclosing account details.
        ownershipService.requireOwnership(
            jwt.getSubject(),
            accountNumber
        );

        Account account = accountRepository
            .findByAccountNumber(accountNumber)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Account not found"
            ));

        BigDecimal balance = ledgerRepository
            .calculateBalance(account.getAccountId());

        if (balance == null) {
            balance = BigDecimal.ZERO;
        }

        return new BalanceResponse(
            account.getAccountNumber(),
            account.getOwnerName(),
            account.getCurrencyCode(),
            balance
        );
    }
}