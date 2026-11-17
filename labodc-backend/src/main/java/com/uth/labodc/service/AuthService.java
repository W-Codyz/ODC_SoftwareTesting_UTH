package com.uth.labodc.service;

import com.uth.labodc.dto.auth.AuthResponse;
import com.uth.labodc.dto.auth.LoginRequest;
import com.uth.labodc.dto.auth.RegisterRequest;
import com.uth.labodc.exception.BadRequestException;
import com.uth.labodc.exception.ResourceNotFoundException;
import com.uth.labodc.model.entity.User;
import com.uth.labodc.model.enums.UserRole;
import com.uth.labodc.model.enums.UserStatus;
import com.uth.labodc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;
    private static final int ACCOUNT_LOCK_MINUTES = 30;
    
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

        if (request.getRole() == UserRole.TALENT
                && !request.getEmail().toLowerCase(Locale.ROOT).endsWith("@uth.edu.vn")) {
            throw new BadRequestException("Talent accounts must use an @uth.edu.vn email address");
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
    
    @Transactional(noRollbackFor = {BadCredentialsException.class, AccessDeniedException.class})
    public AuthResponse login(LoginRequest request) {
        Optional<User> userResult = userRepository.findByEmailAndDeletedAtIsNull(request.getEmail());
        User user = userResult.orElse(null);
        LocalDateTime now = LocalDateTime.now();

        if (user != null && user.getStatus() == UserStatus.LOCKED) {
            if (user.getLockedUntil() == null || now.isBefore(user.getLockedUntil())) {
                throw new AccessDeniedException("Tài khoản đã bị khóa");
            }

            user.setStatus(UserStatus.ACTIVE);
            user.setFailedLoginAttempts(0);
            user.setLockedUntil(null);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            if (user != null && user.getStatus() == UserStatus.ACTIVE) {
                int failedAttempts = user.getFailedLoginAttempts() == null
                        ? 1
                        : user.getFailedLoginAttempts() + 1;
                user.setFailedLoginAttempts(failedAttempts);

                if (failedAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
                    user.setStatus(UserStatus.LOCKED);
                    user.setLockedUntil(now.plusMinutes(ACCOUNT_LOCK_MINUTES));
                    userRepository.save(user);
                    throw new AccessDeniedException("Tài khoản đã bị khóa");
                }

                userRepository.save(user);
                log.warn("Failed login attempt for {}: count={}", user.getEmail(), failedAttempts);
            }

            throw ex;
        }

        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        if (user.getStatus() == UserStatus.PENDING) {
            throw new AccessDeniedException("Tài khoản chưa được kích hoạt");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BadRequestException("Account is not active. Status: " + user.getStatus());
        }
        
        // Update last login and reset failed login attempts
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
