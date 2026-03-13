package com.prdbreaker.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prdbreaker.exception.AiProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@Profile("prod")
@RequiredArgsConstructor
public class ClaudeAiClient implements AiClient {

    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

    @Value("${ai.claude.api-key}")
    private String apiKey;

    @Value("${ai.claude.model:claude-haiku-4-5-20251001}")
    private String model;

    @Value("${ai.claude.max-tokens:8192}")
    private int maxTokens;

    private final RestTemplate restTemplate;
    private final PromptTemplate promptTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public String analyze(String prdContent) {
        log.info("ClaudeAiClient: analyzing PRD (length={})", prdContent.length());

        try {
            String prompt = promptTemplate.buildPrompt(prdContent);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "max_tokens", maxTokens,
                    "messages", List.of(
                            Map.of("role", "user", "content", prompt)
                    )
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(CLAUDE_API_URL, entity, Map.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new AiProcessingException("Claude API returned non-success status: " + response.getStatusCode());
            }

            List<Map<String, Object>> content = (List<Map<String, Object>>) response.getBody().get("content");
            if (content == null || content.isEmpty()) {
                throw new AiProcessingException("Claude API returned empty content");
            }

            String rawText = (String) content.get(0).get("text");
            return extractJson(rawText);

        } catch (AiProcessingException e) {
            throw e;
        } catch (Exception e) {
            throw new AiProcessingException("Failed to call Claude API", e);
        }
    }

    private String extractJson(String text) {
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start == -1 || end == -1 || start >= end) {
            throw new AiProcessingException("No valid JSON found in Claude response");
        }
        return text.substring(start, end + 1);
    }
}
