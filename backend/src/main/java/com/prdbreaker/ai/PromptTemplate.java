package com.prdbreaker.ai;

import org.springframework.stereotype.Component;

@Component
public class PromptTemplate {

    public String buildPrompt(String prdContent) {
        return """
                당신은 PRD(Product Requirements Document)를 분석하여 개발 태스크로 변환하는 전문 소프트웨어 아키텍트입니다.

                다음 PRD를 분석하고, 반드시 아래 JSON 형식으로만 응답해주세요. 다른 텍스트는 포함하지 마세요.

                PRD:
                %s

                응답 JSON 형식:
                {
                  "features": [
                    { "name": "string", "description": "string", "priority": "HIGH|MEDIUM|LOW", "notes": "string|null" }
                  ],
                  "userStories": [
                    { "role": "string", "action": "string", "benefit": "string", "acceptanceCriteria": ["string"], "notes": "string|null" }
                  ],
                  "todos": [
                    { "task": "string", "category": "BACKEND|FRONTEND|DATABASE|DEVOPS|TESTING|OTHER", "priority": "HIGH|MEDIUM|LOW", "estimatedEffort": "string", "notes": "string|null" }
                  ],
                  "apiDrafts": [
                    { "method": "GET|POST|PUT|DELETE|PATCH", "path": "string", "description": "string", "requestBody": "string|null", "responseBody": "string|null", "notes": "string|null" }
                  ],
                  "dbDrafts": [
                    { "tableName": "string", "columns": ["string"], "notes": "string|null" }
                  ],
                  "testChecklist": [
                    { "item": "string", "category": "string", "uncertain": false }
                  ],
                  "releaseChecklist": [
                    { "item": "string", "category": "string", "uncertain": false }
                  ],
                  "uncertainItems": ["string"],
                  "readmeDraft": "string"
                }

                지침:
                1. 모든 필드를 채워주세요. 정보가 없으면 빈 배열([])이나 null을 사용하세요.
                2. features는 최소 3개, userStories는 최소 2개 이상 생성하세요.
                3. todos는 구체적이고 실행 가능해야 합니다.
                4. apiDrafts는 RESTful 원칙을 따르세요.
                5. dbDrafts의 columns는 "컬럼명 타입 제약조건" 형식으로 작성하세요.
                6. uncertainItems는 PRD에서 명확하지 않거나 추가 논의가 필요한 사항을 넣으세요.
                7. readmeDraft는 마크다운 형식으로 작성하세요.
                8. 반드시 유효한 JSON만 응답하세요.
                """.formatted(prdContent);
    }
}
