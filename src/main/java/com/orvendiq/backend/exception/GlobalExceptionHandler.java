package com.orvendiq.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private ResponseEntity<Map<String, Object>> error(
            HttpStatus status, String message) {

        return ResponseEntity.status(status).body(Map.of(
            "timestamp", Instant.now().toString(),
            "status", status.value(),
            "error", status.getReasonPhrase(),
            "message", message
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validation(
            MethodArgumentNotValidException ex) {

        return error(HttpStatus.BAD_REQUEST,
                "Request validation failed");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> badRequest(
            IllegalArgumentException ex) {

        if ("Transaction reference already exists"
                .equals(ex.getMessage())) {
            return error(HttpStatus.CONFLICT,
                    ex.getMessage());
        }

        return error(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> businessError(
            IllegalStateException ex) {

        if ("Insufficient funds".equals(ex.getMessage())) {
            return error(HttpStatus.UNPROCESSABLE_ENTITY,
                    ex.getMessage());
        }

        return error(HttpStatus.CONFLICT,
                "Business operation cannot be completed");
    }
}