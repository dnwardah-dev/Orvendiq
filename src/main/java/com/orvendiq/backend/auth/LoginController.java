package com.orvendiq.backend.auth;

import com.orvendiq.backend.security.JwtTokenService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class LoginController {

    private final AuthenticationService authenticationService;
    private final JwtTokenService jwtTokenService;

    public LoginController(
            AuthenticationService authenticationService,
            JwtTokenService jwtTokenService) {
        this.authenticationService = authenticationService;
        this.jwtTokenService = jwtTokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request) {

        try {
            String token = authenticationService.login(
                request.username(),
                request.password()
            );

            return ResponseEntity.ok(
                new LoginResponse(
                    token,
                    "Bearer",
                    jwtTokenService.getExpiresInSeconds()
                )
            );

        } catch (BadCredentialsException ex) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new LoginError(
                    "Invalid username or password"
                ));
        }
    }

    private record LoginError(String message) {}
}