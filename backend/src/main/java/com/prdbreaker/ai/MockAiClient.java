package com.prdbreaker.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Profile("dev")
public class MockAiClient implements AiClient {

    @Override
    public String analyze(String prdContent) {
        log.info("MockAiClient: analyzing PRD (length={})", prdContent.length());
        return """
                {
                  "features": [
                    {
                      "name": "사용자 인증",
                      "description": "이메일/패스워드 기반 로그인 및 회원가입",
                      "priority": "HIGH",
                      "notes": "JWT 토큰 사용 권장"
                    },
                    {
                      "name": "PRD 입력",
                      "description": "텍스트 영역에 PRD를 입력하고 분석 요청",
                      "priority": "HIGH",
                      "notes": null
                    }
                  ],
                  "userStories": [
                    {
                      "role": "개발자",
                      "action": "PRD를 입력하고 분석 버튼을 클릭한다",
                      "benefit": "구조화된 개발 태스크를 즉시 얻을 수 있다",
                      "acceptanceCriteria": [
                        "50자 이상 PRD 입력 가능",
                        "30초 이내 결과 반환",
                        "8개 섹션 모두 표시"
                      ],
                      "notes": null
                    }
                  ],
                  "todos": [
                    {
                      "task": "Spring Boot 프로젝트 초기 설정",
                      "category": "BACKEND",
                      "priority": "HIGH",
                      "estimatedEffort": "2h",
                      "notes": "Java 17, Gradle"
                    },
                    {
                      "task": "Vue 3 프로젝트 초기 설정",
                      "category": "FRONTEND",
                      "priority": "HIGH",
                      "estimatedEffort": "1h",
                      "notes": "Vite, TypeScript"
                    },
                    {
                      "task": "AI 클라이언트 구현",
                      "category": "BACKEND",
                      "priority": "HIGH",
                      "estimatedEffort": "4h",
                      "notes": "Claude API 연동"
                    }
                  ],
                  "apiDrafts": [
                    {
                      "method": "POST",
                      "path": "/api/v1/analysis",
                      "description": "PRD 분석 요청",
                      "requestBody": "{ \\"prdContent\\": \\"string\\" }",
                      "responseBody": "{ \\"id\\": \\"long\\", \\"features\\": [...] }",
                      "notes": "동기 처리, 최대 30초"
                    },
                    {
                      "method": "GET",
                      "path": "/api/v1/analysis/{id}",
                      "description": "분석 결과 조회",
                      "requestBody": null,
                      "responseBody": "PrdAnalysisResponse",
                      "notes": null
                    }
                  ],
                  "dbDrafts": [
                    {
                      "tableName": "prd_analysis",
                      "columns": [
                        "id BIGINT PRIMARY KEY AUTO_INCREMENT",
                        "prd_input TEXT NOT NULL",
                        "result_json TEXT",
                        "status VARCHAR(20) NOT NULL",
                        "created_at TIMESTAMP NOT NULL",
                        "completed_at TIMESTAMP"
                      ],
                      "notes": "단일 테이블로 MVP 구성"
                    }
                  ],
                  "testChecklist": [
                    {
                      "item": "유효한 PRD 입력 시 200 응답 확인",
                      "category": "API",
                      "uncertain": false
                    },
                    {
                      "item": "빈 입력 시 400 응답 확인",
                      "category": "API",
                      "uncertain": false
                    },
                    {
                      "item": "AI 타임아웃 시 에러 처리 확인",
                      "category": "ERROR_HANDLING",
                      "uncertain": true
                    }
                  ],
                  "releaseChecklist": [
                    {
                      "item": "Docker Compose 실행 확인",
                      "category": "DEPLOYMENT",
                      "uncertain": false
                    },
                    {
                      "item": "환경변수 설정 문서화",
                      "category": "DOCUMENTATION",
                      "uncertain": false
                    },
                    {
                      "item": "CORS 설정 프로덕션 환경 확인",
                      "category": "SECURITY",
                      "uncertain": false
                    }
                  ],
                  "uncertainItems": [
                    "PRD 분석 결과의 정확도 기준이 명확하지 않음",
                    "AI 응답 시간이 30초를 초과할 경우의 처리 방식 미정"
                  ],
                  "readmeDraft": "# PRD Task Breaker\\n\\nPRD를 입력하면 AI가 구조화된 개발 태스크를 생성합니다.\\n\\n## 실행 방법\\n```bash\\ndocker-compose up\\n```\\n\\n브라우저에서 http://localhost:5173 접속"
                }
                """;
    }
}
