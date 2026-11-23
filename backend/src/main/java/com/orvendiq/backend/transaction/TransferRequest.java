package com.orvendiq.backend.transaction;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record TransferRequest(

    @NotBlank
    String fromAccount,

    @NotBlank
    String toAccount,

    @NotNull
    @DecimalMin("0.01")
    @Digits(integer = 17, fraction = 2)
    BigDecimal amount,

    @NotBlank
    @Size(max = 50)
    String reference

) {}