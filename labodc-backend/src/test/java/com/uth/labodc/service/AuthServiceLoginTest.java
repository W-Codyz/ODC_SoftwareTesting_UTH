package com.uth.labodc.service;

import com.uth.labodc.dto.auth.LoginRequest;
import com.uth.labodc.exception.AccountStateException;
import com.uth.labodc.model.entity.User;
import com.uth.labodc.model.enums.UserRole;
import com.uth.labodc.model.enums.UserStatus;
import com.uth.labodc.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceLoginTest {

    private static final String EMAIL = "testlogin@labodc.com";

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private AuthService authService;

    @Test
    void incrementsFailedLoginAttempts() {
        User user = activeUser(0);
        when(userRepository.findByEmailAndDeletedAtIsNull(EMAIL)).thenReturn(Optional.of(user));
        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        assertThrows(
                BadCredentialsException.class,
                () -> authService.login(new LoginRequest(EMAIL, "WrongPassword!"))
        );

        assertEquals(1, user.getFailedLoginAttempts());
        assertEquals(UserStatus.ACTIVE, user.getStatus());
        verify(userRepository).save(user);
    }

    @Test
    void locksAccountAfterFifthFailedLoginAndSetsThirtyMinuteExpiry() {
        User user = activeUser(4);
        when(userRepository.findByEmailAndDeletedAtIsNull(EMAIL)).thenReturn(Optional.of(user));
        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());
        LocalDateTime beforeLogin = LocalDateTime.now().minusSeconds(1);

        AccountStateException exception = assertThrows(
                AccountStateException.class,
                () -> authService.login(new LoginRequest(EMAIL, "WrongPassword!"))
        );

        assertEquals("Tài khoản đã bị khóa", exception.getMessage());
        assertEquals(5, user.getFailedLoginAttempts());
        assertEquals(UserStatus.LOCKED, user.getStatus());
        assertNotNull(user.getLockedUntil());
        assertTrue(
                !user.getLockedUntil().isBefore(beforeLogin.plusMinutes(30))
                        && !user.getLockedUntil().isAfter(LocalDateTime.now().plusMinutes(30))
        );
        verify(userRepository).save(user);
    }

    @Test
    void rejectsLockedAccountBeforeCheckingPassword() {
        User user = activeUser(5);
        user.setStatus(UserStatus.LOCKED);
        user.setLockedUntil(LocalDateTime.now().plusMinutes(10));
        when(userRepository.findByEmailAndDeletedAtIsNull(EMAIL)).thenReturn(Optional.of(user));

        AccountStateException exception = assertThrows(
                AccountStateException.class,
                () -> authService.login(new LoginRequest(EMAIL, "AnyPassword!"))
        );

        assertEquals("Tài khoản đã bị khóa", exception.getMessage());
        verify(authenticationManager, never()).authenticate(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void successfulLoginResetsFailedAttempts() {
        User user = activeUser(4);
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(EMAIL)
                .password("encoded")
                .authorities("ROLE_TALENT")
                .build();
        when(userRepository.findByEmailAndDeletedAtIsNull(EMAIL)).thenReturn(Optional.of(user));
        when(userDetailsService.loadUserByUsername(EMAIL)).thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(userDetails)).thenReturn("refresh-token");

        authService.login(new LoginRequest(EMAIL, "CorrectPassword!"));

        assertEquals(0, user.getFailedLoginAttempts());
        assertNull(user.getLockedUntil());
        assertNotNull(user.getLastLoginAt());
        verify(userRepository).save(user);
    }

    @Test
    void unlocksExpiredAccountAndResetsFailureCountAfterSuccessfulLogin() {
        User user = activeUser(5);
        user.setStatus(UserStatus.LOCKED);
        user.setLockedUntil(LocalDateTime.now().minusSeconds(1));
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(EMAIL)
                .password("encoded")
                .authorities("ROLE_TALENT")
                .build();
        when(userRepository.findByEmailAndDeletedAtIsNull(EMAIL)).thenReturn(Optional.of(user));
        when(userDetailsService.loadUserByUsername(EMAIL)).thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(userDetails)).thenReturn("refresh-token");

        authService.login(new LoginRequest(EMAIL, "CorrectPassword!"));

        assertEquals(UserStatus.ACTIVE, user.getStatus());
        assertEquals(0, user.getFailedLoginAttempts());
        assertNull(user.getLockedUntil());
        assertNotNull(user.getLastLoginAt());
        InOrder callOrder = inOrder(userRepository, authenticationManager);
        callOrder.verify(userRepository).save(user);
        callOrder.verify(authenticationManager).authenticate(any());
        callOrder.verify(userRepository).save(user);
    }

    @Test
    void returnsForbiddenForInactiveAccount() {
        User user = activeUser(0);
        user.setStatus(UserStatus.PENDING);
        when(userRepository.findByEmailAndDeletedAtIsNull(EMAIL)).thenReturn(Optional.of(user));

        AccountStateException exception = assertThrows(
                AccountStateException.class,
                () -> authService.login(new LoginRequest(EMAIL, "CorrectPassword!"))
        );

        assertEquals("Tài khoản chưa kích hoạt", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void missingAccountRemainsAnAuthenticationFailure() {
        when(userRepository.findByEmailAndDeletedAtIsNull(EMAIL)).thenReturn(Optional.empty());
        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        assertThrows(
                BadCredentialsException.class,
                () -> authService.login(new LoginRequest(EMAIL, "AnyPassword!"))
        );

        verify(userRepository, never()).save(any());
    }

    private User activeUser(int failedAttempts) {
        User user = new User();
        user.setId(1L);
        user.setEmail(EMAIL);
        user.setPasswordHash("encoded");
        user.setRole(UserRole.TALENT);
        user.setStatus(UserStatus.ACTIVE);
        user.setFailedLoginAttempts(failedAttempts);
        return user;
    }
}
