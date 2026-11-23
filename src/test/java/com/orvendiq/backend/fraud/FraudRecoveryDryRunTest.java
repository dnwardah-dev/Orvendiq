package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional(readOnly = true)
class FraudRecoveryDryRunTest {

    @Autowired
    private FraudRecoveryService recoveryService;

    @Test
    void shouldFindMissingAssessmentsWithoutWriting() {

        List<Long> missing =
            recoveryService.findMissingAssessments(20);

        assertNotNull(missing);
        assertTrue(missing.size() <= 20);
        assertEquals(
            missing.stream().distinct().count(),
            missing.size(),
            "Scanner should not return duplicate IDs"
        );

        System.out.println(
            "FRAUD_RECOVERY_DRY_RUN"
            + " | MISSING_COUNT=" + missing.size()
            + " | TRANSACTION_IDS=" + missing
        );
    }

    @Test
    void shouldRejectInvalidLimits() {
        assertThrows(
            IllegalArgumentException.class,
            () -> recoveryService.findMissingAssessments(0)
        );

        assertThrows(
            IllegalArgumentException.class,
            () -> recoveryService.findMissingAssessments(101)
        );
    }
}