package com.prdbreaker.ai;

import org.springframework.stereotype.Component;

@Component
public class PromptTemplate {

    public String buildPrompt(String prdContent) {
        return """
                PRD를 분석하여 개발 태스크 JSON으로 변환하세요. JSON만 응답하세요.

                [중요: 토큰 절약 규칙]
                - description, notes는 한 문장(30자 이내)으로 작성
                - acceptanceCriteria는 항목당 최대 3개
                - features 최대 5개, userStories 최대 5개, todos 최대 10개
                - apiDrafts 최대 8개, dbDrafts 최대 5개
                - testChecklist/releaseChecklist 각 최대 5개
                - readmeDraft는 5줄 이내로 간략히
                - notes는 꼭 필요한 경우만 작성, 아니면 null

                PRD:
                %s

                JSON 형식:
                {"features":[{"name":"str","description":"str","priority":"HIGH|MEDIUM|LOW","notes":"str|null"}],"userStories":[{"role":"str","action":"str","benefit":"str","acceptanceCriteria":["str"],"notes":"str|null"}],"todos":[{"task":"str","category":"BACKEND|FRONTEND|DATABASE|DEVOPS|TESTING|OTHER","priority":"HIGH|MEDIUM|LOW","estimatedEffort":"str","notes":"str|null"}],"apiDrafts":[{"method":"GET|POST|PUT|DELETE|PATCH","path":"str","description":"str","requestBody":"str|null","responseBody":"str|null","notes":"str|null"}],"dbDrafts":[{"tableName":"str","columns":["str"],"notes":"str|null"}],"testChecklist":[{"item":"str","category":"str","uncertain":false}],"releaseChecklist":[{"item":"str","category":"str","uncertain":false}],"uncertainItems":["str"],"readmeDraft":"str"}

                지침:
                1. 모든 필드를 채우되, 정보가 없으면 빈 배열([])이나 null 사용
                2. dbDrafts columns는 "컬럼명 타입 제약조건" 형식
                3. uncertainItems는 PRD에서 불명확한 사항만
                4. 반드시 유효한 JSON만 응답
                """.formatted(prdContent);
    }
}
