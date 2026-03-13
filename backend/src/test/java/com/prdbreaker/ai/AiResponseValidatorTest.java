package com.prdbreaker.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prdbreaker.exception.SchemaValidationException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

class AiResponseValidatorTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AiResponseValidator validator = new AiResponseValidator(objectMapper);

    private static final String FULL_JSON = """
            {
              "features": [], "userStories": [], "todos": [],
              "apiDrafts": [], "dbDrafts": [],
              "testChecklist": [], "releaseChecklist": [],
              "uncertainItems": []
            }
            """;

    @Test
    void validateAndParse_validJson_returnsJsonNode() {
        JsonNode result = validator.validateAndParse(FULL_JSON);
        assertThat(result.has("features")).isTrue();
        assertThat(result.has("testChecklist")).isTrue();
    }

    @Test
    void validateAndParse_missingFields_doesNotThrow() {
        // graceful degradation: missing fields should only warn, not throw
        String partialJson = "{\"features\": []}";
        assertThatCode(() -> validator.validateAndParse(partialJson)).doesNotThrowAnyException();
    }

    @Test
    void validateAndParse_emptyJson_doesNotThrow() {
        assertThatCode(() -> validator.validateAndParse("{}")).doesNotThrowAnyException();
    }

    @Test
    void validateAndParse_invalidJson_throwsSchemaValidationException() {
        assertThatThrownBy(() -> validator.validateAndParse("not-json"))
                .isInstanceOf(SchemaValidationException.class);
    }

    @Test
    void validateAndParse_nullValueField_doesNotThrow() {
        String jsonWithNull = "{\"features\": null}";
        assertThatCode(() -> validator.validateAndParse(jsonWithNull)).doesNotThrowAnyException();
    }
}
