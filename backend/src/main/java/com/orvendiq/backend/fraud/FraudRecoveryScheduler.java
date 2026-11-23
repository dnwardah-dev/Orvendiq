package com.orvendiq.backend.fraud;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FraudRecoveryScheduler {

    private static final Logger log =
        LoggerFactory.getLogger(FraudRecoveryScheduler.class);

    private final FraudRecoveryService recoveryService;
    private final FraudAssessmentService assessmentService;

    public FraudRecoveryScheduler(
            FraudRecoveryService recoveryService,
            FraudAssessmentService assessmentService) {

        this.recoveryService = recoveryService;
        this.assessmentService = assessmentService;
    }

    @Scheduled(fixedDelay = 300000, initialDelay = 30000)
    public void recoverMissingAssessments() {

        List<Long> missing;

        try {
            missing = recoveryService.findMissingAssessments(20);
        } catch (Exception ex) {
            log.error("Fraud recovery scan failed", ex);
            return;
        }

        if (missing.isEmpty()) {
            log.debug("Fraud recovery: no missing assessments");
            return;
        }

        log.info(
            "Fraud recovery started: {} missing assessments",
            missing.size()
        );

        for (Long transactionId : missing) {
            try {
                assessmentService.assessTransaction(transactionId);

                log.info(
                    "Fraud assessment recovered: transactionId={}",
                    transactionId
                );
            } catch (Exception ex) {
                log.error(
                    "Fraud recovery failed: transactionId={}",
                    transactionId,
                    ex
                );
            }
        }
    }
}