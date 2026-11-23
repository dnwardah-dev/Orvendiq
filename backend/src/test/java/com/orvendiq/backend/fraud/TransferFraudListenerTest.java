package com.orvendiq.backend.fraud;

import org.junit.jupiter.api.Test;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class TransferFraudListenerTest {

    @Test
    void assessmentFailureShouldNotPropagateToCaller() {

        FraudAssessmentService service =
            mock(FraudAssessmentService.class);

        PlatformTransactionManager manager =
            mock(PlatformTransactionManager.class);

        TransactionStatus txStatus = mock(TransactionStatus.class);

        when(manager.getTransaction(any(TransactionDefinition.class)))
            .thenReturn(txStatus);

        when(service.assessTransaction(99L))
            .thenThrow(new IllegalStateException("Simulated fraud failure"));

        TransferFraudListener listener =
            new TransferFraudListener(service, manager);

        assertDoesNotThrow(() ->
            listener.onTransferCompleted(
                new TransferCompletedEvent(99L)
            )
        );

        verify(service, times(1)).assessTransaction(99L);
        verify(manager, times(1)).rollback(eq(txStatus));
        verify(manager, never()).commit(any());
    }

    @Test
    void successfulAssessmentShouldCommitIndependentTransaction() {

        FraudAssessmentService service =
            mock(FraudAssessmentService.class);

        PlatformTransactionManager manager =
            mock(PlatformTransactionManager.class);

        TransactionStatus txStatus = mock(TransactionStatus.class);

        when(manager.getTransaction(any(TransactionDefinition.class)))
            .thenReturn(txStatus);

        FraudAssessment assessment = new FraudAssessment(
            100L,
            15,
            "LOW",
            "[\"NEW_RECIPIENT\"]"
        );

        when(service.assessTransaction(100L))
            .thenReturn(assessment);

        TransferFraudListener listener =
            new TransferFraudListener(service, manager);

        assertDoesNotThrow(() ->
            listener.onTransferCompleted(
                new TransferCompletedEvent(100L)
            )
        );

        verify(service, times(1)).assessTransaction(100L);
        verify(manager, times(1)).commit(eq(txStatus));
        verify(manager, never()).rollback(any());
    }
}