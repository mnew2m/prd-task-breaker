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

## 결과물 (9개 섹션)

1. **기능 목록** - 우선순위별 기능 분류
2. **유저 스토리** - 인수 기준 포함
3. **TODO** - 카테고리, 우선순위, 예상 공수
4. **API 초안** - RESTful 엔드포인트 설계
5. **DB 초안** - 테이블 스키마
6. **테스트 체크리스트**
7. **릴리즈 체크리스트**
8. **불확실 항목** - 추가 논의 필요 사항
9. **README 초안** - 프로젝트 README 마크다운

## PDF 내보내기

분석 결과를 PDF로 저장할 수 있습니다. 섹션별 선택 가능하며 한글 폰트(Noto Sans KR)를 지원합니다.

## 테스트

```bash
# 프론트엔드
cd frontend && npm run test:run

# 백엔드 (Docker 또는 시스템 Gradle 필요)
cd backend && gradle test --no-daemon
```
