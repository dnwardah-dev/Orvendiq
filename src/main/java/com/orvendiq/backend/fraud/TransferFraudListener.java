package com.orvendiq.backend.fraud;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.support.TransactionTemplate;

@Component
public class TransferFraudListener {

    private static final Logger log =
        LoggerFactory.getLogger(TransferFraudListener.class);

    private final FraudAssessmentService assessmentService;
    private final TransactionTemplate transactionTemplate;

    public TransferFraudListener(
            FraudAssessmentService assessmentService,
            PlatformTransactionManager transactionManager) {

        this.assessmentService = assessmentService;

        this.transactionTemplate =
            new TransactionTemplate(transactionManager);

        this.transactionTemplate.setPropagationBehavior(
            TransactionDefinition.PROPAGATION_REQUIRES_NEW
        );
    }

    @TransactionalEventListener(
        phase = TransactionPhase.AFTER_COMMIT
    )
    public void onTransferCompleted(TransferCompletedEvent event) {

        Long transactionId = event.transactionId();

        try {
            FraudAssessment assessment = transactionTemplate.execute(
                status -> assessmentService.assessTransaction(
                    transactionId
                )
            );

            if (assessment == null) {
                throw new IllegalStateException(
                    "Fraud assessment returned no result"
                );
            }

            log.info(
                "Fraud assessment completed for transaction {}",
                transactionId
            );

        } catch (Exception exception) {

            // Transfer has already committed.
            // Do not propagate assessment errors to the transfer response.
            log.error(
                "Fraud assessment failed for transaction {}: {}",
                transactionId,
                exception.getClass().getSimpleName()
            );
        }
    }
}