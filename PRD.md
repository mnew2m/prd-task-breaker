# PRD: PRD Task Breaker

## 1. 제품 개요
개발자가 PRD를 입력하면 즉시 개발 착수 가능한 구조화된 산출물을 생성하는 AI 도구.

## 2. 목표
- PRD → 구조화된 개발 태스크 자동 변환
- 기획-개발 간 커뮤니케이션 비용 절감
- MVP 품질의 API/DB 설계 초안 자동 생성

## 3. 사용자
- 주요: 백엔드/풀스택 개발자
- 부수: 기획자, 스타트업 창업자

## 4. 핵심 기능

### F-01: PRD 입력
- 텍스트 영역에 PRD 직접 입력 (50~50,000자)
- 샘플 PRD 불러오기 버튼

### F-02: AI 분석 실행
- 분석 버튼 클릭 → POST /api/v1/analysis
- 로딩 상태 표시

### F-03: 결과 표시 (8개 섹션)
1. **기능 목록** (Feature List): 이름, 설명, 우선순위
2. **유저 스토리** (User Stories): 역할, 행동, 이점, 인수 기준
3. **TODO 항목** (TODO Breakdown): 태스크, 카테고리, 우선순위, 예상 공수
4. **API 초안** (API Draft): Method, Path, 요청/응답 바디
5. **DB 초안** (DB Draft): 테이블, 컬럼, 타입
6. **테스트 체크리스트** (Test Checklist): 항목, 카테고리
7. **릴리즈 체크리스트** (Release Checklist): 항목, 카테고리
8. **불확실 항목** (Uncertain Items): 추가 논의 필요 사항

### F-04: 에러/빈 상태 처리
- 입력 없음, AI 오류, 서버 오류 각각 안내 메시지

## 5. 비기능 요구사항
- 응답 시간: 30초 이내 (AI 호출 포함)
- Docker Compose 단일 명령 실행
- 테스트 커버리지: 주요 서비스 로직 80%+

## 6. 기술 스택
- Frontend: Vue 3, TypeScript, Vite
- Backend: Spring Boot 3.2, Java 17, Gradle
- DB: H2 (dev), PostgreSQL (prod)
- AI: Anthropic Claude API
- CI: GitHub Actions
