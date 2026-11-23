package com.orvendiq.backend.auth;

import java.util.Locale;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProvisioningService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProvisioningService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AppUser createUser(
            String username,
            String rawPassword,
            String fullName) {

        if (username == null || rawPassword == null
                || fullName == null) {
            throw new IllegalArgumentException(
                "Required user fields are missing"
            );
        }

        String normalizedUsername =
                username.trim().toLowerCase(Locale.ROOT);
        String normalizedName = fullName.trim();

        if (!normalizedUsername.matches("[a-z0-9._-]{3,50}")) {
            throw new IllegalArgumentException(
                "Invalid username"
            );
        }

        if (rawPassword.length() < 12 ||
                rawPassword.length() > 128) {
            throw new IllegalArgumentException(
                "Password must contain 12 to 128 characters"
            );
        }

        if (normalizedName.isEmpty() ||
                normalizedName.length() > 100) {
            throw new IllegalArgumentException(
                "Invalid full name"
            );
        }

        if (userRepository.existsByUsername(normalizedUsername)) {
            throw new IllegalArgumentException(
                "Username already exists"
            );
        }

        Role userRole = roleRepository.findByRoleName("USER")
            .orElseThrow(() -> new IllegalStateException(
                "USER role is not configured"
            ));

        AppUser user = new AppUser(
            normalizedUsername,
            passwordEncoder.encode(rawPassword),
            normalizedName
        );

        user.getRoles().add(userRole);

        return userRepository.save(user);
    }
}