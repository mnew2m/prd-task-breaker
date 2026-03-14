package com.prdbreaker.controller;

import com.prdbreaker.dto.request.PrdAnalysisRequest;
import com.prdbreaker.dto.response.PrdAnalysisResponse;
import com.prdbreaker.service.AnalysisService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisService analysisService;

    @PostMapping("/analysis")
    public ResponseEntity<PrdAnalysisResponse> analyze(@Valid @RequestBody PrdAnalysisRequest request) {
        log.info("POST /api/v1/analysis - prdContent length={}", request.getPrdContent().length());
        PrdAnalysisResponse response = analysisService.analyze(request.getPrdContent());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analysis/{id}")
    public ResponseEntity<PrdAnalysisResponse> getById(@PathVariable Long id) {
        log.info("GET /api/v1/analysis/{}", id);
        return ResponseEntity.ok(analysisService.getById(id));
    }

    @GetMapping("/analysis")
    public ResponseEntity<List<PrdAnalysisResponse>> getRecent(
            @RequestParam(defaultValue = "3") @Min(1) @Max(100) int limit) {
        return ResponseEntity.ok(analysisService.getRecent(limit));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
