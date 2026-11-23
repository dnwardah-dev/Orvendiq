package com.orvendiq.backend.transaction;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/transfers")
public class TransferController {

    private final AuthorizedTransferService transferService;

    public TransferController(
            AuthorizedTransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransferResponse createTransfer(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody TransferRequest request) {

        if (jwt == null || jwt.getSubject() == null) {
            throw new AccessDeniedException(
                "Authentication is required"
            );
        }

        Transaction tx = transferService.transfer(
            jwt.getSubject(),
            request.fromAccount(),
            request.toAccount(),
            request.amount(),
            request.reference()
        );

        return TransferResponse.from(tx);
    }
}