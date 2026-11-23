package com.orvendiq.backend.transaction;

import java.util.List;

public record TransactionHistoryPage(
    List<TransactionHistoryResponse> items,
    int page,
    int size,
    long totalElements,
    long totalPages
) {}