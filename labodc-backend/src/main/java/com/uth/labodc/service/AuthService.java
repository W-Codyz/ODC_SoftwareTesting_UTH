package com.uth.labodc.service;

import com.uth.labodc.dto.auth.AuthResponse;
import com.uth.labodc.dto.auth.LoginRequest;
import com.uth.labodc.dto.auth.RegisterRequest;
import com.uth.labodc.exception.BadRequestException;
import com.uth.labodc.exception.ResourceNotFoundException;
import com.uth.labodc.model.entity.User;
import com.uth.labodc.model.enums.UserStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import com.uth.labodc.model.enums.UserRole;
import com.uth.labodc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        
        // Validate password complexity
        String password = request.getPassword();
        if (password.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new BadRequestException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new BadRequestException("Password must contain at least one lowercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new BadRequestException("Password must contain at least one digit");
        }
        if (!password.matches(".*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*")) {
            throw new BadRequestException("Password must contain at least one special character");
        }

        // Validate talent email domain
        if (request.getRole() == UserRole.TALENT) {
            String email = request.getEmail().toLowerCase();
            if (!email.endsWith("@uth.edu.vn") && !email.contains("@student.uth.edu.vn") && !email.endsWith(".uth.edu.vn")) {
                throw new BadRequestException("Talent email must belong to uth.edu.vn domain");
            }
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        
        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStatus(UserStatus.ACTIVE); // Auto-activate for demo
        user.setEmailVerified(true); // Auto-verify for demo
        user.setEmailVerifiedAt(LocalDateTime.now());
        
        user = userRepository.save(user);
        
        log.info("User registered successfully: {}", user.getEmail());
        
        return buildAuthResponse(user);
    }
    
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Check user status before authentication to protect locked accounts
        User user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail()).orElse(null);

        if (user != null) {
            if (user.getStatus() == UserStatus.LOCKED) {
                // Check auto-unlock after 30 minutes
                if (user.getLockedUntil() != null && LocalDateTime.now().isAfter(user.getLockedUntil())) {
                    user.setStatus(UserStatus.ACTIVE);
                    user.setFailedLoginAttempts(0);
                    user.setLockedUntil(null);
                    userRepository.save(user);
                } else {
                    throw new AccessDeniedException("Account is locked. Please try again later.");
                }
            } else if (user.getStatus() != UserStatus.ACTIVE) {
                throw new AccessDeniedException("Account is not active. Status: " + user.getStatus());
            }
        }

        try {
            // Authenticate user credentials
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            if (user != null) {
                int attempts = (user.getFailedLoginAttempts() != null ? user.getFailedLoginAttempts() : 0) + 1;
                user.setFailedLoginAttempts(attempts);
                if (attempts >= 5) {
                    user.setStatus(UserStatus.LOCKED);
                    user.setLockedUntil(LocalDateTime.now().plusMinutes(30));
                }
                userRepository.save(user);
            }
            throw ex;
        }

        if (user == null) {
            user = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        
        // Update last login and reset attempts
        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);
        
        log.info("User logged in successfully: {}", user.getEmail());
        
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .emailVerified(user.getEmailVerified())
                .build();
    }
}
