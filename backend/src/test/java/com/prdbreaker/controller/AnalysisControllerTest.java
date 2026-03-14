package com.prdbreaker.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prdbreaker.dto.response.PrdAnalysisResponse;
import com.prdbreaker.exception.AiProcessingException;
import com.prdbreaker.service.AnalysisService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
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

    private PrdAnalysisResponse buildResponse(long id) {
        return PrdAnalysisResponse.builder()
                .id(id)
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
    }

    // ── POST /api/v1/analysis ─────────────────────────────────────────────

    @Test
    void postAnalysis_validRequest_returns200() throws Exception {
        String validPrd = "이것은 충분히 긴 PRD 내용입니다. ".repeat(5);
        when(analysisService.analyze(anyString())).thenReturn(buildResponse(1L));

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
    void postAnalysis_aiFailure_returns500() throws Exception {
        String validPrd = "이것은 충분히 긴 PRD 내용입니다. ".repeat(5);
        when(analysisService.analyze(anyString()))
                .thenThrow(new AiProcessingException("AI error"));

        mockMvc.perform(post("/api/v1/analysis")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prdContent\": \"" + validPrd + "\"}"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.message").value("AI 분석 처리에 실패했습니다. 잠시 후 다시 시도해주세요."));
    }

    // ── GET /api/v1/analysis/{id} ─────────────────────────────────────────

    @Test
    void getById_existingId_returns200WithBody() throws Exception {
        when(analysisService.getById(42L)).thenReturn(buildResponse(42L));

        mockMvc.perform(get("/api/v1/analysis/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42L));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        when(analysisService.getById(999L))
                .thenThrow(new EntityNotFoundException("Analysis not found with id: 999"));

        mockMvc.perform(get("/api/v1/analysis/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Analysis not found with id: 999"));
    }

    @Test
    void getById_incompleteAnalysis_returns500() throws Exception {
        when(analysisService.getById(5L))
                .thenThrow(new AiProcessingException("Analysis is not completed. Status: PENDING"));

        mockMvc.perform(get("/api/v1/analysis/5"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.status").value(500));
    }

    // ── GET /api/v1/analysis ──────────────────────────────────────────────

    @Test
    void getRecent_returnsListWith200() throws Exception {
        List<PrdAnalysisResponse> list = List.of(buildResponse(2L), buildResponse(1L));
        when(analysisService.getRecent(3)).thenReturn(list);

        mockMvc.perform(get("/api/v1/analysis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(2L))
                .andExpect(jsonPath("$[1].id").value(1L));
    }

    @Test
    void getRecent_emptyList_returns200WithEmptyArray() throws Exception {
        when(analysisService.getRecent(anyInt())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/analysis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getRecent_customLimit_passedToService() throws Exception {
        when(analysisService.getRecent(5)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/v1/analysis").param("limit", "5"))
                .andExpect(status().isOk());
    }

    @Test
    void getRecent_limitAbove100_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/analysis").param("limit", "200"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getRecent_negativelimit_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/analysis").param("limit", "-1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getRecent_zeroLimit_returns400() throws Exception {
        mockMvc.perform(get("/api/v1/analysis").param("limit", "0"))
                .andExpect(status().isBadRequest());
    }

    // ── createdAt 직렬화 형식 ──────────────────────────────────────────────

    @Test
    void postAnalysis_createdAt_serializedAsIsoString() throws Exception {
        String validPrd = "이것은 충분히 긴 PRD 내용입니다. ".repeat(5);
        PrdAnalysisResponse response = PrdAnalysisResponse.builder()
                .id(1L)
                .features(Collections.emptyList())
                .userStories(Collections.emptyList())
                .todos(Collections.emptyList())
                .apiDrafts(Collections.emptyList())
                .dbDrafts(Collections.emptyList())
                .testChecklist(Collections.emptyList())
                .releaseChecklist(Collections.emptyList())
                .uncertainItems(Collections.emptyList())
                .createdAt(LocalDateTime.of(2026, 3, 13, 10, 30, 0))
                .build();
        when(analysisService.analyze(anyString())).thenReturn(response);

        mockMvc.perform(post("/api/v1/analysis")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prdContent\": \"" + validPrd + "\"}"))
                .andExpect(status().isOk())
                // 배열([2026,3,13,...])이 아닌 ISO 문자열 형태여야 함
                .andExpect(jsonPath("$.createdAt").value("2026-03-13T10:30:00"));
    }

    // ── GET /api/v1/health ────────────────────────────────────────────────

    @Test
    void getHealth_returns200() throws Exception {
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
