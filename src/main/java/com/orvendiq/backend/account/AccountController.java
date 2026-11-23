package com.orvendiq.backend.account;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Account createAccount(@Valid @RequestBody CreateAccountRequest request) {

        return accountService.createAccount(
            request.accountNumber(),
            request.ownerName()
        );
    }
}