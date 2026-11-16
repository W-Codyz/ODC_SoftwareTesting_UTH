package com.uth.labodc.service;

import com.uth.labodc.dto.auth.RegisterRequest;
import com.uth.labodc.exception.BadRequestException;
import com.uth.labodc.model.enums.UserRole;
import com.uth.labodc.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceRegistrationTest {

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
    void rejectsTalentRegistrationWithNonUthEmailDomain() {
        RegisterRequest request = new RegisterRequest(
                "talent@gmail.com",
                "SecurePass123!",
                "SecurePass123!",
                UserRole.TALENT
        );

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> authService.register(request)
        );

        assertEquals("Talent accounts must use an @uth.edu.vn email address", exception.getMessage());
        verifyNoInteractions(userRepository);
    }

    @Test
    void appliesTalentDomainRestrictionOnlyToTalentRole() {
        RegisterRequest request = new RegisterRequest(
                "mentor@gmail.com",
                "SecurePass123!",
                "SecurePass123!",
                UserRole.MENTOR
        );
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> authService.register(request)
        );

        assertEquals("Email already registered", exception.getMessage());
        verify(userRepository).existsByEmail(request.getEmail());
    }
}
