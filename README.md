# PRD Task Breaker

PRD를 붙여넣으면 **30초 안에 개발 착수 가능한 산출물**을 생성합니다.
API 설계·DB 스키마·TODO·테스트 체크리스트까지 한 번에.

## 왜 PRD Task Breaker인가

### 이런 문제를 겪고 있다면

- 기획서를 받아도 API 설계, DB 스키마, 태스크 분해에 **수 시간을 소비**한다
- ChatGPT에 PRD를 넣어봤지만 **결과 포맷이 매번 달라** 팀에 공유하기 어렵다
- 기획자가 넘긴 문서를 개발팀이 재해석하는 과정에서 **병목과 재작업이 반복**된다
- Jira·Linear 같은 도구는 강력하지만 **태스크를 직접 입력해야** 한다

### 비즈니스 가치

| 문제 | PRD Task Breaker 해결 방식 |
|------|---------------------------|
| PRD → 태스크 변환에 드는 반복 공수 | AI가 30초 내 9개 섹션 자동 생성, 개발자는 검토·보완에 집중 |
| 기획-개발 간 커뮤니케이션 비용 | 불확실 항목 섹션이 논의 포인트를 명시적으로 추출 |
| 팀 공유용 문서 포맷 불일치 | 고정 스키마 출력 + PDF 내보내기로 즉시 공유 가능 |
| 이전 의사결정 추적 불가 | 분석 이력 저장으로 스프린트 간 결과 비교·재활용 |

### 누구를 위한 도구인가

- **백엔드·풀스택 개발자**: PRD를 받는 즉시 API/DB 초안과 TODO를 확보
- **스타트업 창업자·기획자**: 개발팀과 범위 협의 전 구조화된 근거 자료 준비

## 경쟁 솔루션 비교

| 솔루션 | PRD 자동 분해 | API/DB 초안 | 이력 관리 | 즉시 사용(계정 불필요) | PDF 내보내기 |
|--------|:---:|:---:|:---:|:---:|:---:|
| **PRD Task Breaker** | ✅ | ✅ | ✅ | ✅ | ✅ |
| ChatGPT / Claude 직접 | △ 프롬프트 직접 작성 | △ 비정형 출력 | ❌ | ✅ | ❌ |
| Notion AI | △ 요약·정리 수준 | ❌ | ✅ (문서 저장) | ❌ (계정 필요) | △ |
| Jira | ❌ 수동 입력 | ❌ | ✅ | ❌ | △ |
| Linear | ❌ 수동 입력 | ❌ | ✅ | ❌ | ❌ |

> **핵심 차이**: ChatGPT·Claude를 직접 쓰는 것과 비교하면, PRD Task Breaker는 **전용 프롬프트 + 9개 섹션 고정 스키마**로 일관된 결과를 보장하고, 결과를 저장·재조회할 수 있습니다.

## 빠른 시작

> **사전 요구사항**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) 설치 필요

```bash
docker compose up
```

브라우저에서 http://localhost:5173 접속

> `docker-compose` (하이픈)는 구버전 명령어입니다. Docker Desktop v2 이상은 `docker compose` (띄어쓰기)를 사용합니다.

## 개발 환경

### 사전 요구사항
- Java 17+
- Node.js 20+
- Docker Desktop v2+

### 백엔드
```bash
# Docker 사용 (권장, Gradle Wrapper 불필요)
docker compose up backend

# 또는 시스템 Gradle 설치 후
cd backend && gradle bootRun
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Vue 3, TypeScript, Vite |
| Backend | Spring Boot 3.2, Java 17, Gradle |
| Database | H2 (dev), PostgreSQL (prod) |
| AI | Anthropic Claude (기본: claude-haiku-4-5-20251001) |
| CI/CD | GitHub Actions |
| Deploy | Vercel (frontend), Railway (backend) |

## 환경 변수 (운영 환경)

```bash
SPRING_PROFILES_ACTIVE=prod
ANTHROPIC_API_KEY=your-key-here
AI_MODEL=claude-haiku-4-5-20251001  # 선택, 기본값으로도 동작
DB_URL=jdbc:postgresql://host:5432/prdbreaker
DB_USERNAME=username
DB_PASSWORD=password
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

## 주요 기능

### AI 분석 결과 — 9개 섹션

PRD 텍스트를 입력하면 Claude AI가 아래 9개 섹션을 자동 생성합니다.

| 섹션 | 내용 |
|------|------|
| 기능 목록 | 우선순위(HIGH/MEDIUM/LOW) 및 예상 공수 포함 |
| 유저 스토리 | 페르소나별 스토리 + 인수 기준(Acceptance Criteria) |
| TODO | 카테고리·우선순위·예상 공수 구조화, 개발 바로 착수 가능 수준 |
| API 초안 | RESTful 엔드포인트 설계 (메서드, 경로, 요청/응답 형태) |
| DB 초안 | 테이블 스키마 및 주요 컬럼 정의 |
| 테스트 체크리스트 | 단위·통합·E2E 시나리오 목록 |
| 릴리즈 체크리스트 | 배포 전 확인 항목 |
| 불확실 항목 | 추가 논의·결정이 필요한 사항 목록 |
| README 초안 | 프로젝트 README 마크다운 (클립보드 복사 가능) |

### 분석 히스토리

- 앱 진입 시 최근 분석 목록 자동 로딩
- 접기/펼치기 패널로 최근 3건 표시
- 클릭 시 과거 결과 즉시 불러오기
- 분석 완료 후 목록 자동 갱신

### PDF 내보내기

- 섹션별 선택 내보내기 (원하는 섹션만 포함 가능)
- 한글 폰트(Noto Sans KR) 지원
- 섹션 순서 변경 후 PDF에도 반영

### 기타 UX

- **분석 취소**: 진행 중인 AI 요청을 중단하고 초기 화면으로 복귀
- **섹션 순서 변경**: 드래그&드롭(PC) 및 터치 드래그(모바일) 지원
- **유용성 피드백**: 분석 결과에 👍/👎 평가 (히스토리에서 불러온 결과는 이전 평가 표시)
- **모바일 대응**: 반응형 레이아웃, 스크롤-투-탑 버튼

## 테스트

```bash
# 프론트엔드
cd frontend && npm run test:run

# 백엔드 (Docker 또는 시스템 Gradle 필요)
cd backend && gradle test --no-daemon
```

## 프로젝트 문서

| 문서 | 용도 |
|------|------|
| [PRD.md](PRD.md) | 제품 목표, 페르소나, 시장 맥락, 핵심 기능, KPI |
| README.md | 빠른 실행, 기능 개요, 개발 진입점 |
| [CLAUDE.md](CLAUDE.md) | AI 어시스턴트 협업용 컨텍스트, 아키텍처/프로파일/작업 규칙 |
| [docs/architecture.md](docs/architecture.md) | 시스템 구조, 프론트엔드 상태관리, 데이터 흐름, 설계 결정 |
| [docs/test-plan.md](docs/test-plan.md) | 테스트 전략, 커버리지 목표, E2E/성능/운영 검증 계획 |
| [docs/dev-log.md](docs/dev-log.md) | 날짜별 작업 기록, 문제 해결 과정, 관련 커밋 추적 |
| [docs/deploy.md](docs/deploy.md) | 배포 절차, 환경 변수, 모니터링/롤백 가이드 |

> **권장 읽기 순서**: [PRD.md](PRD.md) → README.md → [docs/architecture.md](docs/architecture.md) → [docs/test-plan.md](docs/test-plan.md) → [docs/deploy.md](docs/deploy.md) → [docs/dev-log.md](docs/dev-log.md)
