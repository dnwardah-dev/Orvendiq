package com.orvendiq.backend.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AccountOwnershipIntegrationTest {

    @Autowired
    private AccountOwnershipService ownershipService;

    @Test
    void sendokShouldOwnHerAccount() {
        assertTrue(
            ownershipService.isOwner(
                "sendok.faiza",
                "ORV10000001"
            )
        );
    }

    @Test
    void sendokShouldNotOwnAriqAccount() {
        assertFalse(
            ownershipService.isOwner(
                "sendok.faiza",
                "ORV10000002"
            )
        );
    }

    @Test
    void unknownUserShouldBeRejected() {
        assertFalse(
            ownershipService.isOwner(
                "unknown.user",
                "ORV10000001"
            )
        );
    }

    @Test
    void missingUsernameShouldBeRejected() {
        assertFalse(
            ownershipService.isOwner(
                null,
                "ORV10000001"
            )
        );
    }
}