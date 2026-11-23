package com.orvendiq.backend.transaction;

import com.orvendiq.backend.security.AccountOwnershipService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthorizedTransferServiceTest {

    @Mock
    private AccountOwnershipService ownershipService;

    @Mock
    private TransferService transferService;

    @InjectMocks
    private AuthorizedTransferService authorizedTransferService;

    private BigDecimal amount;

    @BeforeEach
    void setUp() {
        amount = new BigDecimal("1000.00");
    }

    @Test
    void shouldRejectTransferFromAnotherUsersAccount() {

        doThrow(new AccessDeniedException("Not account owner"))
            .when(ownershipService)
            .requireOwnership("sendok.faiza", "ORV10000002");

        assertThrows(
            AccessDeniedException.class,
            () -> authorizedTransferService.transfer(
                "sendok.faiza",
                "ORV10000002",
                "ORV10000003",
                amount,
                "OWNERSHIP-TEST-001"
            )
        );

        verifyNoInteractions(transferService);
    }

    @Test
    void shouldDelegateTransferWhenOwnershipVerified() {

        authorizedTransferService.transfer(
            "sendok.faiza",
            "ORV10000001",
            "ORV10000002",
            amount,
            "OWNERSHIP-TEST-002"
        );

        verify(ownershipService).requireOwnership(
            "sendok.faiza",
            "ORV10000001"
        );

        verify(transferService).transfer(
            "ORV10000001",
            "ORV10000002",
            amount,
            "OWNERSHIP-TEST-002"
        );
    }

    @Test
    void shouldRejectTransferWithoutUsername() {

        doThrow(new AccessDeniedException("Authentication required"))
            .when(ownershipService)
            .requireOwnership(null, "ORV10000001");

        assertThrows(
            AccessDeniedException.class,
            () -> authorizedTransferService.transfer(
                null,
                "ORV10000001",
                "ORV10000002",
                amount,
                "OWNERSHIP-TEST-003"
            )
        );

        verifyNoInteractions(transferService);
    }
}