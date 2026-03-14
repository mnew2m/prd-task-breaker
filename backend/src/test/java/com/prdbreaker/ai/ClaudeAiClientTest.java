package com.prdbreaker.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prdbreaker.exception.AiProcessingException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClaudeAiClientTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private PromptTemplate promptTemplate;

    @InjectMocks
    private ClaudeAiClient claudeAiClient;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(claudeAiClient, "apiKey", "test-api-key");
        ReflectionTestUtils.setField(claudeAiClient, "model", "claude-haiku-4-5-20251001");
        ReflectionTestUtils.setField(claudeAiClient, "maxTokens", 8192);
        // Use real ObjectMapper
        ReflectionTestUtils.setField(claudeAiClient, "objectMapper", new ObjectMapper());
        when(promptTemplate.buildPrompt(anyString())).thenReturn("test prompt");
    }

    @Test
    void analyze_success_extractsJsonFromResponse() {
        String rawText = "분석 결과입니다: {\"features\":[],\"userStories\":[]} 이것이 끝입니다.";
        Map<String, Object> responseBody = Map.of(
                "content", List.of(Map.of("text", rawText))
        );
        when(restTemplate.postForEntity(anyString(), any(), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(responseBody));

        String result = claudeAiClient.analyze("PRD content");

        assertThat(result).isEqualTo("{\"features\":[],\"userStories\":[]}");
    }

    @Test
    void analyze_emptyContent_throwsAiProcessingException() {
        Map<String, Object> responseBody = Map.of("content", List.of());
        when(restTemplate.postForEntity(anyString(), any(), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(responseBody));

        assertThatThrownBy(() -> claudeAiClient.analyze("PRD"))
                .isInstanceOf(AiProcessingException.class)
                .hasMessageContaining("empty content");
    }

    @Test
    void analyze_noJsonInResponse_throwsAiProcessingException() {
        Map<String, Object> responseBody = Map.of(
                "content", List.of(Map.of("text", "JSON이 없는 응답입니다."))
        );
        when(restTemplate.postForEntity(anyString(), any(), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(responseBody));

        assertThatThrownBy(() -> claudeAiClient.analyze("PRD"))
                .isInstanceOf(AiProcessingException.class)
                .hasMessageContaining("No valid JSON");
    }

    @Test
    void analyze_restTemplateThrows_wrapsInAiProcessingException() {
        when(restTemplate.postForEntity(anyString(), any(), eq(Map.class)))
                .thenThrow(new RestClientException("Connection refused"));

        assertThatThrownBy(() -> claudeAiClient.analyze("PRD"))
                .isInstanceOf(AiProcessingException.class)
                .hasMessageContaining("Failed to call Claude API");
    }

    @Test
    void analyze_nonSuccessStatus_throwsAiProcessingException() {
        when(restTemplate.postForEntity(anyString(), any(), eq(Map.class)))
                .thenReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());

        assertThatThrownBy(() -> claudeAiClient.analyze("PRD"))
                .isInstanceOf(AiProcessingException.class)
                .hasMessageContaining("non-success status");
    }
}
