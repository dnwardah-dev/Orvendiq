package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import static org.mockito.Mockito.*;

@SpringBootTest
class TransferFraudRollbackTest {

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @MockitoBean
    private FraudAssessmentService assessmentService;

    @Test
    void rolledBackTransferMustNotTriggerFraudAssessment() {

        TransactionTemplate template =
            new TransactionTemplate(transactionManager);

        template.executeWithoutResult(status -> {
            eventPublisher.publishEvent(
                new TransferCompletedEvent(999999L)
            );

            status.setRollbackOnly();
        });

        verifyNoInteractions(assessmentService);

        System.out.println(
            "FRAUD_ROLLBACK_PASS | ASSESSMENT_NOT_TRIGGERED"
        );
    }
}