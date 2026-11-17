package com.uth.labodc.exception;

import com.uth.labodc.dto.ApiResponse;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException ex) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(ex.getMessage()));
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid email or password"));
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiResponse<Void>> handleJwtException(JwtException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid or expired token"));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity
                .badRequest()
                .body(new ApiResponse<>(false, "Validation failed", errors));
    }
    
    // 400 khi thiếu request param bắt buộc (trước đây rơi vào handler Exception -> 500)
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParam(MissingServletRequestParameterException ex) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error("Thiếu tham số bắt buộc: " + ex.getParameterName()));
    }

    // 400 khi thiếu part bắt buộc trong multipart/form-data
    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingPart(MissingServletRequestPartException ex) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error("Thiếu tham số bắt buộc: " + ex.getRequestPartName()));
    }

    // 400 khi tham số sai kiểu dữ liệu (vd: projectId=abc)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error("Giá trị không hợp lệ cho tham số: " + ex.getName()));
    }

    // 415 khi Content-Type không được hỗ trợ (vd: gửi JSON vào endpoint multipart)
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException ex) {
        return ResponseEntity
                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(ApiResponse.error("Content-Type không được hỗ trợ: " + ex.getContentType()));
    }

    // 405 khi gọi sai HTTP method
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity
                .status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse.error("HTTP method không được hỗ trợ: " + ex.getMethod()));
    }

    // 400 khi file vượt giới hạn multipart của server (spring.servlet.multipart.max-file-size)
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error("Dung lượng file vượt quá giới hạn cho phép"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException ex) {
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.error(ex.getMessage()));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        ex.printStackTrace();
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An error occurred: " + ex.getMessage()));
    }
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || authentication instanceof AnonymousAuthenticationToken
                || !authentication.isAuthenticated()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication required"));
        }
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied: You do not have permission to perform this action"));
    }
    // Xử lý mã 409 Conflict khi trạng thái dữ liệu xung đột (không ở trạng thái PENDING)
    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiResponse<Void>> handleConflict(ConflictException ex) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(ex.getMessage()));
    }
}
