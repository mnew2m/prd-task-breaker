package com.prdbreaker.ai;

public interface AiClient {
    /**
     * Analyzes PRD content and returns structured JSON result.
     *
     * @param prdContent the PRD text to analyze
     * @return JSON string conforming to the PrdAnalysisResponse schema
     * @throws com.prdbreaker.exception.AiProcessingException if analysis fails
     */
    String analyze(String prdContent);
}
