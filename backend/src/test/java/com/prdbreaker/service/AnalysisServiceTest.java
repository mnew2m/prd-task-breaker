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
import static org.mockito.ArgumentMatchers.eq;
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

    @Test
    void analyze_aiFailure_savesFAILEDStatus() {
        PrdAnalysis entity = PrdAnalysis.builder()
                .prdInput(VALID_PRD)
                .status(AnalysisStatus.PENDING)
                .build();

        // First save returns the entity; second save (FAILED) also returns it
        when(repository.save(any())).thenReturn(entity);
        when(aiClient.analyze(anyString())).thenThrow(new RuntimeException("AI down"));

        assertThatThrownBy(() -> analysisService.analyze(VALID_PRD))
                .isInstanceOf(AiProcessingException.class);

        // Capture the entity passed to the second save to verify FAILED status
        org.mockito.ArgumentCaptor<PrdAnalysis> captor = org.mockito.ArgumentCaptor.forClass(PrdAnalysis.class);
        verify(repository, times(2)).save(captor.capture());
        PrdAnalysis savedInCatch = captor.getAllValues().get(1);
        assertThat(savedInCatch.getStatus()).isEqualTo(AnalysisStatus.FAILED);
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
        PrdAnalysisResponse mappedResponse = PrdAnalysisResponse.builder().id(1L).build();

        when(repository.findByStatusOrderByCreatedAtDesc(eq(AnalysisStatus.COMPLETED), any(Pageable.class)))
                .thenReturn(List.of(completed));
        when(mapper.toResponse(completed)).thenReturn(mappedResponse);

        List<PrdAnalysisResponse> result = analysisService.getRecent(10);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        verify(mapper, times(1)).toResponse(any());
    }

    @Test
    void getRecent_emptyRepository_returnsEmptyList() {
        when(repository.findByStatusOrderByCreatedAtDesc(eq(AnalysisStatus.COMPLETED), any(Pageable.class)))
                .thenReturn(Collections.emptyList());

        List<PrdAnalysisResponse> result = analysisService.getRecent(20);

        assertThat(result).isEmpty();
        verifyNoInteractions(mapper);
    }

    // ── submitFeedback ────────────────────────────────────────────────────────

    @Test
    void submitFeedback_completed_savesUsefulTrue() {
        PrdAnalysis entity = completedEntity();
        when(repository.findById(1L)).thenReturn(Optional.of(entity));
        when(repository.save(any())).thenReturn(entity);
        when(mapper.toResponse(any())).thenReturn(PrdAnalysisResponse.builder().id(1L).useful(true).build());

        PrdAnalysisResponse result = analysisService.submitFeedback(1L, true);

        assertThat(entity.getUseful()).isTrue();
        assertThat(result.getUseful()).isTrue();
        verify(repository).save(entity);
    }

    @Test
    void submitFeedback_completed_savesUsefulFalse() {
        PrdAnalysis entity = completedEntity();
        when(repository.findById(2L)).thenReturn(Optional.of(entity));
        when(repository.save(any())).thenReturn(entity);
        when(mapper.toResponse(any())).thenReturn(PrdAnalysisResponse.builder().id(2L).useful(false).build());

        PrdAnalysisResponse result = analysisService.submitFeedback(2L, false);

        assertThat(entity.getUseful()).isFalse();
        assertThat(result.getUseful()).isFalse();
    }

    @Test
    void submitFeedback_notFound_throwsEntityNotFoundException() {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> analysisService.submitFeedback(999L, true))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void submitFeedback_pendingEntity_throwsAiProcessingException() {
        PrdAnalysis pending = PrdAnalysis.builder()
                .prdInput(VALID_PRD)
                .status(AnalysisStatus.PENDING)
                .build();
        when(repository.findById(3L)).thenReturn(Optional.of(pending));

        assertThatThrownBy(() -> analysisService.submitFeedback(3L, true))
                .isInstanceOf(AiProcessingException.class)
                .hasMessageContaining("PENDING");
    }

    @Test
    void getRecent_passesLimitToRepository() {
        when(repository.findByStatusOrderByCreatedAtDesc(eq(AnalysisStatus.COMPLETED), any(Pageable.class)))
                .thenReturn(Collections.emptyList());

        analysisService.getRecent(5);

        verify(repository).findByStatusOrderByCreatedAtDesc(AnalysisStatus.COMPLETED, PageRequest.of(0, 5));
    }
}
