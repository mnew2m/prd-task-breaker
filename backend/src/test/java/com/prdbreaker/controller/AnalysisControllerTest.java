package com.prdbreaker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prdbreaker.dto.request.PrdAnalysisRequest;
import com.prdbreaker.dto.response.PrdAnalysisResponse;
import com.prdbreaker.service.AnalysisService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnalysisController.class)
class AnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AnalysisService analysisService;

    @Test
    void postAnalysis_validRequest_returns200() throws Exception {
        String validPrd = "이것은 충분히 긴 PRD 내용입니다. ".repeat(5);

        PrdAnalysisResponse mockResponse = PrdAnalysisResponse.builder()
                .id(1L)
                .features(Collections.emptyList())
                .userStories(Collections.emptyList())
                .todos(Collections.emptyList())
                .apiDrafts(Collections.emptyList())
                .dbDrafts(Collections.emptyList())
                .testChecklist(Collections.emptyList())
                .releaseChecklist(Collections.emptyList())
                .uncertainItems(Collections.emptyList())
                .createdAt(LocalDateTime.now())
                .build();

        when(analysisService.analyze(anyString())).thenReturn(mockResponse);

        mockMvc.perform(post("/api/v1/analysis")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prdContent\": \"" + validPrd + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L));
    }

    @Test
    void postAnalysis_blankContent_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/analysis")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prdContent\": \"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getHealth_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
