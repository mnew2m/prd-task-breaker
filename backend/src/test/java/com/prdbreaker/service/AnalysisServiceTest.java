package com.prdbreaker.service;

import com.prdbreaker.ai.AiClient;
import com.prdbreaker.domain.AnalysisStatus;
import com.prdbreaker.domain.PrdAnalysis;
import com.prdbreaker.dto.response.PrdAnalysisResponse;
import com.prdbreaker.exception.AiProcessingException;
import com.prdbreaker.repository.PrdAnalysisRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

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

        verify(repository, times(2)).save(any());
    }
}
