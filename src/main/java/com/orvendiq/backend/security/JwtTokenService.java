package com.orvendiq.backend.security;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

    private static final String ISSUER = "orvendiq";
    private static final Duration TOKEN_LIFETIME =
            Duration.ofMinutes(15);

    private final JwtEncoder jwtEncoder;

    public JwtTokenService(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    public String generateAccessToken(String username) {

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException(
                "Username is required"
            );
        }

        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(username)
                .issuedAt(now)
                .expiresAt(now.plus(TOKEN_LIFETIME))
                .id(UUID.randomUUID().toString())
                .build();

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .type("JWT")
                .build();

        Jwt jwt = jwtEncoder.encode(
                JwtEncoderParameters.from(header, claims)
        );

        return jwt.getTokenValue();
    }

    public long getExpiresInSeconds() {
        return TOKEN_LIFETIME.toSeconds();
    }
}