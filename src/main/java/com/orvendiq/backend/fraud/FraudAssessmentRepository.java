package com.orvendiq.backend.fraud;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FraudAssessmentRepository
        extends JpaRepository<FraudAssessment, Long> {

    Optional<FraudAssessment> findByTransactionId(Long transactionId);

    boolean existsByTransactionId(Long transactionId);
}