package com.orvendiq.backend.auth;

import com.orvendiq.backend.security.JwtTokenService;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthenticationService {

    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthenticationService(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    public String login(String username, String password) {

        if (username == null || password == null) {
            throw new BadCredentialsException(
                "Invalid username or password"
            );
        }

        String normalizedUsername =
                username.trim().toLowerCase(Locale.ROOT);

        UserDetails user;

        try {
            user = userDetailsService.loadUserByUsername(
                normalizedUsername
            );
        } catch (UsernameNotFoundException ex) {
            throw new BadCredentialsException(
                "Invalid username or password"
            );
        }

        if (!user.isEnabled()
                || !user.isAccountNonLocked()
                || !user.isAccountNonExpired()
                || !user.isCredentialsNonExpired()) {
            throw new BadCredentialsException(
                "Invalid username or password"
            );
        }

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {
            throw new BadCredentialsException(
                "Invalid username or password"
            );
        }

        return jwtTokenService.generateAccessToken(
            user.getUsername()
        );
    }
}