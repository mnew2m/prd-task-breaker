package com.prdbreaker.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prdbreaker.exception.SchemaValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiResponseValidator {

    private static final List<String> REQUIRED_FIELDS = List.of(
            "features", "userStories", "todos", "apiDrafts",
            "dbDrafts", "testChecklist", "releaseChecklist", "uncertainItems"
    );

    private final ObjectMapper objectMapper;

    public JsonNode validateAndParse(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);

            List<String> missingFields = REQUIRED_FIELDS.stream()
                    .filter(field -> !root.has(field) || root.get(field).isNull())
                    .toList();

            if (!missingFields.isEmpty()) {
                log.warn("AI response missing fields: {}. Applying graceful degradation.", missingFields);
                // Graceful degradation: return partial result rather than throwing
            }

            return root;
        } catch (Exception e) {
            throw new SchemaValidationException("AI response is not valid JSON: " + e.getMessage(), e);
        }
    }
}
