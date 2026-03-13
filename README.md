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
cd backend
./gradlew bootRun
# http://localhost:8080
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
| AI | Anthropic Claude |
| CI/CD | GitHub Actions |

## 환경 변수 (운영 환경)

```bash
SPRING_PROFILES_ACTIVE=prod
ANTHROPIC_API_KEY=your-key-here
DB_URL=jdbc:postgresql://host:5432/prdbreaker
DB_USERNAME=username
DB_PASSWORD=password
```

## 결과물 (8개 섹션)

1. **기능 목록** - 우선순위별 기능 분류
2. **유저 스토리** - 인수 기준 포함
3. **TODO** - 카테고리, 우선순위, 예상 공수
4. **API 초안** - RESTful 엔드포인트 설계
5. **DB 초안** - 테이블 스키마
6. **테스트 체크리스트**
7. **릴리즈 체크리스트**
8. **불확실 항목** - 추가 논의 필요 사항

## 테스트

```bash
# 백엔드
cd backend && ./gradlew test

# 프론트엔드
cd frontend && npm run test:run
```
