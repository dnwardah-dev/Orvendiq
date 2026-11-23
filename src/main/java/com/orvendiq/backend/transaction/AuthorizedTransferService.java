package com.orvendiq.backend.transaction;

import com.orvendiq.backend.security.AccountOwnershipService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AuthorizedTransferService {

    private final AccountOwnershipService ownershipService;
    private final TransferService transferService;

    public AuthorizedTransferService(
            AccountOwnershipService ownershipService,
            TransferService transferService) {

        this.ownershipService = ownershipService;
        this.transferService = transferService;
    }

    @Transactional
    public Transaction transfer(
            String authenticatedUsername,
            String fromAccount,
            String toAccount,
            BigDecimal amount,
            String reference) {

        ownershipService.requireOwnership(
            authenticatedUsername,
            fromAccount
        );

        return transferService.transfer(
            fromAccount,
            toAccount,
            amount,
            reference
        );
    }
}