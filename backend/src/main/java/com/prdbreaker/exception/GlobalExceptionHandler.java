package com.prdbreaker.exception;

import com.prdbreaker.dto.response.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest()
                .body(ErrorResponse.of(400, "Bad Request", message));
    }

    @ExceptionHandler(InvalidPrdInputException.class)
    public ResponseEntity<ErrorResponse> handleInvalidInput(InvalidPrdInputException ex) {
        return ResponseEntity.badRequest()
                .body(ErrorResponse.of(400, "Bad Request", ex.getMessage()));
    }

    @ExceptionHandler(AiProcessingException.class)
    public ResponseEntity<ErrorResponse> handleAiProcessing(AiProcessingException ex) {
        log.error("AI processing failed", ex);
        return ResponseEntity.internalServerError()
                .body(ErrorResponse.of(500, "Internal Server Error", "AI processing failed: " + ex.getMessage()));
    }

    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(jakarta.persistence.EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(404, "Not Found", ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Unexpected error", ex);
        return ResponseEntity.internalServerError()
                .body(ErrorResponse.of(500, "Internal Server Error", "An unexpected error occurred"));
    }
}
