package com.prdbreaker.service;

import com.prdbreaker.ai.AiClient;
import com.prdbreaker.domain.AnalysisStatus;
import com.prdbreaker.domain.PrdAnalysis;
import com.prdbreaker.dto.response.PrdAnalysisResponse;
import com.prdbreaker.exception.AiProcessingException;
import com.prdbreaker.repository.PrdAnalysisRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final AiClient aiClient;
    private final PrdAnalysisRepository repository;
    private final AiResponseMapper mapper;

    // @Transactional intentionally omitted: each repository.save() commits independently,
    // so a FAILED status persisted in the catch block is not rolled back when the exception propagates.
    public PrdAnalysisResponse analyze(String prdContent) {
        PrdAnalysis entity = PrdAnalysis.builder()
                .prdInput(prdContent)
                .status(AnalysisStatus.PENDING)
                .build();
        entity = repository.save(entity);

        try {
            log.info("Starting AI analysis for id={}", entity.getId());
            String resultJson = aiClient.analyze(prdContent);
            entity.complete(resultJson);
            entity = repository.save(entity);
            log.info("AI analysis completed for id={}", entity.getId());
            return mapper.toResponse(entity);
        } catch (Exception e) {
            entity.fail();
            repository.save(entity);
            log.error("AI analysis failed for id={}", entity.getId(), e);
            throw new AiProcessingException("Analysis failed: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public PrdAnalysisResponse getById(Long id) {
        PrdAnalysis entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Analysis not found with id: " + id));
        if (entity.getStatus() != AnalysisStatus.COMPLETED || entity.getResultJson() == null) {
            throw new AiProcessingException("Analysis is not completed. Status: " + entity.getStatus());
        }
        return mapper.toResponse(entity);
    }

    @Transactional(readOnly = true)
    public List<PrdAnalysisResponse> getRecent(int limit) {
        return repository.findByStatusOrderByCreatedAtDesc(AnalysisStatus.COMPLETED, PageRequest.of(0, limit))
                .stream()
                .map(mapper::toResponse)
                .toList();
    }
}
