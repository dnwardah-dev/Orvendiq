package com.orvendiq.backend.security;

import com.orvendiq.backend.auth.AppUser;
import com.orvendiq.backend.auth.UserRepository;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        AppUser appUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User not found"
                ));

        String[] authorities = appUser.getRoles()
                .stream()
                .map(role -> "ROLE_" + role.getRoleName())
                .toArray(String[]::new);

        return User.withUsername(appUser.getUsername())
                .password(appUser.getPasswordHash())
                .authorities(authorities)
                .disabled(!"ACTIVE".equals(appUser.getStatus()))
                .accountLocked("LOCKED".equals(appUser.getStatus()))
                .build();
    }
}