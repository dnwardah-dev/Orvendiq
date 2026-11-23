package com.orvendiq.backend.account;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAccountRequest(

    @NotBlank
    @Size(min = 8, max = 20)
    String accountNumber,

    @NotBlank
    @Size(max = 100)
    String ownerName

) {}