package com.uth.labodc.exception;

import com.uth.labodc.dto.ApiResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler exceptionHandler = new GlobalExceptionHandler();

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void returnsForbiddenForLockedAccountEvenWhenLoginIsAnonymous() {
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleAccountState(
                new AccountStateException("Tài khoản đã bị khóa")
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Tài khoản đã bị khóa", response.getBody().getMessage());
    }

    @Test
    void returnsForbiddenForPendingAccountEvenWhenLoginIsAnonymous() {
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleAccountState(
                new AccountStateException("Tài khoản chưa kích hoạt")
        );

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Tài khoản chưa kích hoạt", response.getBody().getMessage());
    }
}
