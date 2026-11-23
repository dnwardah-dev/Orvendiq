package com.orvendiq.backend.fraud;

import com.orvendiq.backend.security.AccountOwnershipService;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fraud/assessments")
public class FraudAssessmentController {

    private final FraudAssessmentRepository repository;
    private final AccountOwnershipService ownershipService;
    private final JdbcTemplate jdbcTemplate;

    public FraudAssessmentController(
            FraudAssessmentRepository repository,
            AccountOwnershipService ownershipService,
            JdbcTemplate jdbcTemplate) {
        this.repository = repository;
        this.ownershipService = ownershipService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/{transactionId}")
    public FraudAssessmentResponse getAssessment(
            @PathVariable Long transactionId,
            @AuthenticationPrincipal Jwt jwt) {

        if (jwt == null || jwt.getSubject() == null) {
            throw new AccessDeniedException(
                "Authentication required"
            );
        }

        if (transactionId == null || transactionId <= 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Invalid transaction ID"
            );
        }

        String sql = """
            SELECT a.ACCOUNT_NUMBER
            FROM TRANSACTIONS t
            JOIN ACCOUNTS a
              ON a.ACCOUNT_ID = t.FROM_ACCOUNT_ID
            WHERE t.TRANSACTION_ID = ?
            """;

        List<String> accounts = jdbcTemplate.query(
            sql,
            (rs, rowNum) -> rs.getString(1),
            transactionId
        );

        if (accounts.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Transaction not found"
            );
        }

        ownershipService.requireOwnership(
            jwt.getSubject(),
            accounts.get(0)
        );

        FraudAssessment assessment = repository
            .findByTransactionId(transactionId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Fraud assessment not found"
            ));

        return FraudAssessmentResponse.from(assessment);
    }
}