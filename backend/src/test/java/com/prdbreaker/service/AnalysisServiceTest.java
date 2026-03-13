package com.prdbreaker.service;

import com.prdbreaker.ai.AiClient;
import com.prdbreaker.domain.AnalysisStatus;
import com.prdbreaker.domain.PrdAnalysis;
import com.prdbreaker.dto.response.PrdAnalysisResponse;
import com.prdbreaker.exception.AiProcessingException;
import com.prdbreaker.repository.PrdAnalysisRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalysisServiceTest {

    @Mock
    private AiClient aiClient;

    @Mock
    private PrdAnalysisRepository repository;

    @Mock
    private AiResponseMapper mapper;

    @InjectMocks
    private AnalysisService analysisService;

    private static final String VALID_PRD = "이것은 유효한 PRD입니다. ".repeat(5);

    private PrdAnalysis completedEntity() {
        PrdAnalysis e = PrdAnalysis.builder()
                .prdInput(VALID_PRD)
                .status(AnalysisStatus.COMPLETED)
                .build();
        e.complete("{\"features\":[]}");
        return e;
    }

    // ── analyze ───────────────────────────────────────────────────────────────

    @Test
    void analyze_success() {
        PrdAnalysis saved = PrdAnalysis.builder()
                .prdInput(VALID_PRD)
                .status(AnalysisStatus.PENDING)
                .build();

        String mockJson = "{\"features\":[],\"userStories\":[],\"todos\":[],\"apiDrafts\":[],\"dbDrafts\":[],\"testChecklist\":[],\"releaseChecklist\":[],\"uncertainItems\":[]}";

        when(repository.save(any())).thenReturn(saved);
        when(aiClient.analyze(anyString())).thenReturn(mockJson);
        when(mapper.toResponse(any())).thenReturn(PrdAnalysisResponse.builder().build());

        analysisService.analyze(VALID_PRD);

        verify(aiClient).analyze(VALID_PRD);
        verify(repository, times(2)).save(any());
    }

    @Test
    void analyze_aiFailure_throwsAiProcessingException() {
        PrdAnalysis saved = PrdAnalysis.builder()
                .prdInput(VALID_PRD)
                .status(AnalysisStatus.PENDING)
                .build();

        when(repository.save(any())).thenReturn(saved);
        when(aiClient.analyze(anyString())).thenThrow(new RuntimeException("AI error"));

        assertThatThrownBy(() -> analysisService.analyze(VALID_PRD))
                .isInstanceOf(AiProcessingException.class);

        // PENDING → FAILED 저장 포함해서 총 2번
        verify(repository, times(2)).save(any());
    }

    // ── getById ───────────────────────────────────────────────────────────────

    @Test
    void getById_completedEntity_returnsResponse() {
        PrdAnalysis entity = completedEntity();
        PrdAnalysisResponse expected = PrdAnalysisResponse.builder().id(1L).build();

        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(mapper.toResponse(entity)).thenReturn(expected);

        PrdAnalysisResponse result = analysisService.getById(1L);

        assertThat(result).isEqualTo(expected);
        verify(mapper).toResponse(entity);
    }

    @Test
    void getById_notFound_throwsEntityNotFoundException() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> analysisService.getById(999L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void getById_pendingEntity_throwsAiProcessingException() {
        PrdAnalysis pending = PrdAnalysis.builder()
                .prdInput(VALID_PRD)
                .status(AnalysisStatus.PENDING)
                .build();

        when(repository.findById(5L)).thenReturn(Optional.of(pending));

        assertThatThrownBy(() -> analysisService.getById(5L))
                .isInstanceOf(AiProcessingException.class)
                .hasMessageContaining("PENDING");
    }

    @Test
    void getById_failedEntity_throwsAiProcessingException() {
        PrdAnalysis failed = PrdAnalysis.builder()
                .prdInput(VALID_PRD)
                .status(AnalysisStatus.FAILED)
                .build();

        when(repository.findById(7L)).thenReturn(Optional.of(failed));

        assertThatThrownBy(() -> analysisService.getById(7L))
                .isInstanceOf(AiProcessingException.class)
                .hasMessageContaining("FAILED");
    }

    // ── getRecent ─────────────────────────────────────────────────────────────

    @Test
    void getRecent_returnsOnlyCompletedEntities() {
        PrdAnalysis completed = completedEntity();
        PrdAnalysis pending = PrdAnalysis.builder()
                .prdInput(VALID_PRD)
                .status(AnalysisStatus.PENDING)
                .build();
        PrdAnalysisResponse mappedResponse = PrdAnalysisResponse.builder().id(1L).build();

        when(repository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(List.of(completed, pending));
        when(mapper.toResponse(completed)).thenReturn(mappedResponse);

        List<PrdAnalysisResponse> result = analysisService.getRecent(10);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        verify(mapper, times(1)).toResponse(any());
    }

    @Test
    void getRecent_emptyRepository_returnsEmptyList() {
        when(repository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(Collections.emptyList());

        List<PrdAnalysisResponse> result = analysisService.getRecent(20);

        assertThat(result).isEmpty();
        verifyNoInteractions(mapper);
    }

    @Test
    void getRecent_passesLimitToRepository() {
        when(repository.findAllByOrderByCreatedAtDesc(any(Pageable.class)))
                .thenReturn(Collections.emptyList());

        analysisService.getRecent(5);

        verify(repository).findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5));
    }
}
