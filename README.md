# PRD Task Breaker

PRD(Product Requirements Document)를 입력하면 AI가 구조화된 개발 태스크를 자동으로 생성합니다.

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
