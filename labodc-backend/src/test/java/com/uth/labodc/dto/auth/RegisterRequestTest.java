package com.uth.labodc.dto.auth;

import com.uth.labodc.model.enums.UserRole;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RegisterRequestTest {

    @Test
    void acceptsPasswordWithAllRequiredCharacterTypes() {
        RegisterRequest request = new RegisterRequest(
                "talent@uth.edu.vn",
                "SecurePass123!",
                "SecurePass123!",
                UserRole.TALENT
        );

        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            Validator validator = factory.getValidator();
            assertTrue(validator.validate(request).isEmpty());
        }
    }

    @Test
    void rejectsPasswordWithoutUppercaseLetter() {
        RegisterRequest request = new RegisterRequest(
                "talent@uth.edu.vn",
                "securepass123!",
                "securepass123!",
                UserRole.TALENT
        );

        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            Validator validator = factory.getValidator();
            assertFalse(validator.validate(request).isEmpty());
        }
    }
}
