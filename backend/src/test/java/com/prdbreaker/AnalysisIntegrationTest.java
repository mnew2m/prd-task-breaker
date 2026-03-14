package com.prdbreaker;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class AnalysisIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String VALID_PRD = "이것은 충분히 긴 PRD 내용입니다. ".repeat(5);

    @Test
    void fullFlow_postAnalysis_getById_getRecent() throws Exception {
        // 1. Analyze
        String responseJson = mockMvc.perform(post("/api/v1/analysis")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prdContent\": \"" + VALID_PRD + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.features").isArray())
                .andReturn()
                .getResponse()
                .getContentAsString();

        @SuppressWarnings("unchecked")
        long id = ((Number) objectMapper.readValue(responseJson, Map.class).get("id")).longValue();

        // 2. Get by ID
        mockMvc.perform(get("/api/v1/analysis/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id));

        // 3. Get recent
        mockMvc.perform(get("/api/v1/analysis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void postAnalysis_shortContent_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/analysis")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prdContent\": \"너무 짧은 내용\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getRecent_invalidLimit_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/analysis").param("limit", "0"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getById_nonExistentId_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/analysis/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void health_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
