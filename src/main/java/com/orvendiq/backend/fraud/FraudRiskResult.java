package com.orvendiq.backend.fraud;

import java.util.List;

public record FraudRiskResult(
    int score,
    String riskLevel,
    List<String> indicators
) {}